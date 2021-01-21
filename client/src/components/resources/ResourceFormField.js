import React from 'react'
import { Box, Button, FormField, TextInput, TextArea } from 'grommet'
import { getReadable } from 'helpers/readableNames'
import Icon from 'components/Icon'
import ResourceFormFieldLabel from 'components/resources/ResourceFormFieldLabel'
import ResourceDynamicInput from 'components/resources/ResourceDynamicInput'
import HelperText from 'components/InputHelperText'
import FormFieldErrorLabel from 'components/FormFieldErrorLabel'
import FormFieldMustExistLabel from 'components/FormFieldMustExistLabel'
import { getMustExistAt, getInputType } from 'components/resources'

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
  const fallbackValue = inputType === 'list' ? [undefined] : undefined
  const inputValue =
    unsafeInputValue || unsafeInputValue === null
      ? unsafeInputValue
      : fallbackValue

  const otherInputValue = getAttribute(otherAttribute) || ''

  const onOtherInputChange = ({ target: { value } }) => {
    setAttribute(otherAttribute, value)
  }

  const hasOther = Array.isArray(inputValue)
    ? inputValue.indexOf('Other') >= 0
    : inputValue === 'Other'

  const isMultiple = inputType === 'multiselect'
  const isList = inputType === 'list'

  const keyRef = React.useRef(
    isList
      ? inputValue.map((_, index) => `${attribute}-${index}`)
      : [`${attribute}-0`]
  )

  const addAnotherDisabled =
    inputValue && inputValue.includes && inputValue.includes('')
  const addAnotherColor = addAnotherDisabled ? 'black-tint-60' : 'brand'

  const getAttributeSetter = (index) => (attr, indexValue) => {
    if (!isList) return setAttribute(attr, indexValue)
    inputValue[index] = indexValue
    return setAttribute(attr, [...inputValue])
  }

  const getValueAtIndex = (index) => {
    if (!isList) return inputValue
    return inputValue[index]
  }

  const optional = React.useMemo(() => optionalAttributes.includes(attribute), [
    optionalAttributes,
    attribute
  ])
  const mustExistAt = React.useMemo(() => getMustExistAt(attribute), [
    attribute
  ])

  return (
    <Box>
      {(isList ? inputValue : [inputValue]).map((value, index) => (
        <FormField
          key={keyRef.current[index]}
          borderless={['sequencemaps', 'biosafety_level'].includes(inputType)}
          label={
            index === 0 && (
              <ResourceFormFieldLabel
                optional={optional}
                attribute={attribute}
              />
            )
          }
          help={<HelperText attribute={attribute} />}
          error={error && <FormFieldErrorLabel />}
          info={
            inputValue &&
            mustExistAt && (
              <FormFieldMustExistLabel url={mustExistAt(inputValue)} />
            )
          }
        >
          <ResourceDynamicInput
            attribute={attribute}
            inputType={inputType}
            inputValue={getValueAtIndex(index)}
            isMultiple={isMultiple}
            setAttribute={getAttributeSetter(index)}
            contactUserOptions={contactUserOptions}
            disabled={disabled}
          />
        </FormField>
      ))}
      {inputType === 'list' && (
        /* -- Button to insert a new element into list type -- */
        <Box direction="row" justify="between">
          <Button
            disabled={addAnotherDisabled}
            icon={<Icon size="small" name="Plus" color={addAnotherColor} />}
            plain
            label="Add Another"
            onClick={() => {
              keyRef.current = [
                ...keyRef.current,
                `${attribute}-${keyRef.current.length}`
              ]
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
