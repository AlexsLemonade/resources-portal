const { PHASE_DEVELOPMENT_SERVER } = require('next/constants')
const path = require('path')

module.exports = (phase) => {
  const isDevelopment = phase === PHASE_DEVELOPMENT_SERVER
  const isProduction = process.env.STAGE === 'production'

  const getApiHost = () => {
    if (process.env.IS_STAGING) {
      return 'https://staging.api.resources.alexslemonade.org'
    }

    return 'https://api.resources.alexslemonade.org'
  }

  const getClientHost = () => {
    if (process.env.IS_STAGING) {
      return 'https://staging.resources.alexslemonade.org'
    }

    return 'https://resources.alexslemonade.org'
  }

  const env = {
    API_VERSION: 'v1',
    IS_DEVELOPMENT: isDevelopment,
    IS_STAGING: !isDevelopment && !isProduction,
    IS_PRODUCTION: !isDevelopment && isProduction,
    API_HOST: isDevelopment ? 'http://localhost:8000' : getApiHost(),
    CLIENT_HOST: isDevelopment ? 'http://localhost:7000' : getClientHost(),
    ORCID_CLIENT_ID: 'APP-2AHZAK2XCFGHRJFM'
  }

  return {
    env,
    webpack: (config) => {
      config.resolveLoader.modules.push(path.resolve(__dirname, 'loaders'))

      config.module.rules.push({
        test: /\.md$/,
        use: ['raw-loader', 'template-literal-loader']
      })
      return config
    }
  }
}
