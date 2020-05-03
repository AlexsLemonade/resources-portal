import React from 'react'
import { Grommet } from 'grommet'
import Head from 'next/head'
import theme from '../theme'
import Layout from '../components/Layout'
import { ResourcesPortalProvider } from '../ResouresPortalContext'

// global styles
import '../styles/app.scss'

export default ({ Component, pageProps }) => {
  return (
    <ResourcesPortalProvider>
      <Head>
        <link
          href="https://fonts.googleapis.com/css?family=Arvo:400,700|Lato:400,400i,700&display=swap"
          rel="stylesheet"
          key="google-fonts"
        />
      </Head>
      <Grommet theme={theme}>
        <Layout>
          {/* eslint-disable-next-line react/jsx-props-no-spreading */}
          <Component {...pageProps} />
        </Layout>
      </Grommet>
    </ResourcesPortalProvider>
  )
}
