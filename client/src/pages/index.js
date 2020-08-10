import qs from 'qs'
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
  if (query.code && query.origin_url) {
    const { email } = qs.parse(this.props.location.search, {
      ignoreQueryPrefix: true
    })
    console.log('email: ', email)
    const tokenJson = await api.authenticate(
      query.code,
      email,
      query.origin_url
    )
    console.log('Token: ', tokenJson.response.token)
    if (tokenJson.response.token) {
      if (req && query.origin_url) {
        res.writeHead(302, { Location: query.origin_url })
        res.end()
      }
      return { token: tokenJson.response.token }
    }
  }
  return {}
}

export default Home
