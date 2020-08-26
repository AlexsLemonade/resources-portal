import React from 'react'
import { Box, CheckBox, Text } from 'grommet'

export const LabelWithInfo = ({ label, info }) => {
  return (
    <Box>
      <Text>{label}</Text>
      <Text color="black-tint-40" size="small">
        {info}
      </Text>
    </Box>
  )
}

export const CheckBoxWithInfo = ({
  disabled,
  checked,
  label,
  info,
  margin,
  onChange,
  id,
  name
}) => {
  const CheckBoxLabel = <LabelWithInfo label={label} info={info} />
  return (
    <CheckBox
      disabled={disabled}
      checked={checked}
      label={CheckBoxLabel}
      margin={margin}
      onChange={onChange}
      id={id}
      name={name}
    />
  )
}
