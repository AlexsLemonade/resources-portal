import React from 'react'
import dynamic from 'next/dynamic'
import { Box } from 'grommet'
import { CreateUserContextProvider } from 'contexts/CreateUserContext'
import zipGrantParams from 'helpers/zipGrantParams'

const CreateUser = dynamic(() => import('components/CreateUser'), {
  ssr: false
})

const CreateAccount = ({ ORCID, defaultUser, code, clientPath, stepName }) => {
  return (
    <CreateUserContextProvider defaultUser={defaultUser}>
      <Box fill align="center" justify="center">
        <Box width="large" margin={{ bottom: 'xlarge' }}>
          <CreateUser
            ORCID={ORCID}
            clientPath={clientPath}
            code={code}
            stepName={stepName}
          />
        </Box>
      </Box>
    </CreateUserContextProvider>
  )
}

CreateAccount.getInitialProps = async ({ req, query }) => {
  if (!req) return {}

  const grants = zipGrantParams(query)
  const userInfo = { grants, email: query.email }
  const defaultUser = grants.length > 0 || query.email ? userInfo : undefined

  return {
    ORCID: query.ORCID,
    defaultUser,
    code: query.code,
    clientPath: req ? req.url : '',
    stepName: query.stepName
  }
}

export default CreateAccount
