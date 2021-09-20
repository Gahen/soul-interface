import { ChainId } from '@soulswap/sdk'

type AddressMap = { [chainId: number]: string }

export const TIMELOCK_ADDRESS = '0x1a9C8182C09F50C8318d769245beA52c32BE35BC'

export const ARCHER_ROUTER_ADDRESS: AddressMap = {
  [ChainId.MAINNET]: '0x9917C083FF9FbD29Df1367FBF7F2388A9a202431',
}

export const SOUL_SUMMONER_ADDRESS: AddressMap = {
  [ChainId.MAINNET]: '',
  [ChainId.FANTOM]: '0xce6ccbB1EdAD497B4d53d829DF491aF70065AB5B', // 20 SEP,
  [ChainId.FANTOM_TESTNET]: '0x70C6A37244feD0Fa4e4148D5ffe38a209dCEd714', // 20 SEP
}

export const ZAPPER_ADDRESS: AddressMap = {
  [ChainId.MAINNET]: '0xcff6eF0B9916682B37D80c19cFF8949bc1886bC2',
  // [ChainId.ROPSTEN]: '0xcff6eF0B9916682B37D80c19cFF8949bc1886bC2',
}

// TODO: specify merkle distributor for mainnet
export const MERKLE_DISTRIBUTOR_ADDRESS: AddressMap = {
  [ChainId.MAINNET]: '0xcBE6B83e77cdc011Cc18F6f0Df8444E5783ed982',
  // [ChainId.ROPSTEN]: '0x84d1f7202e0e7dac211617017ca72a2cb5e2b955',
}

export const MULTICALL2_ADDRESS: AddressMap = {
  [ChainId.MAINNET]: '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696',
  [ChainId.FANTOM]: '0xEd2Fb478f7fCef33E1E1d980a0135789B295a7F5', // 29 AUG
  [ChainId.FANTOM_TESTNET]: '0x1ACB479bB9D1F73009F85ef5F495E942Bb57f15A', // 7 JUL
  // [ChainId.ROPSTEN]: '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696',
  // [ChainId.RINKEBY]: '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696',
  // [ChainId.GÖRLI]: '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696',
  // [ChainId.KOVAN]: '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696',
  // [ChainId.ARBITRUM]: '0xadF885960B47eA2CD9B55E6DAc6B42b7Cb2806dB',
  // [ChainId.ARBITRUM_TESTNET]: '0xa501c031958F579dB7676fF1CE78AD305794d579',
  // [ChainId.CELO]: '0x9aac9048fC8139667D6a2597B902865bfdc225d3',
  // [ChainId.MATIC]: '0x02817C1e3543c2d908a590F5dB6bc97f933dB4BD',
  // [ChainId.MATIC_TESTNET]: '',
  // [ChainId.XDAI]: '0x67dA5f2FfaDDfF067AB9d5F025F8810634d84287',
  // [ChainId.BSC]: '0xa9193376D09C7f31283C54e56D013fCF370Cd9D9',
  // [ChainId.BSC_TESTNET]: '',
  // [ChainId.MOONBEAM_TESTNET]: '',
  // [ChainId.AVALANCHE]: '0xdDCbf776dF3dE60163066A5ddDF2277cB445E0F3',
  // [ChainId.AVALANCHE_TESTNET]: '',
  // [ChainId.HECO]: '0xdDCbf776dF3dE60163066A5ddDF2277cB445E0F3',
  // [ChainId.HECO_TESTNET]: '',
  // [ChainId.HARMONY]: '0xdDCbf776dF3dE60163066A5ddDF2277cB445E0F3',
  // [ChainId.HARMONY_TESTNET]: '',
  // [ChainId.OKEX]: '0xF4d73326C13a4Fc5FD7A064217e12780e9Bd62c3',
  // [ChainId.OKEX_TESTNET]: '',
}
