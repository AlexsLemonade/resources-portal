import React from 'react'
import { Box, Button, Text } from 'grommet'
import { Modal } from 'components/Modal'
import useRequest from 'hooks/useRequest'

export default () => {
  const { updateStatus } = useRequest()
  const [showModal, setShowModal] = React.useState(false)
  const cancelRequest = () => updateStatus('CANCELLED')

  return (
    <>
      <Box
        direction="row"
        justify="end"
        align="center"
        gap="medium"
        border={{ side: 'top' }}
        pad={{ vertical: 'large' }}
      >
        <Text weight="bold">No longer interested in this resource?</Text>
        <Button
          critical
          label="Cancel Request"
          onClick={() => setShowModal(true)}
        />
      </Box>
      <Modal
        showing={showModal}
        setShowing={setShowModal}
        title="Cancel Request"
      >
        <Box width="large">
          <Text>Confirm that you want to cancel your request</Text>
          <Box direction="row" justify="end">
            <Button critical label="Cancel Request" onClick={cancelRequest} />
          </Box>
        </Box>
      </Modal>
    </>
  )
}
