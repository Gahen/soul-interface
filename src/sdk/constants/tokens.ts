import { USDC_ADDRESS, USD_ADDRESS, WETH9_ADDRESS, WNATIVE_ADDRESS } from './addresses'

import { ChainId } from '../enums'
import { Token } from '../entities/Token'
import { TokenMap } from '../types/TokenMap'

export const USDC: TokenMap = {
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, USDC_ADDRESS[ChainId.MAINNET], 6, 'USDC', 'USD Coin'),
//   [ChainId.ROPSTEN]: new Token(ChainId.ROPSTEN, USDC_ADDRESS[ChainId.ROPSTEN], 6, 'USDC', 'USD Coin'),
//   [ChainId.KOVAN]: new Token(ChainId.KOVAN, USDC_ADDRESS[ChainId.KOVAN], 6, 'USDC', 'USD Coin'),
//   [ChainId.MATIC]: new Token(ChainId.MATIC, USDC_ADDRESS[ChainId.MATIC], 6, 'USDC', 'USD Coin'),
  [ChainId.FANTOM]: new Token(ChainId.FANTOM, USDC_ADDRESS[ChainId.FANTOM], 6, 'USDC', 'USD Coin'),
  [ChainId.BSC]: new Token(ChainId.BSC, USDC_ADDRESS[ChainId.BSC], 18, 'USDC', 'USD Coin'),
//   [ChainId.HARMONY]: new Token(ChainId.HARMONY, USDC_ADDRESS[ChainId.HARMONY], 6, 'USDC', 'USD Coin'),
//   [ChainId.HECO]: new Token(ChainId.HECO, USDC_ADDRESS[ChainId.HECO], 6, 'USDC', 'USD Coin'),
//   [ChainId.OKEX]: new Token(ChainId.OKEX, USDC_ADDRESS[ChainId.OKEX], 18, 'USDC', 'USD Coin'),
//   [ChainId.XDAI]: new Token(ChainId.XDAI, USDC_ADDRESS[ChainId.XDAI], 6, 'USDC', 'USD Coin'),
//   [ChainId.ARBITRUM]: new Token(ChainId.ARBITRUM, USDC_ADDRESS[ChainId.ARBITRUM], 6, 'USDC', 'USD Coin'),
//   [ChainId.MOONRIVER]: new Token(ChainId.MOONRIVER, USDC_ADDRESS[ChainId.MOONRIVER], 6, 'USDC', 'USD Coin'),
}

export const USD: TokenMap = {
  ...USDC,
//   [ChainId.CELO]: new Token(ChainId.CELO, USD_ADDRESS[ChainId.CELO], 18, 'cUSD', 'Celo Dollar'),
}

export const WETH9: TokenMap = {
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, WETH9_ADDRESS[ChainId.MAINNET], 18, 'WETH', 'Wrapped Ether'),
  [ChainId.BSC]: new Token(ChainId.BSC, WETH9_ADDRESS[ChainId.BSC], 18, 'WETH', 'Wrapped Ether'),
  [ChainId.FANTOM]: new Token(ChainId.FANTOM, WETH9_ADDRESS[ChainId.FANTOM], 18, 'WETH', 'Wrapped Ether'),
//   [ChainId.MATIC]: new Token(ChainId.MATIC, WETH9_ADDRESS[ChainId.MATIC], 18, 'WETH', 'Wrapped Ether'),
//   [ChainId.OKEX]: new Token(ChainId.OKEX, WETH9_ADDRESS[ChainId.OKEX], 18, 'WETH', 'Wrapped Ether'),
//   [ChainId.HECO]: new Token(ChainId.HECO, WETH9_ADDRESS[ChainId.HECO], 18, 'WETH', 'Wrapped Ether'),
//   [ChainId.HARMONY]: new Token(ChainId.HARMONY, WETH9_ADDRESS[ChainId.HARMONY], 18, 'WETH', 'Wrapped Ether'),
//   [ChainId.XDAI]: new Token(ChainId.XDAI, WETH9_ADDRESS[ChainId.XDAI], 18, 'WETH', 'Wrapped Ether'),
//   [ChainId.AVALANCHE]: new Token(ChainId.AVALANCHE, WETH9_ADDRESS[ChainId.AVALANCHE], 18, 'WETH', 'Wrapped Ether'),
}

