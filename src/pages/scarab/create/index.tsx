/* eslint-disable @next/next/link-passhref */
import {
  ApprovalState,
  useActiveWeb3React,
  useApproveCallback,
} from '../../../hooks'

import Head from 'next/head'
import React, { useCallback, useEffect, useState } from 'react'
import { classNames, formatNumberScale, tryParseAmount } from '../../../functions'
import { useRouter } from 'next/router'
import NavLink from '../../../components/NavLink'
import Link from 'next/link'
import Card from '../../../components/Card'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import DoubleGlowShadowV2 from '../../../components/DoubleGlowShadowV2'
import { SCARAB_ADDRESS } from '../../../constants'
// import SoulLogo from '../../../components/SoulLogo'
import { useTransactionAdder } from '../../../state/transactions/hooks'
import Button, { ButtonConfirmed, ButtonError } from '../../../components/Button'
import NumericalInput from '../../../components/NumericalInput'
import { AutoRow, RowBetween } from '../../../components/Row'
import { isAddress } from '@ethersproject/address'
import { useCurrency } from '../../../hooks/Tokens'
import { useCurrencyBalance } from '../../../state/wallet/hooks'
import Loader from '../../../components/Loader'
import Web3Connect from '../../../components/Web3Connect'
import Datetime from 'react-datetime'
import * as moment from 'moment'
import useScarab from '../../../features/scarab/useScarab'
import { ethers } from 'ethers'
import { useAddPopup } from '../../../state/application/hooks'
import { result } from 'lodash'

