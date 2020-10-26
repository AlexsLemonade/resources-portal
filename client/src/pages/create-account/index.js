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
  if (!req) {
    return {}
  }

  // Process grants. If there are multiple grants provided, zip the arrays of titles and funder ids.
  // If not, create an object from the title and funder id.
  let grants
  if (query.grant_title && query.grant_funder_id) {
    if (
      Array.isArray(query.grant_title) &&
      Array.isArray(query.grant_funder_id)
    ) {
      grants = zipGrants(query.grant_title, query.grant_funder_id)
    } else {
      grants = [{ title: query.grant_title, funder_id: query.grant_funder_id }]
    }
  }

  return {
    ORCID: query.ORCID,
    email: query.email,
    grants,
    code: query.code,
    originUrl: decodeURI(`${process.env.CLIENT_HOST}${req.url}`),
    stepName: query.stepName
  }
}

export default CreateAccount
