import { Currency, CurrencyAmount, JSBI, Percent, Token, TradeType, Trade } from '../../../sdk'
import { DAI, SOUL, USDC } from '../../../constants/tokens'
import { useMemo, useState } from 'react'

import { splitSignature } from 'ethers/lib/utils'
import { useActiveWeb3React, useEIP2612Contract } from '../../../hooks'
import useIsArgentWallet from '../../../hooks/useIsArgentWallet'
import { useSingleCallResult } from '../../../state/multicall/hooks'
import useTransactionDeadline from '../../../hooks/useTransactionDeadline'

enum PermitType {
  AMOUNT = 1,
  ALLOWED = 2,
}

// 20 minutes to submit after signing
const PERMIT_VALIDITY_BUFFER = 20 * 60

interface PermitInfo {
  type: PermitType
  name: string
  // version is optional, and if omitted, will not be included in the domain
  version?: string
}

// todo: read this information from extensions on token lists or elsewhere (permit registry?)
const PERMITTABLE_TOKENS: {
  [chainId: number]: {
    [checksummedTokenAddress: string]: PermitInfo
  }
} = {
  [1]: {
    [USDC.address]: { type: PermitType.AMOUNT, name: 'USD Coin', version: '2' },
    [DAI.address]: {
      type: PermitType.ALLOWED,
      name: 'Dai Stablecoin',
      version: '1',
    },
    // [SOUL[1].address]: { type: PermitType.AMOUNT, name: 'SoulPower' },
  },
  // [4]: {
  //   ['0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735']: {
  //     type: PermitType.ALLOWED,
  //     name: 'Dai Stablecoin',
  //     version: '1',
  //   },
  //   // [SOUL[4].address]: { type: PermitType.AMOUNT, name: 'SoulPower' },
  // },
  // [3]: {
  //   [SOUL[3].address]: { type: PermitType.AMOUNT, name: 'SoulPower' },
  //   ['0x07865c6E87B9F70255377e024ace6630C1Eaa37F']: {
  //     type: PermitType.AMOUNT,
  //     name: 'USD Coin',
  //     version: '2',
  //   },
  // },
  // [5]: {
  //   [SOUL[5].address]: { type: PermitType.AMOUNT, name: 'SoulPower' },
  // },
  // [42]: {
  //   [SOUL[42].address]: { type: PermitType.AMOUNT, name: 'SoulPower' },
  // },
  [250]: {
    [SOUL[250].address]: { type: PermitType.AMOUNT, name: 'SoulPower' },
  },
  [4002]: {
    [SOUL[4002].address]: { type: PermitType.AMOUNT, name: 'SoulPower' },
  },
}

export enum UseERC20PermitState {
  // returned for any reason, e.g. it is an argent wallet, or the currency does not support it
  NOT_APPLICABLE,
  LOADING,
  NOT_SIGNED,
  SIGNED,
}

interface BaseSignatureData {
  v: number
  r: string
  s: string
  deadline: number
  nonce: number
  owner: string
  spender: string
  chainId: number
  tokenAddress: string
  permitType: PermitType
}

export interface StandardSignatureData extends BaseSignatureData {
  amount: string
}

export interface AllowedSignatureData extends BaseSignatureData {
  allowed: true
}

export type SignatureData = StandardSignatureData | AllowedSignatureData

const EIP712_DOMAIN_TYPE = [
  { name: 'name', type: 'string' },
  { name: 'version', type: 'string' },
  { name: 'chainId', type: 'uint256' },
  { name: 'verifyingContract', type: 'address' },
]

const EIP712_DOMAIN_TYPE_NO_VERSION = [
  { name: 'name', type: 'string' },
  { name: 'chainId', type: 'uint256' },
  { name: 'verifyingContract', type: 'address' },
]

const EIP2612_TYPE = [
  { name: 'owner', type: 'address' },
  { name: 'spender', type: 'address' },
  { name: 'value', type: 'uint256' },
  { name: 'nonce', type: 'uint256' },
  { name: 'deadline', type: 'uint256' },
]

const PERMIT_ALLOWED_TYPE = [
  { name: 'holder', type: 'address' },
  { name: 'spender', type: 'address' },
  { name: 'nonce', type: 'uint256' },
  { name: 'expiry', type: 'uint256' },
  { name: 'allowed', type: 'bool' },
]

