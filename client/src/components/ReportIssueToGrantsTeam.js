import React from 'react'
import { Box, Button, FormField, TextArea } from 'grommet'
import { Modal } from 'components/Modal'
import { useAlertsQueue } from 'hooks/useAlertsQueue'
import { useUser } from 'hooks/useUser'
import api from 'api'

export default ({
  buttonLabel = 'Report Issue',
  modalTitle = 'Report Incorrect/Missing Information To The Grants Team',
  helperText,
  request = {},
  plain = false
}) => {
  const { token } = useUser()
  const { addAlert } = useAlertsQueue()
  const [showing, setShowing] = React.useState(false)
  const [message, setMessage] = React.useState('')
  const submitIssue = async () => {
    setShowing(false)
    const issue = { message }
    if (request.id) issue.material_request_id = request.id
    const issueRequest = await api.issues.create(issue, token)
    if (issueRequest.isOk)
      return addAlert(
        'Your message was sent to the ALSF Grants Team. They will be in touch with you shortly.',
        'success'
      )
    return addAlert('There was an error submitting the issue.', 'error')
  }

  return (
    <>
      {plain ? (
        <Button plain label={buttonLabel} onClick={() => setShowing(true)} />
      ) : (
        <Button label={buttonLabel} onClick={() => setShowing(true)} />
      )}
      <Modal title={modalTitle} showing={showing} setShowing={setShowing}>
        <Box gap="medium">
          <FormField label="Tell us what is wrong (Required)" info={helperText}>
            <TextArea
              height="200px"
              resize={false}
              onChange={({ target: { value } }) => setMessage(value)}
            />
          </FormField>
          <Button
            alignSelf="end"
            label="Send"
            onClick={submitIssue}
            disabled={!message}
            primary
          />
        </Box>
      </Modal>
    </>
  )
}
