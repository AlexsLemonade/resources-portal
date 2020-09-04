import { CreateUserContextProvider } from 'contexts/CreateUserContext'
import { Box } from 'grommet'
import dynamic from 'next/dynamic'
import React from 'react'

const CreateUser = dynamic(() => import('components/CreateUser'), {
  ssr: false
})
const CreateAccount = (props) => {
  return (
    <CreateUserContextProvider>
      <Box width={{ min: '500px', max: '800px' }} margin={{ bottom: 'xlarge' }}>
        <CreateUser props={props} />
      </Box>
    </CreateUserContextProvider>
  )
}

CreateAccount.getInitialProps = async ({ req, query }) => {
  let queryJSON = {}

  if (query.json) {
    queryJSON = JSON.parse(query.json)
  }

  return {
    ORCID: query.ORCID,
    email: query.email,
    grants: queryJSON.grant_info,
    code: query.code,
    originUrl: decodeURI(`http://${req.headers.host}${req.url}`),
    stepName: query.stepName
  }
}

export default CreateAccount
