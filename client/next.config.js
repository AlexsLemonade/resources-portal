const { PHASE_DEVELOPMENT_SERVER } = require('next/constants')

module.exports = (phase) => {
  const isDevelopment = phase === PHASE_DEVELOPMENT_SERVER

  const env = {
    API_VERSION: 'v1',
    IS_DEVELOPMENT: isDevelopment,
    IS_STAGING: !isDevelopment && !process.env.IS_PRODUCTION,
    IS_PRODUCTION: !isDevelopment && process.env.IS_PRODUCTION,
    API_HOST: (() => {
      if (isDevelopment) return 'http://localhost:8000'
      if (process.env.API_HOST) return process.env.API_HOST
      return 'https://api.resources.alexslemonade.org'
    })()
  }

  return {
    env
  }
}
