import { Grommet } from 'grommet'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import React from 'react'
import * as Sentry from '@sentry/react'
import Error from 'pages/_error'
import { HomeLayout } from 'components/HomeLayout'
import AccountLayout from 'components/AccountLayout'
import { Layout } from 'components/Layout'
import { ResourcesPortalContextProvider } from 'ResourcesPortalContext'
// global styles
import '../styles/app.scss'
import theme from 'theme'

const LoginRequired = dynamic(() => import('components/LoginRequired'), {
  ssr: false
})

export default ({ Component, pageProps, router: { pathname } }) => {
  const isHome = pathname === '/'
  const isAccount = pathname.indexOf('/account') === 0
  const isDefault = !isHome && !isAccount
  /* eslint-disable-next-line react/jsx-props-no-spreading */
  const Page = () => <Component {...pageProps} />

  // configuring sentry
  Sentry.init({
    dsn:
      'https://dd7bd76d825c43f9a987040bd1a04e4b@o7983.ingest.sentry.io/5454557',
    environment: 'client-staging'
  })

  return (
    <Sentry.ErrorBoundary fallback={Error} showDialog>
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
            <LoginRequired showHeader>
              <AccountLayout>
                <Page />
              </AccountLayout>
            </LoginRequired>
          )}
          {isDefault && (
            <Layout>
              <Page />
            </Layout>
          )}
        </Grommet>
      </ResourcesPortalContextProvider>
    </Sentry.ErrorBoundary>
  )
}
