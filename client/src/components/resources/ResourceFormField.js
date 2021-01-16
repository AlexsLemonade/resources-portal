import React from 'react'
import { Box, Button, TextInput, TextArea } from 'grommet'
import { getReadable } from 'helpers/readableNames'
import Icon from 'components/Icon'
import AttributeFormField from 'components/AttributeFormField'
import { getInputType } from '.'

// This Component Takes a resource attribute
// it uses the attribute to determine the input type
// some selects allow for an "Other" option
// this component sets an additional attribute
// which is the same attribute token with `_other` appended
export const ResourceFormField = ({
  attribute,
  getAttribute,
  setAttribute,
  contactUserOptions,
  error,
  disabled = false,
  optionalAttributes = []
}) => {
  const inputType = getInputType(attribute)
  const attributeName = getReadable(attribute)
  const otherAttribute = `${attribute}_other`

  const unsafeInputValue = getAttribute(attribute)
  const inputValue = unsafeInputValue || (inputType === 'list' ? [''] : '')

  const otherInputValue = getAttribute(otherAttribute) || ''

  const onOtherInputChange = ({ target: { value } }) => {
    setAttribute(otherAttribute, value)
  }

  const hasOther = Array.isArray(inputValue)
    ? inputValue.indexOf('Other') >= 0
    : inputValue === 'Other'

  const isMultiple = inputType === 'multiselect'

  const listRef = React.useRef([])
  if (inputType === 'list' && listRef.current.length === 0) {
    const now = Date.now()
    listRef.current = inputValue.map((_, index) => `${now}-${index}`)
  }

  const addAnotherDisabled = inputValue.includes && inputValue.includes('')
  const addAnotherColor = addAnotherDisabled ? 'black-tint-60' : 'brand'

  return (
    <Box>
      {inputType === 'list' ? (
        inputValue.map((value, index) => (
          <AttributeFormField
            key={listRef.current[index]}
            labeled={index === 0}
            error={error}
            attribute={attribute}
            inputType={inputType}
            inputValue={inputValue[index]}
            unsafeInputValue={unsafeInputValue}
            isMultiple={isMultiple}
            setAttribute={(attr, indexValue) => {
              const newValue = [...inputValue]
              newValue[index] = indexValue
              setAttribute(attr, newValue)
            }}
            contactUserOptions={contactUserOptions}
            disabled={disabled}
            optionalAttributes={optionalAttributes}
          />
        ))
      ) : (
        <AttributeFormField
          labeled
          error={error}
          attribute={attribute}
          inputType={inputType}
          inputValue={inputValue}
          unsafeInputValue={unsafeInputValue}
          isMultiple={isMultiple}
          setAttribute={setAttribute}
          contactUserOptions={contactUserOptions}
          disabled={disabled}
          optionalAttributes={optionalAttributes}
        />
      )}
      {inputType === 'list' && (
        /* -- Button to insert a new element into list type -- */
        <Box direction="row" justify="between">
          <Button
            disabled={addAnotherDisabled}
            icon={<Icon size="small" name="Plus" color={addAnotherColor} />}
            plain
            label="Add Another"
            onClick={() => {
              listRef.current = [...listRef.current, `${Date.now()}`]
              setAttribute(attribute, [...inputValue, ''])
            }}
          />
          <Button
            plain
            disabled={inputValue.length === 1}
            label={`Remove Empty ${attributeName}`}
            onClick={() => {
              const newValue = inputValue.filter((val) => val !== '')
              setAttribute(attribute, newValue)
            }}
          />
        </Box>
      )}
      {hasOther && isMultiple && (
        /* -- Text Input For Single Selects -- */
        <TextInput
          margin={{ top: 'xlarge' }}
          placeholder={`Specify additional ${attributeName}`}
          onChange={onOtherInputChange}
          value={otherInputValue}
        />
      )}
      {hasOther && !isMultiple && (
        /* -- Text Area For Single Selects -- */
        <TextArea
          margin={{ top: 'xlarge' }}
          placeholder={`Please specify ${attributeName}`}
          onChange={onOtherInputChange}
          value={otherInputValue}
        />
      )}
    </Box>
  )
}
