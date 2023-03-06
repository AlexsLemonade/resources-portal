import { Grommet } from 'grommet'
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

const Fallback = (sentry) => {
  return <Error sentry={sentry} />
}

export default ({ Component, pageProps, router: { pathname } }) => {
  const isHome = pathname === '/'
  const isAccount = pathname.indexOf('/account') === 0
  const isDefault = !isHome && !isAccount
  /* eslint-disable-next-line react/jsx-props-no-spreading */
  const Page = () => <Component {...pageProps} />

  // configuring sentry
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.SENTRY_ENV
  })

  return (
    <Sentry.ErrorBoundary fallback={Fallback} showDialog>
      <ResourcesPortalContextProvider>
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
