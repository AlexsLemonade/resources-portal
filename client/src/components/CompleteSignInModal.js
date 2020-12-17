import React from 'react'
import { Modal } from 'components/Modal'
import CreateAccountDetailsForm from 'components/CreateAccountDetailsForm'
import { Loader } from 'components/Loader'
import { useCreateUser } from 'hooks/useCreateUser'

export default ({ code, clientPath }) => {
  const { required } = useCreateUser(code, clientPath)

  // this prevents the modal flashing open
  if (!required) return <Loader />

  return (
    <Modal showing nondismissable title="Complete to Sign In">
      <CreateAccountDetailsForm />
    </Modal>
  )
}
