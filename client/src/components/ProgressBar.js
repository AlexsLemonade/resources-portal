import React from 'react'
import { Box, Text } from 'grommet'
import styled from 'styled-components'

const ProgressBarBox = styled(Box)`
  transition: background-color 0.2s ease-in-out;
`

const ProgressBarText = styled(Text)`
  transition: color 0.2s ease-in-out;
`

const dotInset = '24px'

const getStepTextAlignment = (index, steps) => {
  if (index === 0) return 'start'
  if (index === steps.length - 1) return 'end'
  return 'center'
}

export const ProgressBar = ({ steps = [], index = -1 }) => {
  return (
    <Box direction="row" fill="horizontal">
      {steps.map((stepName, stepIndex) => (
        <Box key={stepName} flex="grow">
          <Box direction="row" align="center">
            {stepIndex !== 0 ? (
              <ProgressBarBox
                fill="horizontal"
                height="3px"
                background={stepIndex <= index ? 'brand' : 'black-tint-80'}
              />
            ) : (
              <Box width={dotInset} />
            )}
            <ProgressBarBox
              pad="12px"
              width="24px"
              round
              background={stepIndex <= index ? 'brand' : 'black-tint-80'}
            />
            {stepIndex !== steps.length - 1 ? (
              <ProgressBarBox
                fill="horizontal"
                height="3px"
                background={stepIndex < index ? 'brand' : 'black-tint-80'}
              />
            ) : (
              <Box width={dotInset} />
            )}
          </Box>
          <ProgressBarText
            size="small"
            color={stepIndex <= index ? 'brand' : 'black-tint-80'}
            textAlign={getStepTextAlignment(stepIndex, steps)}
          >
            {stepName}
          </ProgressBarText>
        </Box>
      ))}
    </Box>
  )
}
