const { PHASE_DEVELOPMENT_SERVER } = require('next/constants')
const path = require('path')

module.exports = (phase) => {
  const isDevelopment = phase === PHASE_DEVELOPMENT_SERVER
  const isProduction = process.env.STAGE === 'production'
  const apiHost =
    process.env.API_HOST || 'https://api.resources.alexslemonade.org'

  const env = {
    API_VERSION: 'v1',
    IS_DEVELOPMENT: isDevelopment,
    IS_STAGING: !isDevelopment && !isProduction,
    IS_PRODUCTION: !isDevelopment && isProduction,
    API_HOST: isDevelopment ? 'http://localhost:8000' : apiHost
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
