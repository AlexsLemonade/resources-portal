import React from 'react'
import { Button } from 'grommet'
import CreateOrLogin from 'components/CreateOrLogin'
import { LoginButton } from './LoginButton'
import { Modal } from './Modal'

export default ({ title, buttonLabel, showSignIn, plainButton }) => {
  const [showing, setShowing] = React.useState(false)

  return (
    <>
      {!plainButton && (
        <LoginButton onClick={() => setShowing(true)} label={buttonLabel} />
      )}
      {plainButton && (
        <Button primary onClick={() => setShowing(true)} label={title} />
      )}
      <Modal showing={showing} setShowing={setShowing}>
        <CreateOrLogin title={title} showSignIn={showSignIn} />
      </Modal>
    </>
  )
}
