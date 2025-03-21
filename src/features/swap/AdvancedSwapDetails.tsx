import {
  ChainId,
  Currency,
  Ether,
  Percent,
  TradeType,
  Trade,
  CurrencyAmount,
} from '../../sdk'
import React, { useMemo } from 'react'
import { RowBetween, RowFixed } from '../../components/Row'

import { ANALYTICS_URL } from '../../constants'
import ExternalLink from '../../components/ExternalLink'
import FormattedPriceImpact from './FormattedPriceImpact'
import QuestionHelper from '../../components/QuestionHelper'
import SwapRoute from './SwapRoute'
import { computeRealizedLPFeePercent } from '../../functions/prices'
import { t } from '@lingui/macro'
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React'
import { useLingui } from '@lingui/react'
import { formatNumberScale } from '../../functions'

export interface AdvancedSwapDetailsProps {
  trade?: Trade<Currency, Currency, TradeType>
  allowedSlippage: Percent
  minerBribe?: string
}

export function AdvancedSwapDetails({ trade, allowedSlippage, minerBribe }: AdvancedSwapDetailsProps) {
  const { i18n } = useLingui()

  const { chainId } = useActiveWeb3React()

  const { realizedLPFee, priceImpact } = useMemo(() => {
    if (!trade) return { realizedLPFee: undefined, priceImpact: undefined }

    const realizedLpFeePercent = computeRealizedLPFeePercent(trade)
    const realizedLPFee = trade.inputAmount.multiply(realizedLpFeePercent)

    const priceImpact = trade.priceImpact.subtract(realizedLpFeePercent)

    return { priceImpact, realizedLPFee }
  }, [trade])

  return !trade ? null : (
    <div className="flex flex-col space-y-2">
      <div className="flex flex-row items-center justify-between">
        <span className="flex items-center">
          <div className="text-sm text-secondary">{i18n._(t`Route`)}</div>
          <QuestionHelper text={i18n._(t`Routing through these tokens resulted in the best price for your trade.`)} />
        </span>
        <SwapRoute trade={trade} />
      </div>

      <RowBetween>
        <RowFixed>
          <div className="text-sm text-secondary">
            {trade.tradeType === TradeType.EXACT_INPUT ? i18n._(t`Min. Received`) : i18n._(t`Maximum sent`)}
          </div>
          <QuestionHelper
            text={i18n._(
              t`Your transaction will revert if there is a large, unfavorable price movement before it is confirmed.`
            )}
          />
        </RowFixed>
        <RowFixed>
          <div className="text-sm font-bold text-high-emphesis">
            {trade.tradeType === TradeType.EXACT_INPUT
              ? `${formatNumberScale(trade.minimumAmountOut(allowedSlippage).toSignificant(6))} ${
                  trade.outputAmount.currency.symbol
                }`
              : `${formatNumberScale(trade.maximumAmountIn(allowedSlippage).toSignificant(6))} ${
                  trade.inputAmount.currency.symbol
                }`}
          </div>
        </RowFixed>
      </RowBetween>
      <RowBetween>
      <RowFixed>
         <div className="text-sm text-secondary">{i18n._(t`Price Impact`)}</div>
         <QuestionHelper
         text={i18n._(t`The difference between the market price and estimated price due to trade size.`)} />
      </RowFixed>
       <FormattedPriceImpact priceImpact={priceImpact} />
      </RowBetween>

      <RowBetween>
        <RowFixed>
          <div className="text-sm text-secondary">{i18n._(t`Trading Fee`)}</div>
          <QuestionHelper text={i18n._(t`A portion of each trade (0.25%) is charged as a fee to incentivize pooling.`)} />
        </RowFixed>
        <div className="text-sm font-bold text-high-emphesis">
          {realizedLPFee
            ? `${formatNumberScale(realizedLPFee.divide(6).multiply(5).toSignificant(4))} ${
                realizedLPFee.currency.symbol
              }`
            : '-'}
        </div>
      </RowBetween>

      <RowBetween>
        <RowFixed>
          <div className="text-sm text-secondary">{i18n._(t`Enchant Fee`)}</div>
          <QuestionHelper
            text={i18n._(t`A portion of each trade (0.05%) goes to Spell holders as a protocol incentive.`)}
          />
        </RowFixed>
        <div className="text-sm font-bold text-high-emphesis">
          {realizedLPFee ? `${realizedLPFee.divide(6).toSignificant(4)} ${realizedLPFee.currency.symbol}` : '-'}
        </div>
      </RowBetween>

      <RowBetween>
        <RowFixed>
          <div className="text-sm text-secondary">{i18n._(t`Slippage`)}</div>
          <QuestionHelper text={i18n._(t`Maximum slippage tolerance allowed.`)} />
        </RowFixed>
        <div className="text-sm font-bold text-high-emphesis">{allowedSlippage.toFixed(2)}%</div>
      </RowBetween>

      {/* {minerBribe && (
        <RowBetween>
          <RowFixed>
            <div className="text-sm text-secondary">{i18n._(t`Miner Tip`)}</div>
            <QuestionHelper text={i18n._(t`Tip to encourage miners to select this transaction.`)} />
          </RowFixed>
          <div className="text-sm font-bold text-high-emphesis">
            {CurrencyAmount.fromRawAmount(Ether.onChain(ChainId.MAINNET), minerBribe).toFixed(4)} FTM
          </div>
        </RowBetween>
      )} */}
    </div>
  )
}
