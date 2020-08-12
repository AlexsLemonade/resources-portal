const { PHASE_DEVELOPMENT_SERVER } = require('next/constants')

module.exports = (phase) => {
  const isDevelopment = phase === PHASE_DEVELOPMENT_SERVER
  const isProduction = process.env.STAGE === 'production'
  const apiHost =
    process.env.API_HOST || 'https://api.resources.alexslemonade.org'

  const clientHost =
    process.env.CLIENT_HOST || 'https://resources.alexslemonade.org'

  const env = {
    API_VERSION: 'v1',
    IS_DEVELOPMENT: isDevelopment,
    IS_STAGING: !isDevelopment && !isProduction,
    IS_PRODUCTION: !isDevelopment && isProduction,
    API_HOST: isDevelopment ? 'http://localhost:8000' : apiHost,
    CLIENT_HOST: isDevelopment ? 'http://localhost:7000' : clientHost,
    ORCID_CLIENT_ID: 'APP-2AHZAK2XCFGHRJFM'
  }

  return {
    env
  }
}
