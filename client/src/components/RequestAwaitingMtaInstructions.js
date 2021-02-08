import React from 'react'
import { Box, Text } from 'grommet'
import { List, ListItem, NumberMarker } from 'components/List'
import useRequest from 'hooks/useRequest'

export default () => {
  const { requestRequirements } = useRequest()
  const {
    needsIrb,
    shippingRequirement: { needsPayment }
  } = requestRequirements

  const awaitingMtaAndDocuments = needsIrb || needsPayment
  const steps = []
  if (awaitingMtaAndDocuments) {
    steps.push('Review the additional documents submitted by the requests')
  }
  steps.push('Sign and upload the fully executed MTA')

  return awaitingMtaAndDocuments ? (
    <>
      <Text margin={{ bottom: 'medium' }}>Please:</Text>
      <Box pad={{ left: 'large' }}>
        <List>
          {steps.map((d, index) => (
            <ListItem
              key={d}
              markerMargin={{ top: 'none', right: 'small' }}
              marker={<NumberMarker number={index + 1} />}
            >
              {d}
            </ListItem>
          ))}
        </List>
      </Box>
    </>
  ) : (
    <Text weight="bold">
      Please {`${steps[0][0].toLowerCase()}${steps[0].slice(1)}`}
    </Text>
  )
}
