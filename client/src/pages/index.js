import qs from 'qs'
import React, { Component } from 'react'
import api, { path } from '../api'
import StoreToken from '../components/StoreToken'

export default class Home extends Component {
  static async getInitialProps(query, req, res) {
    // finish login and redirect
    if (query.code && query.origin_url) {
      const { originURL } = qs.parse(query.origin_url)
      console.log('Here is the origin url: ', originURL)
      const { email } = qs.parse(originURL, {
        ignoreQueryPrefix: true
      })
      console.log('email: ', email)
      const tokenJson = await api.authenticate(query.code, email, originURL)
      console.log('Token: ', tokenJson.response.token)
      if (tokenJson.response.token) {
        if (req && query.origin_url) {
          res.writeHead(302, { Location: originURL })
          res.end()
        }
        localStorage.setItem('token', tokenJson.response.token)
        return { token: tokenJson.response.token }
      }

      console.log('token not found, response was ', tokenJson)
    } else {
      console.log('No origin url provided')
    }
    return {}
  }

  render() {
    return (
      <div className="container">
        <main>
          <h1 className="title">TODO: Landing page goes here</h1>
          <h3>Api client at: {path}</h3>
          <StoreToken token={this.props.token} />
        </main>
      </div>
    )
  }
}
