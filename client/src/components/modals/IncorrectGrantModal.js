import api from 'api'
import { Box, Button, Heading, Text, TextArea } from 'grommet'
import { useUser } from 'hooks/useUser'
import * as React from 'react'
import { Modal } from '../Modal'

export const IncorrectGrantModalContent = ({ setShowing, setAlert }) => {
  const [message, setMessage] = React.useState('')
  const { token } = useUser()
  const onChange = (newMessage) => {
    setMessage(newMessage)
  }
  const onClick = async () => {
    setShowing(false)
    if (message) {
      const response = await api.user.submitGrantComplaint(message, token)
      console.log(response)
      if (response.isOk) {
        setAlert({
          message:
            'Your message was sent to the ALSF Grants Team. They will be in touch with you shortly.',
          type: 'success'
        })
      } else {
        setAlert({
          message: 'There was an error submitting the issue.',
          type: 'error'
        })
      }
    }
  }
  return (
    <Box
      width="600px"
      height="350px"
      margin={{ left: 'large', right: 'large', bottom: 'large' }}
      gap="medium"
    >
      <Box
        fill="horizontal"
        border={[{ size: 'small', side: 'bottom', color: 'black-tint-95' }]}
        height={{ min: '50px' }}
      >
        <Heading serif margin={{ top: 'none', bottom: 'small' }} level="5">
          Report Incorrect/Missing Information
        </Heading>
      </Box>
      <Box direction="row" gap="small">
        <Text weight="bold">Tell us what is wrong</Text>
        <Text italic="true" color="error">
          (Required)
        </Text>
      </Box>
      <Box>
        <Text size="small" color="black-tint-40">
          We will notify the ALSF Grants Team in order to update your grant
          information.
        </Text>
      </Box>
      <Box height="250px">
        <TextArea
          height="200px"
          fill
          resize={false}
          onChange={(event) => onChange(event.target.value)}
        />
      </Box>
      <Box alignSelf="end" width="100px" margin={{ top: 'large' }}>
        <Button label="Send" onClick={onClick} disabled={!message} primary />
      </Box>
    </Box>
  )
}

export const IncorrectGrantModal = ({ showing, setShowing, setAlert }) => {
  return (
    <Modal showing={showing} setShowing={setShowing}>
      <IncorrectGrantModalContent setShowing={setShowing} setAlert={setAlert} />
    </Modal>
  )
}

export default IncorrectGrantModal
