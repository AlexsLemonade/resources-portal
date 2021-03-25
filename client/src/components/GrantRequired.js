import React from 'react'
import ResourceAddNoGrantRequestForm from 'components/ResourceAddNoGrantRequestForm'
import { Loader } from 'components/Loader'
import { useUser } from 'hooks/useUser'

import { Modal } from 'components/Modal'

export default ({ children }) => {
  const { isAbleToAddResources } = useUser()
  const [userOk, setUserOk] = React.useState()

  React.useEffect(() => {
    const asyncCheck = async () => {
      setUserOk(await isAbleToAddResources())
    }
    if (userOk === undefined) asyncCheck()
  })

  if (userOk === undefined) return <Loader />

  // show feature request form if user does not have a grant
  if (!userOk) {
    return (
      <>
        {children}
        <Modal showing nondismissable>
          <ResourceAddNoGrantRequestForm />
        </Modal>
      </>
    )
  }

  return children
}
