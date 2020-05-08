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
    API_HOST: (() => {
      if (isDevelopment) return 'http://localhost:8000'
      if (isStaging) return null
      if (isProduction) return null
      return null
    })()
  }

  return {
    env
  }
}
