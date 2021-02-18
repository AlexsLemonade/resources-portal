import React from 'react'
import { Box, Button, FormField, Text, TextArea } from 'grommet'
import { Modal } from 'components/Modal'
import useRequest from 'hooks/useRequest'

export default () => {
  const { rejectRequestWithReason } = useRequest()
  const [showModal, setShowModal] = React.useState(false)
  const [rejectionReason, setRejectionReason] = React.useState('')
  const rejectRequest = async () => {
    await rejectRequestWithReason(rejectionReason)
    setShowModal(false)
  }

  return (
    <>
      <Button
        critical
        label="Reject Request"
        onClick={() => setShowModal(true)}
      />
      <Modal
        showing={showModal}
        setShowing={setShowModal}
        title="Reject Request"
      >
        <Box width="large">
          <Text>Please enter why this request is being rejected.</Text>
          <FormField label="Add Rejection Reason">
            <TextArea
              value={rejectionReason}
              onChange={({ target: { value } }) => setRejectionReason(value)}
            />
          </FormField>
          <Box direction="row" justify="end">
            <Button
              critical
              label="Reject Request"
              onClick={rejectRequest}
              disabled={rejectionReason.length === 0}
            />
          </Box>
        </Box>
      </Modal>
    </>
  )
}
