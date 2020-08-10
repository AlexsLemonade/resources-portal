import React from 'react'
import api, { path } from '../api'
import StoreToken from '../components/StoreToken'

const Home = ({ token }) => (
  <div className="container">
    <main>
      <h1 className="title">TODO: Landing page goes here</h1>
      <h3>Api client at: {path}</h3>
      <StoreToken token={token} />
    </main>
  </div>
)

Home.getInitialProps = async ({ query, req, res }) => {
  // finish login and redirect
  const originURL = 'http%3A%2F%2Flocalhost%3A7000%2F%3Femail%3Dtest%40test.com'
  if (query.code && originURL) {
    const tokenJson = await api.authenticate(query.code, query.email, originURL)
    console.log(tokenJson.response.token)
    if (tokenJson.response.token) {
      if (req && originURL) {
        res.writeHead(302, { Location: originURL })
        res.end()
      }
      return { token: tokenJson.response.token }
    }
  }
  return {}
}

export default Home
