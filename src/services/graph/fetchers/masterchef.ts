import {
  masterChefV2PairAddressesQuery,
  poolsV2Query,
} from '../queries'

import { ChainId } from '../../../sdk'
import { GRAPH_HOST } from '../constants'
import { request } from 'graphql-request'

export const MASTERCHEF_V2 = {
  [ChainId.MAINNET]: 'sushiswap/master-chefv2',
}
export const masterChefV2 = async (query, chainId = ChainId.MAINNET) =>
  request(`${GRAPH_HOST[chainId]}/subgraphs/name/${MASTERCHEF_V2[chainId]}`, query)

export const getMasterChefV2Farms = async () => {
  const { pools } = await masterChefV2(poolsV2Query)
  return pools
}

export const getMasterChefV2PairAddreses = async () => {
  const { pools } = await masterChefV2(masterChefV2PairAddressesQuery)
  return pools
}

