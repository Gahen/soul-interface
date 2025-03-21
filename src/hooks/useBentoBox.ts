import { BigNumber } from '@ethersproject/bignumber'
import { WNATIVE } from '../sdk'
import { ethers } from 'ethers'
import { useActiveWeb3React } from './useActiveWeb3React'
import { useBentoBoxContract } from './useContract'
import { useCallback } from 'react'
import { useTransactionAdder } from '../state/transactions/hooks'

function useBentoBox() {
  const { account, chainId } = useActiveWeb3React()

  const addTransaction = useTransactionAdder()
  const bentoBoxContract = useBentoBoxContract()

  const deposit = useCallback(
    async (tokenAddress: string, value: BigNumber) => {
      if (value && chainId) {
        try {
          const tokenAddressChecksum = ethers.utils.getAddress(tokenAddress)
          if (tokenAddressChecksum === WNATIVE[chainId].address) {
            const tx = await bentoBoxContract?.deposit(ethers.constants.AddressZero, account, account, value, 0, {
              value,
            })
            return addTransaction(tx, { summary: 'Deposit to CoffinBox' })
          } else {
            const tx = await bentoBoxContract?.deposit(tokenAddressChecksum, account, account, value, 0)
            return addTransaction(tx, { summary: 'Deposit to CoffinBox' })
          }
        } catch (e) {
          console.error('coffinbox deposit error:', e)
          return e
        }
      }
    },
    [account, addTransaction, bentoBoxContract, chainId]
  )

  const withdraw = useCallback(
    // todo: this should be updated with BigNumber as opposed to string
    async (tokenAddress: string, value: BigNumber) => {
      if (value && chainId) {
        try {
          const tokenAddressChecksum = ethers.utils.getAddress(tokenAddress)
          const tx = await bentoBoxContract?.withdraw(
            tokenAddressChecksum === WNATIVE[chainId].address
              ? '0x0000000000000000000000000000000000000000'
              : tokenAddressChecksum,
            account,
            account,
            value,
            0
          )
          return addTransaction(tx, { summary: 'Withdraw from CoffinBox' })
        } catch (e) {
          console.error('coffinbox withdraw error:', e)
          return e
        }
      }
    },
    [account, addTransaction, bentoBoxContract, chainId]
  )

  return { deposit, withdraw }
}

export default useBentoBox
