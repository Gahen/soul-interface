import { ApprovalState, useApproveCallbackFromTrade } from '../../../hooks/useApproveCallback'
import { BottomGrouping, SwapCallbackError } from '../../../features/swap/styleds'
import { AutoRow, RowBetween } from '../../../components/Row'
import { ButtonConfirmed, ButtonError } from '../../../components/Button'
import { Currency, CurrencyAmount, JSBI, Token, TradeType, Trade as V2Trade, SOUL_ADDRESS } from '../../../sdk'
import Column, { AutoColumn } from '../../../components/Column'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useAllTokens, useCurrency } from '../../../hooks/Tokens'
import {
  useDefaultsFromURLSearch,
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useSwapState,
} from '../../../state/swap/hooks'
import { useExpertModeManager, useUserSingleHopOnly, useUserTransactionTTL } from '../../../state/user/hooks'
import useWrapCallback, { WrapType } from '../../../hooks/useWrapCallback'

import AddressInputPanel from '../../../components/AddressInputPanel'
import Button from '../../../components/Button'
import ConfirmSwapModal from '../../../features/swap/ConfirmSwapModal'
import CurrencyInputPanel from '../../../components/CurrencyInputPanel'
import { Field } from '../../../state/swap/actions'
import Head from 'next/head'
import Loader from '../../../components/Loader'
import SwapBanner from '../../../components/SwapBanner'
import Lottie from 'lottie-react'
import ProgressSteps from '../../../components/ProgressSteps'
import ReactGA from 'react-ga'
// import SwapHeader from '../../../components/ExchangeHeader'
import SwapHeader from '../../../features/trade/Header'
import TokenWarningModal from '../../../modals/TokenWarningModal'
import TradePrice from '../../../features/swap/TradePrice'
import UnsupportedCurrencyFooter from '../../../features/swap/UnsupportedCurrencyFooter'
import Web3Connect from '../../../components/Web3Connect'
import { computeFiatValuePriceImpact } from '../../../functions/trade'
import confirmPriceImpactWithoutFee from '../../../features/swap/confirmPriceImpactWithoutFee'
import { maxAmountSpend } from '../../../functions/currency'
import swapArrowsAnimationData from '../../../animation/swap-arrows.json'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { useActiveWeb3React } from '../../../hooks/useActiveWeb3React'
import useENSAddress from '../../../hooks/useENSAddress'
import useIsArgentWallet from '../../../hooks/useIsArgentWallet'
import { useIsSwapUnsupported } from '../../../hooks/useIsSwapUnsupported'
import { useRouter } from 'next/router'
import { useSwapCallback } from '../../../hooks/useSwapCallback'
import { useUSDCValue } from '../../../hooks/useUSDCPrice'
import { warningSeverity } from '../../../functions/prices'
import DoubleGlowShadowV2 from '../../../components/DoubleGlowShadowV2'
import Image from 'next/image'
// import SoulLogo from '../../../components/SoulLogo'
import { CenterScreen } from '../../../components/ReusableStyles'
import Alert from '../../../components/Alert'

