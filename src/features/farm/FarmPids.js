import { tokens } from './tokens'

// Base tokens (token1):
// - WFTM
// - FUSD
// - SOUL

export const FarmPids = [
  {
    pid: 1,
    token1: 'SOUL',
    token2: 'FUSD',
    lpSymbol: 'SOUL-FUSD',
    lpAddresses: {
      4002: '0xaf02fd55F297f2a591367F6E33Dc600Ff2Be472A',
      250: '0x9e7711eaeb652d0da577c1748844407f8db44a10',
    },
    token1Address: tokens.SOUL,
    token2Address: tokens.FUSD,
  },
  {
    pid: 2,
    token1: 'SOUL',
    token2: 'WFTM',
    lpSymbol: 'SOUL-FTM',
    lpAddresses: {
      4002: '0x10c0AFd7C58916C4025d466E11850c7D79219277',
      250: '0xa2527Af9DABf3E3B4979d7E0493b5e2C6e63dC57',
    },
    token1Address: tokens.SOUL,
    token2Address: tokens.WFTM,
  },
  {
    pid: 3,
    token1: 'FTM',
    token2: 'FETH',
    lpSymbol: 'FTM-USDC',
    lpAddresses: {
      4002: '',
      250: '0x160653f02b6597e7db00ba8ca826cf43d2f39556',
    },
    token1Address: tokens.WFTM,
    token2Address: tokens.USDC,
  },
  {
    pid: 4,
    token1: 'WFTM',
    token2: 'WETH',
    lpSymbol: 'FTM-ETH',
    lpAddresses: {
      4002: '',
      250: '0xC615a5fd68265D9Ec6eF60805998fa5Bb71972Cb',
    },
    token1Address: tokens.WFTM,
    token2Address: tokens.WETH,
  },
  // {
  //   pid: 5,
  //   token1: "FTM",
  //   token2: "FBTC",
  //   lpSymbol: "FTM-FBTC",
  //   lpAddresses: {
  //     4002: "0x69532253792c8ce581D1BE2150aF67994fF324e7",
  //   },
  //   token1Address: tokens.WFTM,
  //   token2Address: tokens.FBTC,
  // },
]

export default FarmPids
