import Button, { ButtonProps } from '../Button'
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core'

import { Activity } from 'react-feather'
import React from 'react'
import styled from 'styled-components'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { useWalletModalToggle } from '../../state/application/hooks'

const NetworkIcon = styled(Activity)`
  width: 16px;
  height: 16px;
`

export default function Web3Connect({ color = 'gray', size = 'sm', className = '', ...rest }: ButtonProps) {
  const { i18n } = useLingui()
  const toggleWalletModal = useWalletModalToggle()
  const { error } = useWeb3React()
  return error ? (
    <div
      className="flex items-center justify-center px-4 py-2 font-semibold text-white border rounded bg-opacity-80 border-red bg-red hover:bg-opacity-100"
      onClick={toggleWalletModal}
    >
      <div className="mr-1">
        <NetworkIcon />
      </div>
      {error instanceof UnsupportedChainIdError ? i18n._(t`You are on the wrong network`) : i18n._(t`Error`)}
    </div>
  ) : (
    <Button
      id="connect-wallet"
      onClick={toggleWalletModal}
      variant="outlined"
      color={color}
      className={className}
      size={size}
      {...rest}
    >
      {i18n._(t`Connect Wallet`)}
    </Button>
  )
}
