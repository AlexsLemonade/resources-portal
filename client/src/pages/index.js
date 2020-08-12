import React from 'react'
import api, { path } from '../api'
import { useUser } from '../hooks/useUser'

export const Home = ({ authenticatedUser, token, redirectUrl }) => {
  useUser(authenticatedUser, token, redirectUrl)

  console.log('authenticatedUser: ', authenticatedUser)

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
  // Revisit how to present errors thrown from this function
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

  if (!tokenRequest.isOk || !tokenRequest.response.token) {
    return tokenRequest
  }

  console.log('token: ', tokenRequest)

  const userRequest = await api.user.getInfo(
    tokenRequest.response.user_id,
    tokenRequest.response.token
  )

  if (!userRequest.isOk || !userRequest.response.id) {
    return userRequest
  }

  console.log('The user is: ', userRequest)

  return {
    authenticatedUser: userRequest.response,
    token: tokenRequest.response.token,
    redirectUrl: queryJSON.origin_url
  }
}

export default Home
