import React from 'react'
import api, { path } from '../api'
import { ResourcesPortalContext } from '../ResourcesPortalContext'

export const Home = ({ currentUser }) => {
  const user = React.useContext(ResourcesPortalContext)
  user.setUser(currentUser)

  return (
    <div className="container">
      <main>
        <h1 className="title">TODO: Landing page goes here</h1>
        <h3>Api client at: {path}</h3>
      </main>
    </div>
  )
}

Home.getInitialProps = async ({ req, query }) => {
  // finish login and redirect
  if (!(query.code && query.json)) {
    return {}
  }

  const queryJSON = JSON.parse(query.json)

  console.log(
    'tokenrequest: ',
    decodeURI(`http://${req.headers.host}${req.url}`)
  )

  const tokenRequest = await api.user.authenticate({
    ...queryJSON,
    origin_url: decodeURI(`http://${req.headers.host}${req.url}`),
    code: query.code
  })

  if (!tokenRequest.response.token) {
    return { error: tokenRequest }
  }

  const userRequest = await api.user.getInfo(
    tokenRequest.response.user_id,
    tokenRequest.response.token
  )

  console.log('The user is: ', userRequest)

  return {
    currentUser: userRequest.response,
    token: tokenRequest.response.token,
    redirectUrl: queryJSON.origin_url
  }
}

export default Home
