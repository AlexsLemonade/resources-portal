import React from 'react'
import { Box, Select, TextArea, TextInput } from 'grommet'
import { getInputOptions, getAutoCompleteOptions } from '.'
import SequenceMapsInput from './SequenceMapsInput'

export default ({
  attribute,
  inputType,
  inputValue,
  isMultiple,
  setAttribute,
  contactUserOptions,
  disabled = false
}) => {
  const inputOptions = getInputOptions(attribute)
  const onInputChange = ({ target: { value } }) => {
    setAttribute(attribute, value)
  }
  const parseValue = (type, value, fallback) => {
    let parsed = NaN
    if (type === 'float') {
      parsed = parseFloat(value)
      if (`${value}`.endsWith('.')) {
        parsed = `${parsed}.`
      }
    }
    if (type === 'integer') {
      parsed = parseInt(value, 10)
    }

    if (value === '') return ''

    if (Number.isNaN(parsed)) return fallback

    return parsed
  }
  const onFloatChange = ({ target: { value } }) =>
    setAttribute(attribute, parseValue('float', value, inputValue))
  const onIntegerChange = ({ target: { value } }) =>
    setAttribute(attribute, parseValue('integer', value, inputValue))

  switch (inputType) {
    case 'textarea':
      return (
        <Box height="100px">
          <TextArea fill value={inputValue} onChange={onInputChange} />
        </Box>
      )
    case 'select':
    case 'multiselect':
      return (
        <Select
          isDrop
          multiple={isMultiple}
          closeOnChange={!isMultiple}
          value={inputValue}
          options={inputOptions}
          onChange={({ value }) => setAttribute(attribute, value)}
          messages={{ multiple: 'Multiple Options Selected' }}
        />
      )
    case 'sequencemaps':
      return (
        <SequenceMapsInput
          inputValue={inputValue || []}
          onDone={(uploads) => setAttribute(attribute, uploads)}
        />
      )
    case 'contactuser':
      return (
        <Select
          closeOnChange
          labelKey={(user) => `${user.full_name} | ${user.email}`}
          valueKey="id"
          value={{ id: inputValue }}
          options={contactUserOptions}
          onChange={({ value }) => setAttribute(attribute, value)}
        />
      )
    case 'float':
      return <TextInput value={inputValue} onChange={onFloatChange} />
    case 'integer':
      return <TextInput value={inputValue} onChange={onIntegerChange} />
    default:
      return (
        <TextInput
          disabled={disabled}
          value={inputValue}
          onChange={onInputChange}
          suggestions={getAutoCompleteOptions(attribute, inputValue)}
          onSelect={({ suggestion }) => setAttribute(attribute, suggestion)}
        />
      )
  }
}
