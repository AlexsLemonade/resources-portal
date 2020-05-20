const {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD
} = require('next/constants')

module.exports = (phase) => {
  const stageEnv = process.env.STAGING === '1'
  const isDevelopment = phase === PHASE_DEVELOPMENT_SERVER
  const isStaging = phase === PHASE_PRODUCTION_BUILD && stageEnv
  const isProduction = phase === PHASE_PRODUCTION_BUILD && !stageEnv

  const env = {
    API_VERSION: 'v1',
    IS_DEVELOPMENT: isDevelopment,
    IS_STAGING: isStaging,
    IS_PRODUCTION: isProduction,
    API_HOST: (() => {
      if (process.env.API_HOST) return process.env.API_HOST
      if (isDevelopment) return 'http://localhost:8000'
      if (isStaging) return 'http://api.staging.resources.alexslemonade.org'
      if (isProduction) return 'http://api.resources.alexslemonade.org'
      return 'http://api.resources.alexslemonade.org'
    })()
  }

  return {
    env
  }
}
