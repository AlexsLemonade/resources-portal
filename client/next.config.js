const path = require('path')

module.exports = () => {
  return {
    env: {
      API_VERSION: 'v1',
      API_HOST: process.env.API_HOST,
      CLIENT_HOST: process.env.CLIENT_HOST,
      ORCID_CLIENT_ID: process.env.ORCID_CLIENT_ID,
      ORCID_URL: process.env.ORCID_URL,
      SENTRY_DSN: process.env.SENTRY_DSN,
      SENTRY_ENV: process.env.SENTRY_ENV
    },
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
