import { Grommet } from 'grommet'
import Head from 'next/head'
import React from 'react'
import { AccountLayout } from '../components/AccountLayout'
import { HomeLayout } from '../components/HomeLayout'
import { Layout } from '../components/Layout'
import { ResourcesPortalContextProvider } from '../ResourcesPortalContext'
// global styles
import '../styles/app.scss'
import theme from '../theme'

export default ({ Component, pageProps, router: { pathname } }) => {
  const isHome = pathname === '/'
  const isAccount = pathname.indexOf('/account') === 0
  const isDefault = !isHome && !isAccount
  /* eslint-disable-next-line react/jsx-props-no-spreading */
  const Page = () => <Component {...pageProps} />

  return (
    <ResourcesPortalContextProvider>
      <Head>
        <link
          href="https://fonts.googleapis.com/css?family=Arvo:400,700|Lato:400,400i,700&display=swap"
          rel="stylesheet"
          key="google-fonts"
        />
      </Head>
      <Grommet theme={theme}>
        {isHome && (
          <HomeLayout>
            <Page />
          </HomeLayout>
        )}
        {isAccount && (
          <AccountLayout>
            <Page />
          </AccountLayout>
        )}
        {isDefault && (
          <Layout>
            <Page />
          </Layout>
        )}
      </Grommet>
    </ResourcesPortalContextProvider>
  )
}