export const WNATIVE: TokenMap = {
  [ChainId.MAINNET]: WETH9[ChainId.MAINNET],
  [ChainId.BSC]: new Token(ChainId.BSC, WNATIVE_ADDRESS[ChainId.BSC], 18, 'WBNB', 'Wrapped BNB'),
  [ChainId.FANTOM]: new Token(ChainId.FANTOM, WNATIVE_ADDRESS[ChainId.FANTOM], 18, 'WFTM', 'Wrapped FTM'),
  [ChainId.FANTOM_TESTNET]: new Token(ChainId.FANTOM_TESTNET, WNATIVE_ADDRESS[ChainId.FANTOM_TESTNET], 18, 'WFTM', 'Wrapped FTM'),
//   [ChainId.MATIC]: new Token(ChainId.MATIC, WNATIVE_ADDRESS[ChainId.MATIC], 18, 'WMATIC', 'Wrapped Matic'),
//   [ChainId.MATIC_TESTNET]: new Token(
//     ChainId.MATIC_TESTNET,
//     WNATIVE_ADDRESS[ChainId.MATIC_TESTNET],
//     18,
//     'WMATIC',
//     'Wrapped Matic'
//   ),
//   [ChainId.XDAI]: new Token(ChainId.XDAI, WNATIVE_ADDRESS[ChainId.XDAI], 18, 'WXDAI', 'Wrapped xDai'),
//   [ChainId.BSC_TESTNET]: new Token(
//     ChainId.BSC_TESTNET,
//     WNATIVE_ADDRESS[ChainId.BSC_TESTNET],
//     18,
//     'WBNB',
//     'Wrapped BNB'
//   ),
//   [ChainId.ARBITRUM]: WETH9[ChainId.ARBITRUM],
//   [ChainId.ARBITRUM_TESTNET]: WETH9[ChainId.ARBITRUM_TESTNET],
//   [ChainId.MOONBEAM_TESTNET]: new Token(
//     ChainId.MOONBEAM_TESTNET,
//     WNATIVE_ADDRESS[ChainId.MOONBEAM_TESTNET],
//     18,
//     'WETH',
//     'Wrapped Ether'
//   ),
//   [ChainId.AVALANCHE]: new Token(ChainId.AVALANCHE, WNATIVE_ADDRESS[ChainId.AVALANCHE], 18, 'WAVAX', 'Wrapped AVAX'),
//   [ChainId.AVALANCHE_TESTNET]: new Token(
//     ChainId.AVALANCHE_TESTNET,
//     WNATIVE_ADDRESS[ChainId.AVALANCHE_TESTNET],
//     18,
//     'WAVAX',
//     'Wrapped AVAX'
//   ),
//   [ChainId.HECO]: new Token(ChainId.HECO, WNATIVE_ADDRESS[ChainId.HECO], 18, 'WHT', 'Wrapped HT'),
//   [ChainId.HECO_TESTNET]: new Token(
//     ChainId.HECO_TESTNET,
//     WNATIVE_ADDRESS[ChainId.HECO_TESTNET],
//     18,
//     'WHT',
//     'Wrapped HT'
//   ),
//   [ChainId.HARMONY]: new Token(ChainId.HARMONY, WNATIVE_ADDRESS[ChainId.HARMONY], 18, 'WONE', 'Wrapped ONE'),
//   [ChainId.HARMONY_TESTNET]: new Token(
//     ChainId.HARMONY_TESTNET,
//     WNATIVE_ADDRESS[ChainId.HARMONY_TESTNET],
//     18,
//     'WONE',
//     'Wrapped ONE'
//   ),
//   [ChainId.OKEX]: new Token(ChainId.OKEX, WNATIVE_ADDRESS[ChainId.OKEX], 18, 'WOKT', 'Wrapped OKExChain'),
//   [ChainId.OKEX_TESTNET]: new Token(
//     ChainId.OKEX_TESTNET,
//     WNATIVE_ADDRESS[ChainId.OKEX_TESTNET],
//     18,
//     'WOKT',
//     'Wrapped OKExChain'
//   ),
//   [ChainId.CELO]: new Token(ChainId.CELO, WNATIVE_ADDRESS[ChainId.CELO], 18, 'CELO', 'Celo'),
//   [ChainId.PALM]: new Token(ChainId.PALM, WNATIVE_ADDRESS[ChainId.PALM], 18, 'WPALM', 'Wrapped Palm'),
//   [ChainId.MOONRIVER]: new Token(
//     ChainId.MOONRIVER,
//     WNATIVE_ADDRESS[ChainId.MOONRIVER],
//     18,
//     'WMOVR',
//     'Wrapped Moonriver'
//   ),
//   [ChainId.FUSE]: new Token(ChainId.FUSE, WNATIVE_ADDRESS[ChainId.FUSE], 18, 'WFUSE', 'Wrapped Fuse'),
}
