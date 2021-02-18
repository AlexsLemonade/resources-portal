import React from 'react'
import { Box, Button, FormField, Text, TextArea } from 'grommet'
import { Modal } from 'components/Modal'
import useRequest from 'hooks/useRequest'

export default () => {
  const {
    createIssue,
    request: {
      material: {
        organization: { name: teamName }
      }
    }
  } = useRequest()
  const [issue, setIssue] = React.useState('')
  const [showReportModal, setShowReportModal] = React.useState(false)

  // Report Issues
  const sendIssue = async () => {
    // TODO: remove this eagar modal hide
    // when buttons wait for async to callback to finish
    setShowReportModal(false)
    const issueRequest = createIssue(issue)
    if (issueRequest.isOk) setIssue('')
    setShowReportModal(!issueRequest.isOk)
  }

  return (
    <Box pad={{ bottom: 'large' }}>
      <Modal
        title="Report Issue with Resource"
        showing={showReportModal}
        setShowing={setShowReportModal}
      >
        <FormField label="Please describe the issue in detail below.">
          <TextArea
            value={issue}
            onChange={({ target: { value } }) => setIssue(value)}
          />
        </FormField>
        <Box direction="row" justify="end">
          <Button label="Send" onClick={sendIssue} />
        </Box>
      </Modal>
      <Text textAlign="center">
        Problem with received resources?{' '}
        <Button
          plain
          label={`Let ${teamName} know`}
          onClick={() => setShowReportModal(true)}
        />
      </Text>
    </Box>
  )
}