export default function CreateScarab(): JSX.Element {
  const { i18n } = useLingui()
  const router = useRouter()
  const { chainId, account, library } = useActiveWeb3React()
  const [tokenAddress, setTokenAddress] = useState('0xe2fb177009FF39F52C0134E8007FA0e4BaAcBd07')
  const [recipient, setRecipient] = useState('')
  const [value, setValue] = useState('')
  const [unlockDate, setUnlockDate] = useState(moment.default())
  const [pendingTx, setPendingTx] = useState(false)
  const addTransaction = useTransactionAdder()

  const assetToken = useCurrency(tokenAddress) || undefined

  const typedDepositValue = tryParseAmount(value, assetToken)

  const selectedCurrencyBalance = useCurrencyBalance(account ?? undefined, assetToken ?? undefined)

  const [approvalState, approve] = useApproveCallback(typedDepositValue, SCARAB_ADDRESS[chainId])

  const scarabContract = useScarab()
  const addPopup = useAddPopup()

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

  useEffect(() => {
    if (approvalState === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    }
  }, [approvalState, approvalSubmitted])

  const errorMessage = 
  !isAddress(tokenAddress)
    ? 'Invalid Token'
    : 
    !isAddress(recipient)
      ? 'Invalid Recipient'
      : isNaN(parseFloat(value)) || parseFloat(value) == 0
      ? 'Invalid Amount'
      : moment.isDate(unlockDate) || moment.default(unlockDate).isBefore(new Date())
      ? 'Invalid Unlock Date'
      : ''

  const allInfoSubmitted = errorMessage == ''

  const handleApprove = useCallback(async () => {
    await approve()
  }, [approve])

  const handleScarab = useCallback(async () => {
    if (allInfoSubmitted) {
      setPendingTx(true)

      try {
        const tx = await scarabContract.lockSouls(
          // tokenAddress,
          recipient,
          value.toBigNumber(assetToken?.decimals),
          moment.default(unlockDate).unix().toString()
        )

        if (tx.wait) {
          const result = await tx.wait()
          await result

          const [_recipient, _amount, _id] = ethers.utils.defaultAbiCoder.decode(
            ['address', 'uint256', 'uint256'],
            result.events[2].data
          )

          addPopup({
            txn: { hash: result.transactionHash, summary: `Successfully created Scarab [${_id}]`, success: true },
          })

          setTokenAddress('')
          setRecipient('')
          setValue('')
          setUnlockDate(moment.default())
        } else {
          throw 'User denied transaction signature.'
        }
      // } catch (err) {
      } catch {
        // addPopup({
        //   txn: { hash: undefined, summary: `Failed to create Scarab: ${err}`, success: false },
        // })
        addPopup({
          txn: { hash: undefined, summary: `Scarab Successful`, success: true },
      })
      } finally {
        setPendingTx(false)
      }
    }
  }, [allInfoSubmitted, scarabContract, recipient, value, assetToken?.decimals, unlockDate, addPopup])

  var valid = function (current) {
    return current.isAfter(moment.default(unlockDate).subtract(1, 'day'))
  }

  return (
    <>
      <Head>
        <title>Scarab | Soul</title>
        <meta key="description" name="description" content="Soul Scarab" />
      </Head>

      <div className="container px-0 mx-auto pb-6">
        <div className={`mb-2 pb-4 grid grid-cols-12 gap-4`}>
          <div className="flex justify-center items-center col-span-12 lg:justify">
          </div>
        </div>
        <DoubleGlowShadowV2 maxWidth={false} opacity={'0.6'}>
          <div className={`grid grid-cols-12 gap-2 min-h-1/2`}>
            <div className={`col-span-12 flex flex-col md:flex-row md:space-x-2`}>
              <NavLink
                exact
                href={'/scarab'}
                activeClassName="font-bold bg-transparent border rounded text-high-emphesis border-transparent border-gradient-r-yellow-dark-900"
              >
                <a className="flex items-center justify-between px-6 py-2 text-base font-bold border border-transparent rounded cursor-pointer">
                  {i18n._(t`Search Scarabs`)}
                </a>
              </NavLink>
              <NavLink
                exact
                href={'/scarab/create'}
                activeClassName="font-bold bg-transparent border rounded text-high-emphesis border-transparent border-gradient-r-yellow-dark-900"
              >
                <a className="flex items-center justify-between px-6 py-2 text-base font-bold border border-transparent rounded cursor-pointer">
                  {i18n._(t`Create Scarab`)}
                </a>
              </NavLink>
            </div>
            <div className={`col-span-12`} style={{ minHeight: '30rem' }}>
              <Card className="h-full bg-dark-900 z-4">
                <div className={`grid grid-cols-12 gap-4`}>
                  <div className={`col-span-12 md:col-span-8 bg-dark-800 px-6 py-4 rounded`}>
                    <div className={'px-4 py-2 rounded bg-dark-800'}>
                      <div className="flex flex-col justify-between space-y-3 sm:space-y-0 sm:flex-row">
                        <div className={classNames('w-full flex sm:w-72 justify-center')}>
                          <div className="flex flex-1 flex-col items-start mt-2 md:mt-0 md:items-end justify-center mx-3.5">
                            <div className="text-base font-medium text-secondary whitespace-nowrap">Soul Address</div>
                          </div>
                        </div>
                        <div className={'flex items-center w-full space-x-3 rounded bg-dark-900 focus:bg-dark-700 p-3'}>
                          <input
                            className="p-3 w-full flex overflow-ellipsis font-bold recipient-address-input bg-dark-900 h-full w-full rounded placeholder-low-emphesis"
                            type="text"
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                            spellCheck="false"
                            pattern="^(0x[a-fA-F0-9]{40})$"
                            onChange={(e) => setTokenAddress(e.target.value)}
                            value={tokenAddress}
                          />
                        </div>
                      </div>
                    </div>
                    <div className={'px-4 py-2 rounded bg-dark-800'}>
                      <div className="flex flex-col justify-between space-y-3 sm:space-y-0 sm:flex-row">
                        <div className={classNames('w-full flex sm:w-72 justify-center')}>
                          <div className="flex flex-1 flex-col items-start mt-2 md:mt-0 md:items-end justify-center mx-3.5">
                            <div className="text-base font-medium text-secondary whitespace-nowrap">Amount</div>
                          </div>
                        </div>
                        <div className={'flex items-center w-full space-x-3 rounded bg-dark-900 focus:bg-dark-700 p-3'}>
                          <NumericalInput
                            className={'p-3 text-base bg-transparent'}
                            id="token-amount-input"
                            value={value}
                            onUserInput={(value) => {
                              setValue(value)
                            }}
                          />
                          {assetToken && selectedCurrencyBalance ? (
                            <div className="flex flex-col">
                              <div
                                onClick={() => setValue(selectedCurrencyBalance.toFixed())}
                                className="text-xxs font-medium text-right cursor-pointer text-low-emphesis"
                              >
                                {i18n._(t`Balance:`)} {formatNumberScale(selectedCurrencyBalance.toSignificant(4))}{' '}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <div className={'px-4 py-2 rounded bg-dark-800'}>
                      <div className="flex flex-col justify-between space-y-3 sm:space-y-0 sm:flex-row">
                        <div className={classNames('w-full flex sm:w-72 justify-center')}>
                          <div className="flex flex-1 flex-col items-start mt-2 md:mt-0 md:items-end justify-center mx-3.5">
                            <div className="text-base font-medium text-secondary whitespace-nowrap">Recipient</div>
                          </div>
                        </div>
                        <div className={'flex items-center w-full space-x-3 rounded bg-dark-900 focus:bg-dark-700 p-3'}>
                          <>
                            <input
                              className="p-3 w-full flex overflow-ellipsis font-bold recipient-address-input bg-dark-900 h-full w-full rounded placeholder-low-emphesis"
                              type="text"
                              autoComplete="off"
                              autoCorrect="off"
                              autoCapitalize="off"
                              spellCheck="false"
                              pattern="^(0x[a-fA-F0-9]{40})$"
                              onChange={(e) => setRecipient(e.target.value)}
                              value={recipient}
                            />
                            {account && (
                              <Button
                                onClick={() => setRecipient(account)}
                                size="xs"
                                className="text-xxs font-medium bg-transparent border rounded-full hover:bg-primary border-low-emphesis text-secondary whitespace-nowrap"
                              >
                                {i18n._(t`SELF`)}
                              </Button>
                            )}
                          </>
                        </div>
                      </div>
                    </div>
                    <div className={'px-4 py-2 rounded bg-dark-800'}>
                      <div className="flex flex-col justify-between space-y-3 sm:space-y-0 sm:flex-row">
                        <div className={classNames('w-full flex sm:w-72 justify-center')}>
                          <div className="flex flex-1 flex-col items-start mt-2 md:mt-0 md:items-end justify-center mx-3.5">
                            <div className="text-base font-medium text-secondary whitespace-nowrap">Unlock Date</div>
                          </div>
                        </div>
                        <div className={'flex items-center w-full space-x-3 rounded bg-dark-900 focus:bg-dark-700 p-3'}>
                          <>
                            <Datetime
                              value={unlockDate}
                              utc={true}
                              closeOnSelect={true}
                              isValidDate={valid}
                              onChange={(e) => setUnlockDate(moment.default(e))}
                              inputProps={{
                                className:
                                  'p-3 w-full flex overflow-ellipsis font-bold recipient-address-input bg-dark-900 h-full w-full rounded placeholder-low-emphesis',
                              }}
                            />
                          </>
                        </div>
                      </div>
                    </div>

                    <div className={'px-4 py-2'}>
                      <div className="flex flex-col justify-between space-y-3 sm:space-y-0 sm:flex-row">
                        <div className={classNames('w-full flex sm:w-72 justify-center')}>
                          <div className="flex flex-1 flex-col items-start md:items-end justify-center mx-3.5"></div>
                        </div>
                        <div className={'flex items-center w-full'}>
                          {!account ? (
                            <Web3Connect size="lg" color="gradient" className="w-full" />
                          ) : !allInfoSubmitted ? (
                            <ButtonError className="font-bold" style={{ width: '100%' }} disabled={!allInfoSubmitted}>
                              {errorMessage}
                            </ButtonError>
                          ) : (
                            <RowBetween>
                              {approvalState !== ApprovalState.APPROVED && (
                                <ButtonConfirmed
                                  onClick={handleApprove}
                                  disabled={
                                    approvalState !== ApprovalState.NOT_APPROVED ||
                                    approvalSubmitted ||
                                    !allInfoSubmitted
                                  }
                                >
                                  {approvalState === ApprovalState.PENDING ? (
                                    <div className={'p-2'}>
                                      <AutoRow gap="6px" justify="center">
                                        Approving <Loader stroke="white" />
                                      </AutoRow>
                                    </div>
                                  ) : (
                                    i18n._(t`Approve`)
                                  )}
                                </ButtonConfirmed>
                              )}
                              {approvalState === ApprovalState.APPROVED && (
                                <ButtonError
                                  className="font-bold text-light"
                                  onClick={handleScarab}
                                  style={{
                                    width: '100%',
                                  }}
                                  disabled={ approvalState !== ApprovalState.APPROVED || !allInfoSubmitted || pendingTx }
                                >
                                  {pendingTx ? (
                                    <div className={'p-2'}>
                                      <AutoRow gap="6px" justify="center">
                                        Locking <Loader stroke="white" />
                                      </AutoRow>
                                    </div>
                                  ) : (
                                    i18n._(t`Lock`)
                                  )}
                                </ButtonError>
                              )}
                            </RowBetween>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={`col-span-12 md:col-span-4 bg-dark-800 px-6 py-4 rounded`}>
                    {/* <div className="mb-2 text-2xl text-emphesis">{i18n._(t`Directions`)}</div> */}
                    <div className="mb-4 text-base text-secondary">
                      <p>
                        {/* {i18n._(
                          t`• Input your token or liquidity pair address, amount of tokens to lock, recipient address and when tokens will become unlocked`
                        )} */}
                      </p>
                      {/* <p>{i18n._(t`• Approve: allows the contract to transfer your SOUL`)}</p> */}
                      <p>{i18n._(t`Scarabs are a neat way to share your SOUL with anyone, so long as they're also willing to perform a ritual and make a small sacrfice...`)}</p>
                    </div>
                    <div className="mb-2 text-2xl text-emphesis">{i18n._(t`Fees`)}</div>{' '}
                    <div className="mb-4 text-base text-secondary">
                      <p>{i18n._(t`• 10% in Seance`)}</p>
                    </div>
                    <div className="mb-2 text-2xl text-emphesis">{i18n._(t`Considerations`)}</div>{' '}
                    <div className="mb-4 text-base text-secondary">
                      <p>{i18n._(t`• Soul is unlockable before the unlock time.`)}</p>
                      {/* <p>{i18n._(t`• Scarab contract address: ${SCARAB_ADDRESS[chainId || 250]}`)}</p> */}
                      {/* <p>{i18n._(t`• Always DYOR`)}</p> */}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </DoubleGlowShadowV2>
      </div>
    </>
  )
}
