import { Grommet } from 'grommet';
import theme from '../src/theme';
import Head from 'next/head';
import Layout from '../src/components/Layout';

// global styles
import '../src/styles/app.scss';

export default ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <link
          href="https://fonts.googleapis.com/css?family=Arvo:400,700|Lato:400,400i,700&display=swap"
          rel="stylesheet"
          key="google-fonts"
        />
      </Head>
      <Grommet theme={theme}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </Grommet>
    </>
  );
};
