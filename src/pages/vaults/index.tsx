import Container from '../../components/Container'
import Head from 'next/head'

export default function Vaults() {
  return (
    <Container id="settings-page" className="py-4 md:py-8 lg:py-12" maxWidth="2xl">
      <Head>
        <title>Vaults | Soul</title>
        <meta key="description" name="description" content="Soul vaults..." />
      </Head>
    </Container>
  )
}
