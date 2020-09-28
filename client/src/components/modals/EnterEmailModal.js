import { Box, Button, Text, TextInput } from 'grommet'
import * as React from 'react'
import { string } from 'yup'
import { Modal } from '../Modal'

export const EnterEmailModal = ({ onSubmit }) => {
  const [localEmail, setLocalEmail] = React.useState('')
  const validEmail = () => {
    const schema = string().email().required()
    try {
      schema.validateSync(localEmail)
    } catch (e) {
      return false
    }
    return true
  }
  return (
    <Modal showing nondismissable>
      <Box pad="medium" gap="medium" width={{ min: '400px' }}>
        <Box>
          <Text>
            We were unable to retrieve your email from ORCID. Please provide an
            email address to associate with your CCRR Portal account.
          </Text>
        </Box>
        <TextInput
          width="300px"
          placeholder="Enter email"
          onChange={(event) => setLocalEmail(event.target.value)}
          value={localEmail || ''}
          type="email"
        />
        <Box width="200px" alignSelf="center">
          <Button
            label="Submit"
            disabled={!validEmail()}
            onClick={() => onSubmit(localEmail)}
          />
        </Box>
      </Box>
    </Modal>
  )
}

export default EnterEmailModal
