import React from 'react'
import { Box, RadioButtonGroup, RadioButton, Text } from 'grommet'
import styled from 'styled-components'

const StyledRadioButtonGroup = styled(RadioButtonGroup)`
  label {
    align-items: start;
    > div:first-child {
      margin-top: 6px;
    }
  }
`

export const StyledLabel = ({ option }) => {
  return (
    <Box>
      <Text>{option.label}</Text>
      {option.description && (
        <Text color="black-tint-40">{option.description}</Text>
      )}
    </Box>
  )
}

export default ({ children, onChange, ...props }) => {
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <StyledRadioButtonGroup {...props}>
      {children ||
        ((option, { checked, hover }) => (
          <RadioButton
            checked={checked}
            hover={hover}
            value={option.value}
            onChange={onChange}
            label={<StyledLabel option={option} />}
          />
        ))}
    </StyledRadioButtonGroup>
  )
}
