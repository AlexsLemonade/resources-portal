import React from 'react'
import api, { path } from '../api'
import { useUser } from '../hooks/useUser'

export const Home = ({ authenticatedUser, token, redirectUrl }) => {
  const { user } = useUser(authenticatedUser, token, redirectUrl)

  console.log('authenticatedUser: ', user)

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
  if (!query.code) {
    return {}
  }

  let queryJSON = {}

  if (query.json) {
    queryJSON = JSON.parse(query.json)
  }

  const [tokenRequest, userRequest] = await api.user.login(
    query.code,
    decodeURI(`http://${req.headers.host}${req.url}`),
    queryJSON
  )

  const initialProps = {}

  if (tokenRequest.isOk) {
    initialProps.token = tokenRequest.response.token
    initialProps.redirectUrl = queryJSON.origin_url
  }

  if (userRequest.isOk) {
    initialProps.authenticatedUser = userRequest.response
  }

  return initialProps
}

export default Home