export default function Swap() {
  const { i18n } = useLingui()

  const loadedUrlParams = useDefaultsFromURLSearch()

  // token warning stuff
  const [loadedInputCurrency, loadedOutputCurrency] = [
    useCurrency(loadedUrlParams?.inputCurrencyId),
    useCurrency(loadedUrlParams?.outputCurrencyId),
  ]

  const [dismissTokenWarning, setDismissTokenWarning] = useState<boolean>(false)
  const urlLoadedTokens: Token[] = useMemo(
    () => [loadedInputCurrency, loadedOutputCurrency]?.filter((c): c is Token => c?.isToken ?? false) ?? [],
    [loadedInputCurrency, loadedOutputCurrency]
  )
  const handleConfirmTokenWarning = useCallback(() => {
    setDismissTokenWarning(true)
  }, [])

  // dismiss warning if all imported tokens are in active lists
  const defaultTokens = useAllTokens()
  const importTokensNotInDefault =
    urlLoadedTokens &&
    urlLoadedTokens.filter((token: Token) => {
      return !Boolean(token.address in defaultTokens)
    })

  const { account } = useActiveWeb3React()

  // for expert mode
  const [isExpertMode] = useExpertModeManager()

  // get custom setting values for user
  const [ttl] = useUserTransactionTTL()

  // swap state
  const { independentField, typedValue, recipient } = useSwapState()
  const {
    v2Trade,
    currencyBalances,
    parsedAmount,
    currencies,
    inputError: swapInputError,
    allowedSlippage,
  } = useDerivedSwapInfo(false)

  const {
    wrapType,
    execute: onWrap,
    inputError: wrapInputError,
  } = useWrapCallback(currencies[Field.INPUT], currencies[Field.OUTPUT], typedValue)
  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE
  const { address: recipientAddress } = useENSAddress(recipient)

  const trade = showWrap ? undefined : v2Trade

  const parsedAmounts = useMemo(
    () =>
      showWrap
        ? {
            [Field.INPUT]: parsedAmount,
            [Field.OUTPUT]: parsedAmount,
          }
        : {
            [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
            [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount,
          },
    [independentField, parsedAmount, showWrap, trade]
  )

  const fiatValueInput = useUSDCValue(parsedAmounts[Field.INPUT])
  const fiatValueOutput = useUSDCValue(parsedAmounts[Field.OUTPUT])
  const priceImpact = computeFiatValuePriceImpact(fiatValueInput, fiatValueOutput)

  const { onSwitchTokens, onCurrencySelection, onUserInput, onChangeRecipient } = useSwapActionHandlers()

  const isValid = !swapInputError

  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value)
    },
    [onUserInput]
  )

  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(Field.OUTPUT, value)
    },
    [onUserInput]
  )

  // modal and loading
  const [{ showConfirm, tradeToConfirm, swapErrorMessage, attemptingTxn, txHash }, setSwapState] = useState<{
    showConfirm: boolean
    tradeToConfirm: V2Trade<Currency, Currency, TradeType> | undefined
    attemptingTxn: boolean
    swapErrorMessage: string | undefined
    txHash: string | undefined
  }>({
    showConfirm: false,
    tradeToConfirm: undefined,
    attemptingTxn: false,
    swapErrorMessage: undefined,
    txHash: undefined,
  })

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: showWrap
      ? parsedAmounts[independentField]?.toExact() ?? ''
      : parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  }

  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] && currencies[Field.OUTPUT] && parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0))
  )

  const routeNotFound = !trade?.route

  // check whether the user has approved the router on the input token
  const [approvalState, approveCallback] = useApproveCallbackFromTrade(trade, allowedSlippage, false)

  const signatureData = undefined

  // const {
  //   state: signatureState,
  //   signatureData,
  //   gatherPermitSignature,
  // } = useERC20PermitFromTrade(trade, allowedSlippage)

  const handleApprove = useCallback(async () => {
    await approveCallback()
    // if (signatureState === UseERC20PermitState.NOT_SIGNED && gatherPermitSignature) {
    //   try {
    //     await gatherPermitSignature()
    //   } catch (error) {
    //     // try to approve if gatherPermitSignature failed for any reason other than the user rejecting it
    //     if (error?.code !== 4001) {
    //       await approveCallback()
    //     }
    //   }
    // } else {
    //   await approveCallback()
    // }
  }, [approveCallback])
  // }, [approveCallback, gatherPermitSignature, signatureState])

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approvalState === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    }
  }, [approvalState, approvalSubmitted])

  const maxInputAmount: CurrencyAmount<Currency> | undefined = maxAmountSpend(currencyBalances[Field.INPUT])
  const showMaxButton = Boolean(maxInputAmount?.greaterThan(0) && !parsedAmounts[Field.INPUT]?.equalTo(maxInputAmount))

  // the callback to execute the swap
  const { callback: swapCallback, error: swapCallbackError } = useSwapCallback(
    trade,
    allowedSlippage,
    recipient,
    signatureData,
    false ? ttl : undefined
  )

  const [singleHopOnly] = useUserSingleHopOnly()

  const handleSwap = useCallback(() => {
    if (!swapCallback) {
      return
    }
    if (priceImpact && !confirmPriceImpactWithoutFee(priceImpact)) {
      return
    }
    setSwapState({
      attemptingTxn: true,
      tradeToConfirm,
      showConfirm,
      swapErrorMessage: undefined,
      txHash: undefined,
    })
    swapCallback()
      .then((hash) => {
        setSwapState({
          attemptingTxn: false,
          tradeToConfirm,
          showConfirm,
          swapErrorMessage: undefined,
          txHash: hash,
        })

        ReactGA.event({
          category: 'Swap',
          action:
            recipient === null
              ? 'Swap w/o Send'
              : (recipientAddress ?? recipient) === account
              ? 'Swap w/o Send + recipient'
              : 'Swap w/ Send',
          label: [
            trade?.inputAmount?.currency?.symbol,
            trade?.outputAmount?.currency?.symbol,
            singleHopOnly ? 'SH' : 'MH',
          ].join('/'),
        })

        ReactGA.event({
          category: 'Routing',
          action: singleHopOnly ? 'Swap with multihop disabled' : 'Swap with multihop enabled',
        })
      })
      .catch((error) => {
        setSwapState({
          attemptingTxn: false,
          tradeToConfirm,
          showConfirm,
          swapErrorMessage: error.message,
          txHash: undefined,
        })
      })
  }, [
    swapCallback,
    priceImpact,
    tradeToConfirm,
    showConfirm,
    recipient,
    recipientAddress,
    account,
    trade?.inputAmount?.currency?.symbol,
    trade?.outputAmount?.currency?.symbol,
    singleHopOnly,
  ])

  // errors
  const [showInverted, setShowInverted] = useState<boolean>(false)

  // warnings on slippage
  // const priceImpactSeverity = warningSeverity(priceImpactWithoutFee);
  const priceImpactSeverity = useMemo(() => {
    const executionPriceImpact = trade?.priceImpact
    return warningSeverity(
      executionPriceImpact && priceImpact
        ? executionPriceImpact.greaterThan(priceImpact)
          ? executionPriceImpact
          : priceImpact
        : executionPriceImpact ?? priceImpact
    )
  }, [priceImpact, trade])

  const isArgentWallet = useIsArgentWallet()

  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  const showApproveFlow =
    !isArgentWallet &&
    !swapInputError &&
    (approvalState === ApprovalState.NOT_APPROVED ||
      approvalState === ApprovalState.PENDING ||
      (approvalSubmitted && approvalState === ApprovalState.APPROVED)) &&
    !(priceImpactSeverity > 3 && !isExpertMode)

  const handleConfirmDismiss = useCallback(() => {
    setSwapState({
      showConfirm: false,
      tradeToConfirm,
      attemptingTxn,
      swapErrorMessage,
      txHash,
    })
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.INPUT, '')
    }
  }, [attemptingTxn, onUserInput, swapErrorMessage, tradeToConfirm, txHash])

  const handleAcceptChanges = useCallback(() => {
    setSwapState({
      tradeToConfirm: trade,
      swapErrorMessage,
      txHash,
      attemptingTxn,
      showConfirm,
    })
  }, [attemptingTxn, showConfirm, swapErrorMessage, trade, txHash])

  const handleInputSelect = useCallback(
    (inputCurrency) => {
      setApprovalSubmitted(false) // reset 2 step UI for approvals
      onCurrencySelection(Field.INPUT, inputCurrency)
    },
    [onCurrencySelection]
  )

  const handleMaxInput = useCallback(() => {
    maxInputAmount && onUserInput(Field.INPUT, maxInputAmount.toExact())
  }, [maxInputAmount, onUserInput])

  const handleOutputSelect = useCallback(
    (outputCurrency) => onCurrencySelection(Field.OUTPUT, outputCurrency),
    [onCurrencySelection]
  )

  const swapIsUnsupported = useIsSwapUnsupported(currencies?.INPUT, currencies?.OUTPUT)

  const [animateSwapArrows, setAnimateSwapArrows] = useState<boolean>(false)

  return (
    <>
      <Head>
        <title>{i18n._(t`SoulSwap`)}</title>
        <meta
          key="description"
          name="description"
          content="Soul allows for swapping of compatible tokens on Fantom."
        />
      </Head>
      <SwapBanner />
      <TokenWarningModal
        isOpen={importTokensNotInDefault.length > 0 && !dismissTokenWarning}
        tokens={importTokensNotInDefault}
        onConfirm={handleConfirmTokenWarning}
      />
      {/* <SoulLogo />       */}
      <br />
      <DoubleGlowShadowV2 opacity="0.6">
        <div id="swap-page" className="w-full max-w-2xl p-4 space-y-4 rounded bg-dark-900 z-1">
          <SwapHeader
            input={currencies[Field.INPUT]}
            output={currencies[Field.OUTPUT]}
            allowedSlippage={allowedSlippage}
          />
          <ConfirmSwapModal
            isOpen={showConfirm}
            trade={trade}
            originalTrade={tradeToConfirm}
            onAcceptChanges={handleAcceptChanges}
            attemptingTxn={attemptingTxn}
            txHash={txHash}
            recipient={recipient}
            allowedSlippage={allowedSlippage}
            onConfirm={handleSwap}
            swapErrorMessage={swapErrorMessage}
            onDismiss={handleConfirmDismiss}
            minerBribe={undefined}
          />
          <div>
            <CurrencyInputPanel
              label={
                independentField === Field.OUTPUT && !showWrap ? i18n._(t``) : i18n._(t``)
                // independentField === Field.OUTPUT && !showWrap ? i18n._(t`Swap From (est.):`) : i18n._(t`Swap From:`)
              }
              value={formattedAmounts[Field.INPUT]}
              showMaxButton={showMaxButton}
              currency={currencies[Field.INPUT]}
              onUserInput={handleTypeInput}
              onMax={handleMaxInput}
              fiatValue={fiatValueInput ?? undefined}
              onCurrencySelect={handleInputSelect}
              otherCurrency={currencies[Field.OUTPUT]}
              showCommonBases={true}
              id="swap-currency-input"
            />
            <AutoColumn justify="space-between" className="py-3">
              <AutoRow justify={isExpertMode ? 'space-between' : 'flex-start'} style={{ padding: '0 1rem' }}>
                <button
                  className="z-10 -mt-6 -mb-6 rounded-full"
                  onClick={() => {
                    setApprovalSubmitted(false) // reset 2 step UI for approvals
                    onSwitchTokens()
                  }}
                >
                  <div className="rounded-full bg-dark-900 p-3px">
                    <div
                      className="p-3 rounded-full bg-dark-800 hover:bg-dark-700"
                      onMouseEnter={() => setAnimateSwapArrows(true)}
                      onMouseLeave={() => setAnimateSwapArrows(false)}
                    >
                      <Lottie
                        animationData={swapArrowsAnimationData}
                        autoplay={animateSwapArrows}
                        loop={false}
                        style={{ width: 32, height: 32 }}
                      />
                    </div>
                  </div>
                </button>
                {isExpertMode ? (
                  recipient === null && !showWrap ? (
                    <Button variant="link" size="none" id="add-recipient-button" onClick={() => onChangeRecipient('')}>
                      + Add Recipient (optional)
                    </Button>
                  ) : (
                    <Button
                      variant="link"
                      size="none"
                      id="remove-recipient-button"
                      onClick={() => onChangeRecipient(null)}
                    >
                      - {i18n._(t`Remove Recipient`)}
                    </Button>
                  )
                ) : null}
              </AutoRow>
            </AutoColumn>
            <div>
              <CurrencyInputPanel
                value={formattedAmounts[Field.OUTPUT]}
                onUserInput={handleTypeOutput}
                label={independentField === Field.INPUT && !showWrap ? i18n._(t``) : i18n._(t``)}
                // label={independentField === Field.INPUT && !showWrap ? i18n._(t`Swap To (est.):`) : i18n._(t`Swap To:`)}
                showMaxButton={false}
                hideBalance={false}
                fiatValue={fiatValueOutput ?? undefined}
                priceImpact={priceImpact}
                currency={currencies[Field.OUTPUT]}
                onCurrencySelect={handleOutputSelect}
                otherCurrency={currencies[Field.INPUT]}
                showCommonBases={true}
                id="swap-currency-output"
              />
              {Boolean(trade) && (
                <div className="p-1 -mt-2  rounded-b-md bg-dark-800">
                  <TradePrice
                    price={trade?.executionPrice}
                    showInverted={showInverted}
                    setShowInverted={setShowInverted}
                    className="bg-dark-900"
                    trade={trade}
                  />
                </div>
              )}
            </div>
          </div>

          {recipient !== null && !showWrap && (
            <AddressInputPanel id="recipient" value={recipient} onChange={onChangeRecipient} />
          )}

          <BottomGrouping>
            {swapIsUnsupported ? (
              <Button color="red" size="lg" disabled>
                {i18n._(t`Unsupported Asset`)}
              </Button>
            ) : !account ? (
              <Web3Connect size="lg" color="gradient" className="w-full" />
            ) : showWrap ? (
              <Button
                color="gradient"
                size="lg"
                className="font-bold text-light"
                disabled={Boolean(wrapInputError)}
                onClick={onWrap}
              >
                {wrapInputError ??
                  (wrapType === WrapType.WRAP
                    ? i18n._(t`Wrap`)
                    : wrapType === WrapType.UNWRAP
                    ? i18n._(t`Unwrap`)
                    : null)}
              </Button>
            ) : routeNotFound && userHasSpecifiedInputOutput ? (
              <div style={{ textAlign: 'center' }}>
                <div className="mb-1">{i18n._(t`Insufficient liquidity for this trade`)}</div>
                {singleHopOnly && <div className="mb-1">{i18n._(t`Try enabling multi-hop trades`)}</div>}
              </div>
            ) : showApproveFlow ? (
              <RowBetween>
                {approvalState !== ApprovalState.APPROVED && (
                  <ButtonConfirmed
                    onClick={handleApprove}
                    disabled={approvalState !== ApprovalState.NOT_APPROVED || approvalSubmitted}
                  >
                    {approvalState === ApprovalState.PENDING ? (
                      <AutoRow gap="6px" justify="center">
                        Approving <Loader stroke="white" />
                      </AutoRow>
                    ) : (
                      i18n._(t`Approve ${currencies[Field.INPUT]?.symbol}`)
                    )}
                  </ButtonConfirmed>
                )}
                {approvalState === ApprovalState.APPROVED && (
                  <ButtonError
                    className="font-bold text-light"
                    onClick={() => {
                      if (isExpertMode) {
                        handleSwap()
                      } else {
                        setSwapState({
                          tradeToConfirm: trade,
                          attemptingTxn: false,
                          swapErrorMessage: undefined,
                          showConfirm: true,
                          txHash: undefined,
                        })
                      }
                    }}
                    style={{
                      width: '100%',
                    }}
                    id="swap-button"
                    disabled={
                      !isValid || approvalState !== ApprovalState.APPROVED || (priceImpactSeverity > 3 && !isExpertMode)
                    }
                    error={isValid && priceImpactSeverity > 2}
                  >
                    {priceImpactSeverity > 3 && !isExpertMode
                      ? i18n._(t`Price Impact High`)
                      : priceImpactSeverity > 2
                      ? i18n._(t`Swap Anyway`)
                      : i18n._(t`Swap`)}
                  </ButtonError>
                )}
              </RowBetween>
            ) : (
              <ButtonError
                onClick={() => {
                  if (isExpertMode) {
                    handleSwap()
                  } else {
                    setSwapState({
                      tradeToConfirm: trade,
                      attemptingTxn: false,
                      swapErrorMessage: undefined,
                      showConfirm: true,
                      txHash: undefined,
                    })
                  }
                }}
                id="swap-button"
                disabled={!isValid || (priceImpactSeverity > 3 && !isExpertMode) || !!swapCallbackError}
                error={isValid && priceImpactSeverity > 2 && !swapCallbackError}
              >
                {swapInputError
                  ? swapInputError
                  : priceImpactSeverity > 3 && !isExpertMode
                  ? i18n._(t`Price Impact Too High`)
                  : priceImpactSeverity > 2
                  ? i18n._(t`Swap Anyway`)
                  : i18n._(t`Swap`)}
              </ButtonError>
            )}
            {showApproveFlow && (
              <Column style={{ marginTop: '1rem' }}>
                <ProgressSteps steps={[approvalState === ApprovalState.APPROVED]} />
              </Column>
            )}
            {isExpertMode && swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
          </BottomGrouping>
          {!swapIsUnsupported ? null : (
            <UnsupportedCurrencyFooter show={swapIsUnsupported} currencies={[currencies.INPUT, currencies.OUTPUT]} />
          )}
        </div>
        <AutoColumn justify="space-between" className="py-5">
          <iframe 
                frameBorder={"none"}
                title={"HOME"}
                src={"https://analytics.soulswap.finance/tokens"}
                height={"480" }
                width={"100%"}
            />
        </AutoColumn>
      </DoubleGlowShadowV2>

    </>
  )
}
