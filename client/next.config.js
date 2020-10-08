const withSourceMaps = require('@zeit/next-source-maps')
const { PHASE_DEVELOPMENT_SERVER } = require('next/constants')
const path = require('path')

module.exports = (phase) => {
  const isDevelopment = phase === PHASE_DEVELOPMENT_SERVER
  const isProduction = process.env.STAGE === 'production'
  const apiHost =
    process.env.API_HOST ||
    (isProduction
      ? 'https://api.resources.alexslemonade.org'
      : 'https://api.staging.resources.alexslemonade.org')

  const clientHost =
    process.env.CLIENT_HOST ||
    (isProduction
      ? 'https://resources.alexslemonade.org'
      : 'https://staging.resources.alexslemonade.org')

  const env = {
    API_VERSION: 'v1',
    IS_DEVELOPMENT: isDevelopment,
    IS_STAGING: !isDevelopment && !isProduction,
    IS_PRODUCTION: !isDevelopment && isProduction,
    API_HOST: isDevelopment ? 'http://localhost:8000' : apiHost,
    CLIENT_HOST: isDevelopment ? 'http://localhost:7000' : clientHost,
    ORCID_CLIENT_ID: 'APP-2AHZAK2XCFGHRJFM',
    ORCID_URL: isProduction
      ? 'https://orcid.org/'
      : 'https://sandbox.orcid.org/'
  }

  return withSourceMaps({
    env,
    webpack: (config) => {
      config.resolveLoader.modules.push(path.resolve(__dirname, 'loaders'))
      config.module.rules.push({
        test: /\.md$/,
        use: ['raw-loader', 'template-literal-loader']
      })
      return config
    }
  })
}
