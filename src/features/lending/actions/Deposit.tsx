import { BigNumber } from '@ethersproject/bignumber'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { NATIVE, WNATIVE } from 'sdk'
import { Button } from 'components/Button'
import UnderworldCooker from 'entities/UnderworldCooker'
import { Direction, TransactionReview } from 'entities/TransactionReview'
import { Warnings } from 'entities/Warnings'
import { formatNumber } from 'functions/format'
import { e10, ZERO } from 'functions/math'
import { useCoffinBoxContract } from 'hooks'
import { useCurrency } from 'hooks/Tokens'
import { useActiveWeb3React } from 'services/web3'
import { useETHBalances } from 'state/wallet/hooks'
import React, { useState } from 'react'

import { UnderworldApproveButton, TokenApproveButton } from '../components/Button'
import SmartNumberInput from '../components/SmartNumberInput'
import TransactionReviewList from '../components/TransactionReview'
import WarningsList from '../components/WarningsList'
import AssetInput from 'components/AssetInput'
import Typography from 'components/Typography'

export default function Deposit({ pair }: any): JSX.Element {
  const { account, chainId } = useActiveWeb3React()
  const assetToken = useCurrency(pair.asset.address) || undefined
  const coffinBoxContract = useCoffinBoxContract()
  const { i18n } = useLingui()

  // State
  // const [useCoffin, setUseCoffin] = useState<boolean>(Number(pair.asset.coffinBalance) > 0)
  const [useCoffin, setUseCoffin] = useState<boolean>(false)
  const [value, setValue] = useState('')

  // Calculated
  // @ts-ignore TYPE NEEDS FIXING
  const assetNative = WNATIVE[chainId].address === pair.asset.address

  // @ts-ignore TYPE NEEDS FIXING
  const ethBalance = useETHBalances(assetNative ? [account] : [])

  const balance = useCoffin
    ? pair.asset.coffinBalance
    : assetNative
      ? //  @ts-ignore TYPE NEEDS FIXING
      BigNumber.from(ethBalance[account]?.quotient.toString() || 0)
      : pair.asset.balance

  const max = useCoffin
    ? pair.asset.coffinBalance
    : assetNative
      ? // @ts-ignore TYPE NEEDS FIXING
      BigNumber.from(ethBalance[account]?.quotient.toString() || 0)
      : pair.asset.balance

  const warnings = new Warnings()

  // warnings.add(
  //   balance?.lt(value.toBigNumber(pair.asset.tokenInfo.decimals)),
  //   i18n._(
  //     t`Please make sure your ${useCoffin ? 'CoffinBox' : 'wallet'} balance is sufficient to deposit and then try again.`
  //   ),
  //   true
  // )

  const transactionReview = new TransactionReview()

  if (value && !warnings.broken) {
    const amount = Number(value).toString().toBigNumber(pair.asset.tokenInfo.decimals) //.toFixed(4)
    const newUserAssetAmount = pair.currentUserAssetAmount.value.div(pair.asset.tokenInfo.decimals).add(amount)//.toBigNumber(pair.asset.tokenInfo.decimals))
    transactionReview.addTokenAmount(
      i18n._(t`Balance`),
      pair.currentUserAssetAmount.value,
      BigNumber.from(pair.currentUserAssetAmount.value).add(amount),
      pair.asset
    )
    transactionReview.addUSD(i18n._(t`Balance USD`),
      pair.currentUserAssetAmount.value,
      newUserAssetAmount.add(pair.currentUserAssetAmount.value),
      pair.asset)
    const newUtilization
      // = e10(18).mulDiv(pair.currentBorrowAmount.value, pair.currentAllAssets.value).add(amount)
      = 1e18 * Number(pair.currentBorrowAmount.value) / Number(pair.currentAllAssets.value) + Number(amount) //.toString()
    //transactionReview.addPercentage(i18n._(t`Borrowed`), BigNumber.from(pair.utilization.value || 0), BigNumber.from(newUtilization))
    if (pair.currentExchangeRate.isZero()) {
      transactionReview.add(
        'Exchange Rate',
        formatNumber(
          pair.currentExchangeRate.toFixed(18 + pair.collateral.tokenInfo.decimals - pair.asset.tokenInfo.decimals)
        ),
        formatNumber(
          pair.oracleExchangeRate.toFixed(18 + pair.collateral.tokenInfo.decimals - pair.asset.tokenInfo.decimals)
        ),
        Direction.UP
      )
    }
    transactionReview.addPercentage(i18n._(t`Supply APR`), pair.supplyAPR.value, pair.currentSupplyAPR.value)
  }

  // Handlers
  async function onExecute(cooker: UnderworldCooker): Promise<string> {
    if (pair.currentExchangeRate.isZero()) {
      cooker.updateExchangeRate(false, ZERO, ZERO)
    }
    const amount = value.toBigNumber(pair.asset.tokenInfo.decimals)

    const deadBalance = await coffinBoxContract.balanceOf(
      pair.asset.address,
      '0x000000000000000000000000000000000000dead'
    )

    cooker.addAsset(amount, useCoffin, deadBalance.isZero())

    return `${i18n._(t`Deposit`)} ${pair.asset.tokenInfo.symbol}`
  }

  return (
    <>      <AssetInput
        size="sm"
        id="add-collateral-input"
        value={value}
        currency={assetToken}
        onChange={setValue}
        className="!mt-0"
        showMax={true}
        spendFromWallet={!useCoffin}
      />
      <WarningsList warnings={warnings} />
      <TransactionReviewList transactionReview={transactionReview} />
      <UnderworldApproveButton
        color="blue"
        content={(onCook: any) => (
          <TokenApproveButton value={value} token={assetToken} needed={!useCoffin}>
            <Button
              onClick={() => onCook(pair, onExecute)}
              disabled={Number(value) <= 0 || warnings.broken}
              fullWidth={true}
            >
              {i18n._(t`Deposit`)}
            </Button>
          </TokenApproveButton>
        )}
      />
    </>
  )
}