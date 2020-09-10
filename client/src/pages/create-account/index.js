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

const zipGrants = (grantTitles, grantFunderId) => {
  return grantTitles.map((title, index) => {
    return { title, funder_id: grantFunderId[index] }
  })
}

CreateAccount.getInitialProps = async ({ req, query }) => {
  let grants
  if (query.grant_title && query.grant_funder_id) {
    grants = zipGrants(query.grant_title, query.grant_funder_id)
  }

  return {
    ORCID: query.ORCID,
    email: query.email,
    grants,
    code: query.code,
    originUrl: decodeURI(`http://${req.headers.host}${req.url}`),
    stepName: query.stepName
  }
}

export default CreateAccount
