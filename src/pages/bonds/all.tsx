import { Wrap } from '../../components/ReusableStyles'
import DoubleGlowShadowV2 from '../../components/DoubleGlowShadowV2'
import Container from '../../components/Container'
import Head from 'next/head'
import React from 'react'

import BondList from '../../features/bond/BondList'

const All = () => {
  return (
    <Wrap padding='1rem 0 0 0' justifyContent="center">
      <DoubleGlowShadowV2 opacity="0.6">
      <Container id="bond-page">
        <Head>
          <title>Bond | All</title>
          <meta key="description" name="description" content="Mint SOUL" />
        </Head>
        <BondList />
      </Container>
      </DoubleGlowShadowV2>

    </Wrap>
  )
}

export default All