const path = require('path')

module.exports = () => {
  const isProduction = process.env.VERCEL_GIT_COMMIT_REF === 'master'
  console.log(process.env.VERCEL_GIT_COMMIT_REF)

  const productionEnv = {
    API_VERSION: process.env.API_VERSION,
    API_HOST: process.env.API_HOST,
    ORCID_CLIENT_ID: process.env.ORCID_CLIENT_ID,
    ORCID_URL: process.env.ORCID_URL,
    SENTRY_DSN: process.env.SENTRY_DSN,
    SENTRY_ENV: process.env.SENTRY_ENV
  }

  const stageEnv = {
    API_VERSION: process.env.STAGE_API_VERSION,
    API_HOST: process.env.STAGE_API_HOST,
    ORCID_CLIENT_ID: process.env.STAGE_ORCID_CLIENT_ID,
    ORCID_URL: process.env.STAGE_ORCID_URL,
    SENTRY_DSN: process.env.STAGE_SENTRY_DSN,
    SENTRY_ENV: process.env.STAGE_SENTRY_ENV
  }

  const env = isProduction ? productionEnv : stageEnv

  return {
    env,
    experimental: {
      productionBrowserSourceMaps: true
    },
    webpack: (baseConfig) => {
      const config = { ...baseConfig }
      config.devtool = 'source-map'
      config.resolveLoader.modules.push(path.resolve(__dirname, 'loaders'))
      config.module.rules.push({
        test: /\.md$/,
        use: ['raw-loader', 'template-literal-loader']
      })
      return config
    }
  }
}
