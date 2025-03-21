import { Wrap } from '../../components/ReusableStyles'
import DoubleGlowShadowV2 from '../../components/DoubleGlowShadowV2'
import Container from '../../components/Container'
import Head from 'next/head'
import React from 'react'

import MateList from '../../features/farm/MateList'

const Mate = () => {
  return (
    <Wrap padding='2rem 0 0 0' justifyContent="center">
      <DoubleGlowShadowV2 opacity="0.6">

      <Container id="farm-page">
        <Head>
          <title>Mate | Soul</title>
          <meta key="description" name="description" content="Farm SOUL" />
        </Head>
        {/* <FarmList /> */}
        <MateList />
      </Container>
      </DoubleGlowShadowV2>

    </Wrap>
  )
}

export default Mate