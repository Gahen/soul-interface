import { ChainId, CurrencyAmount, JSBI, NATIVE, Pair, Currency } from '../../../sdk'
import React, { useMemo } from 'react'
import { classNames, currencyId } from '../../../functions'
import { toV2LiquidityToken, useTrackedTokenPairs } from '../../../state/user/hooks'

import Alert from '../../../components/Alert'
import { BIG_INT_ZERO } from '../../../constants'
import Back from '../../../components/Back'
import Button from '../../../components/Button'
import Card from '../../../components/Card'
import Container from '../../../components/Container'
import Dots from '../../../components/Dots'
import Empty from '../../../components/Empty'
import ExternalLink from '../../../components/ExternalLink'
import FullPositionCard from '../../../components/PositionCard'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { MigrationSupported } from '../../../features/migration'
import Typography from '../../../components/Typography'
import Web3Connect from '../../../components/Web3Connect'
import { t } from '@lingui/macro'
import { useActiveWeb3React } from '../../../hooks/useActiveWeb3React'
import { useETHBalances } from '../../../state/wallet/hooks'
import { useLingui } from '@lingui/react'
import { useRouter } from 'next/router'
import { useTokenBalancesWithLoadingIndicator } from '../../../state/wallet/hooks'
import { useV2Pairs } from '../../../hooks/useV2Pairs'
import DoubleGlowShadowV2 from '../../../components/DoubleGlowShadowV2'
import { chain } from 'lodash'
// import SoulLogo from '../../../components/SoulLogo'

export default function Pool() {
  const { i18n } = useLingui()
  const router = useRouter()
  const { account, chainId } = useActiveWeb3React()

  // fetch the user's balances of all tracked V2 LP tokens
  const trackedTokenPairs = useTrackedTokenPairs()

  const tokenPairsWithLiquidityTokens = useMemo(() => {
    if (!chainId) {
      return []
    }
    return trackedTokenPairs.map((tokens) => ({
      liquidityToken: toV2LiquidityToken(tokens),
      tokens,
    }))
  }, [trackedTokenPairs, chainId])

  const liquidityTokens = useMemo(
    () => tokenPairsWithLiquidityTokens.map((tpwlt) => tpwlt.liquidityToken),
    [tokenPairsWithLiquidityTokens]
  )
  const [v2PairsBalances, fetchingV2PairBalances] = useTokenBalancesWithLoadingIndicator(
    account ?? undefined,
    liquidityTokens
  )

  // fetch the reserves for all V2 pools in which the user has a balance
  const liquidityTokensWithBalances = useMemo(
    () =>
      tokenPairsWithLiquidityTokens.filter(({ liquidityToken }) =>
        v2PairsBalances[liquidityToken?.address]?.greaterThan('0')
      ),
    [tokenPairsWithLiquidityTokens, v2PairsBalances]
  )

  const v2Pairs = useV2Pairs(liquidityTokensWithBalances.map(({ tokens }) => tokens))
  const v2IsLoading =
    fetchingV2PairBalances || v2Pairs?.length < liquidityTokensWithBalances.length || v2Pairs?.some((V2Pair) => !V2Pair)

  const allV2PairsWithLiquidity = v2Pairs.map(([, pair]) => pair).filter((v2Pair): v2Pair is Pair => Boolean(v2Pair))

  // TODO: Replicate this!
  // show liquidity even if its deposited in rewards contract
  // const stakingInfo = useStakingInfo()
  // const stakingInfosWithBalance = stakingInfo?.filter((pool) =>
  //   JSBI.greaterThan(pool.stakedAmount.quotient, BIG_INT_ZERO)
  // )
  // const stakingPairs = useV2Pairs(stakingInfosWithBalance?.map((stakingInfo) => stakingInfo.tokens))

  // // remove any pairs that also are included in pairs with stake in mining pool
  // const v2PairsWithoutStakedAmount = allV2PairsWithLiquidity.filter((v2Pair) => {
  //   return (
  //     stakingPairs
  //       ?.map((stakingPair) => stakingPair[1])
  //       .filter((stakingPair) => stakingPair?.liquidityToken.address === v2Pair.liquidityToken.address).length === 0
  //   )
  // })
  const migrationSupported = chainId in MigrationSupported
  return (
    <>
      <Head>
        <title>{i18n._(t`Pool`)} | Soul</title>
        <meta
          key="description"
          name="description"
          content="Soul liquidity pools are markets for trades between the two tokens, you can provide these tokens and become a liquidity provider to earn 0.25% of fees from trades."
        />
      </Head>
      {/* <SoulLogo /> */}
      <br /> <br />
      <DoubleGlowShadowV2 opacity="0.6">
        <Container maxWidth="2xl" className="space-y-6">
          {/* <Alert
          title={i18n._(t`Liquidity Provider Rewards`)}
          message={i18n._(t`Liquidity providers earn a 0.25% fee on all trades proportional to their share of
                        the pool. Fees are added to the pool, accrue in real time and can be claimed by
                        withdrawing your liquidity`)}
          type="information"
        /> */}

          <div className="p-4 space-y-4 rounded bg-dark-900">
            <div className="p-4 mb-3 space-y-3">
              <div className="text-center">
                <Typography component="h1" variant="h2">
                  {i18n._(t``)}
                  {/* {i18n._(t`My Liquidity Positions`)} */}
                </Typography>
              </div>
            </div>

            <div className="grid grid-flow-row gap-3">
              {!account ? (
                <Web3Connect size="lg" color="gradient" className="w-full" />
              ) : v2IsLoading ? (
                <Empty>
                  <Dots>{i18n._(t`Loading`)}</Dots>
                </Empty>
              ) : allV2PairsWithLiquidity?.length > 0 ? (
                <>
                  <div className="flex items-center justify-center">
                  <ExternalLink
                      href={'/analytics/dashboard'}
                  >
                    Account Analytics and Accrued Fees <span> ↗</span>
                  </ExternalLink>
                </div>
                  {allV2PairsWithLiquidity.map((v2Pair) => (
                    <FullPositionCard
                      key={v2Pair.liquidityToken.address}
                      pair={v2Pair}
                      stakedBalance={CurrencyAmount.fromRawAmount(v2Pair.liquidityToken, '0')}
                    />
                  ))}
                </>
              ) : (
                <Empty className="flex text-lg text-center text-low-emphesis">
                  <div className="px-4 py-2">{i18n._(t`Add Liquidity & Earn Fees (0.25%)`)}</div>
                </Empty>
              )}
              {account && (
                <div className={classNames('grid gap-4', migrationSupported ? 'grid-cols-3' : 'grid-cols-2')}>
                  <Button
                    id="add-pool-button"
                    color="gradient"
                    className="grid items-center justify-center grid-flow-col gap-2 whitespace-nowrap"
                    onClick={() => router.push(`/exchange/add/${currencyId(NATIVE[chainId])}`)}
                  >
                    {i18n._(t`Add`)}
                  </Button>
                  <Button id="add-pool-button" color="gray" onClick={() => router.push(`/exchange/find`)}>
                    {i18n._(t`Import`)}
                  </Button>

                  {migrationSupported && (
                    <Button id="create-pool-button" color="gray" onClick={() => router.push(`/migrate`)}>
                      {i18n._(t`Migrate`)}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </Container>
      </DoubleGlowShadowV2>
    </>
  )
}
