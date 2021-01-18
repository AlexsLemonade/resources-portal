import React from 'react'
import { Anchor, Box, Select, TextArea, TextInput } from 'grommet'
import parseValue from 'helpers/parseValue'
import debounce from 'helpers/debounce'
import { getInputOptions, getAutoCompleteOptions } from '.'
import SequenceMapsInput from './SequenceMapsInput'

export default ({
  attribute,
  inputType,
  inputValue,
  unsafeInputValue,
  isMultiple,
  setAttribute,
  contactUserOptions,
  disabled = false
}) => {
  const updateRef = React.useRef(debounce(setAttribute, 300))
  const [localValue, setLocalValue] = React.useState(inputValue)
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

  // This isnt ideal but handling boolean and undefined values
  // in selects has issues.
  const booleanOptions = ['Yes', 'No', 'Not Specified']
  const getBooleanString = (value) => {
    if (typeof value === 'undefined') return 'Not Specified'
    if (value.length === 0) return 'Not Specified'
    return value ? 'Yes' : 'No'
  }
  const getBooleanValue = (string) => {
    if (string === 'Yes') return true
    if (string === 'No') return false
    return undefined
  }

  React.useEffect(() => {
    updateRef.current(attribute, localValue)
  }, [localValue])

  switch (inputType) {
    case 'textarea':
      return (
        <Box height="100px">
          <TextArea fill value={localValue} onChange={onInputChange} />
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
              value={localValue}
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
          value={{ id: localValue }}
          options={contactUserOptions}
          onChange={onSelectChange}
        />
      )
    case 'boolean':
      return (
        <Select
          closeOnChange
          value={getBooleanString(localValue || unsafeInputValue)}
          options={booleanOptions}
          onChange={onBooleanChange}
        />
      )
    case 'float':
      return <TextInput value={localValue} onChange={onFloatChange} />
    case 'integer':
      return <TextInput value={localValue} onChange={onIntegerChange} />
    default:
      return (
        <TextInput
          disabled={disabled}
          value={localValue}
          onChange={onInputChange}
          suggestions={getAutoCompleteOptions(attribute, inputValue)}
          onSelect={onSuggestionChange}
        />
      )
  }
}