export function useERC20Permit(
  currencyAmount: CurrencyAmount<Currency> | null | undefined,
  spender: string | null | undefined,
  overridePermitInfo: PermitInfo | undefined | null
): {
  signatureData: SignatureData | null
  state: UseERC20PermitState
  gatherPermitSignature: null | (() => Promise<void>)
} {
  const { account, chainId, library } = useActiveWeb3React()
  const transactionDeadline = useTransactionDeadline()
  const tokenAddress = currencyAmount?.currency?.isToken ? currencyAmount.currency.address : undefined
  const eip2612Contract = useEIP2612Contract(tokenAddress)
  const isArgentWallet = useIsArgentWallet()
  const nonceInputs = useMemo(() => [account ?? undefined], [account])
  const tokenNonceState = useSingleCallResult(eip2612Contract, 'nonces', nonceInputs)
  const permitInfo =
    overridePermitInfo ?? (chainId && tokenAddress ? PERMITTABLE_TOKENS[chainId]?.[tokenAddress] : undefined)

  const [signatureData, setSignatureData] = useState<SignatureData | null>(null)

  return useMemo(() => {
    if (
      isArgentWallet ||
      !currencyAmount ||
      !eip2612Contract ||
      !account ||
      !chainId ||
      !transactionDeadline ||
      !library ||
      !tokenNonceState.valid ||
      !tokenAddress ||
      !spender ||
      !permitInfo
    ) {
      return {
        state: UseERC20PermitState.NOT_APPLICABLE,
        signatureData: null,
        gatherPermitSignature: null,
      }
    }

    const nonceNumber = tokenNonceState.result?.[0]?.toNumber()
    if (tokenNonceState.loading || typeof nonceNumber !== 'number') {
      return {
        state: UseERC20PermitState.LOADING,
        signatureData: null,
        gatherPermitSignature: null,
      }
    }

    const isSignatureDataValid =
      signatureData &&
      signatureData.owner === account &&
      signatureData.deadline >= transactionDeadline.toNumber() &&
      signatureData.tokenAddress === tokenAddress &&
      signatureData.nonce === nonceNumber &&
      signatureData.spender === spender &&
      ('allowed' in signatureData || JSBI.equal(JSBI.BigInt(signatureData.amount), currencyAmount.quotient))

    return {
      state: isSignatureDataValid ? UseERC20PermitState.SIGNED : UseERC20PermitState.NOT_SIGNED,
      signatureData: isSignatureDataValid ? signatureData : null,
      gatherPermitSignature: async function gatherPermitSignature() {
        const allowed = permitInfo.type === PermitType.ALLOWED
        const signatureDeadline = transactionDeadline.toNumber() + PERMIT_VALIDITY_BUFFER
        const value = currencyAmount.quotient.toString()

        const message = allowed
          ? {
              holder: account,
              spender,
              allowed,
              nonce: nonceNumber,
              expiry: signatureDeadline,
            }
          : {
              owner: account,
              spender,
              value,
              nonce: nonceNumber,
              deadline: signatureDeadline,
            }
        const domain = permitInfo.version
          ? {
              name: permitInfo.name,
              version: permitInfo.version,
              verifyingContract: tokenAddress,
              chainId,
            }
          : {
              name: permitInfo.name,
              verifyingContract: tokenAddress,
              chainId,
            }
        const data = JSON.stringify({
          types: {
            EIP712Domain: permitInfo.version ? EIP712_DOMAIN_TYPE : EIP712_DOMAIN_TYPE_NO_VERSION,
            Permit: allowed ? PERMIT_ALLOWED_TYPE : EIP2612_TYPE,
          },
          domain,
          primaryType: 'Permit',
          message,
        })

        return library
          .send('eth_signTypedData_v4', [account, data])
          .then(splitSignature)
          .then((signature) => {
            setSignatureData({
              v: signature.v,
              r: signature.r,
              s: signature.s,
              deadline: signatureDeadline,
              ...(allowed ? { allowed } : { amount: value }),
              nonce: nonceNumber,
              chainId,
              owner: account,
              spender,
              tokenAddress,
              permitType: permitInfo.type,
            })
          })
      },
    }
  }, [
    currencyAmount,
    eip2612Contract,
    account,
    chainId,
    isArgentWallet,
    transactionDeadline,
    library,
    tokenNonceState.loading,
    tokenNonceState.valid,
    tokenNonceState.result,
    tokenAddress,
    spender,
    permitInfo,
    signatureData,
  ])
}

const REMOVE_V2_LIQUIDITY_PERMIT_INFO: PermitInfo = {
  version: '1',
  name: 'SoulSwap LP',
  type: PermitType.AMOUNT,
}

export function useV2LiquidityTokenPermit(
  liquidityAmount: CurrencyAmount<Token> | null | undefined,
  spender: string | null | undefined
) {
  return useERC20Permit(liquidityAmount, spender, REMOVE_V2_LIQUIDITY_PERMIT_INFO)
}

export function useERC20PermitFromTrade(
  trade: Trade<Currency, Currency, TradeType> | undefined,
  allowedSlippage: Percent
) {
  const { chainId } = useActiveWeb3React()

  const amountToApprove = useMemo(
    () => (trade ? trade.maximumAmountIn(allowedSlippage) : undefined),
    [trade, allowedSlippage]
  )

  return useERC20Permit(
    amountToApprove,
    // v2 router does not support
    trade instanceof Trade ? undefined : trade,
    null
  )
}
