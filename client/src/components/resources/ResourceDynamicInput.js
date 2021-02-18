import React from 'react'
import { Anchor, Box, Select, TextArea, TextInput } from 'grommet'
import parseValue from 'helpers/parseValue'
import { debouncer } from 'helpers/debounce'
import {
  getBooleanValue,
  getBooleanString,
  booleanOptions
} from 'helpers/booleanOptions'
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
  const updateRef = React.useRef(debouncer(250))
  const [localValue, setLocalValue] = React.useState(inputValue)
  const safeLocalValue = localValue || ''
  const inputOptions = getInputOptions(attribute)
  const onFloatChange = ({ target: { value } }) =>
    setLocalValue(parseValue('float', value, inputValue))
  const onIntegerChange = ({ target: { value } }) =>
    setLocalValue(parseValue('integer', value, inputValue))
  const onInputChange = ({ target: { value } }) => setLocalValue(value)
  const onSelectChange = ({ value }) => setLocalValue(value)
  const onUploadChange = (uploads) => setLocalValue(uploads)
  const onBooleanChange = ({ value }) => setLocalValue(getBooleanValue(value))
  const onSuggestionChange = ({ suggestion }) => setLocalValue(suggestion)

  const booleanValue = getBooleanString(localValue)
  const contactUser =
    typeof safeLocalValue === 'object' ? safeLocalValue : { id: safeLocalValue }

  React.useEffect(() => {
    if (localValue !== inputValue) {
      updateRef.current(setAttribute, attribute, localValue)
    }
  }, [localValue])

  switch (inputType) {
    case 'textarea':
      return (
        <Box height="100px">
          <TextArea fill value={safeLocalValue} onChange={onInputChange} />
        </Box>
      )
    case 'select':
    case 'multiselect':
      return (
        <Select
          isDrop
          multiple={isMultiple}
          closeOnChange={!isMultiple}
          value={localValue}
          options={inputOptions}
          onChange={onSelectChange}
          messages={{ multiple: 'Multiple Options Selected' }}
        />
      )
    case 'sequencemaps':
      return (
        <SequenceMapsInput
          inputValue={localValue || []}
          onDone={onUploadChange}
        />
      )
    case 'biosafety_level':
      return (
        <Box direction="row" justify="start" align="center" gap="small">
          <Box border={{ color: 'black-tint-60' }} round="xsmall">
            <Select
              plain
              closeOnChange
              value={safeLocalValue}
              options={inputOptions}
              onChange={onSelectChange}
            />
          </Box>
          <Anchor
            label="Biosafety Level Guide"
            href="https://www.cdc.gov/labs/BMBL.html"
            target="_blank"
          />
        </Box>
      )
    case 'contactuser':
      return (
        <Select
          closeOnChange
          labelKey={(user) => `${user.full_name} | ${user.email}`}
          valueKey="id"
          value={contactUser}
          options={contactUserOptions}
          onChange={onSelectChange}
        />
      )
    case 'boolean':
      return (
        <Select
          closeOnChange
          placeholder=""
          value={booleanValue}
          options={booleanOptions}
          onChange={onBooleanChange}
        />
      )
    case 'float':
      return <TextInput value={safeLocalValue} onChange={onFloatChange} />
    case 'integer':
      return <TextInput value={safeLocalValue} onChange={onIntegerChange} />
    default:
      return (
        <TextInput
          disabled={disabled}
          value={safeLocalValue}
          onChange={onInputChange}
          suggestions={getAutoCompleteOptions(attribute, inputValue)}
          onSelect={onSuggestionChange}
        />
      )
  }
}
