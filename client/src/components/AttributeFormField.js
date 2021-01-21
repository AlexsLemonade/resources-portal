import React from 'react'
import { FormField } from 'grommet'
import ResourceFormFieldLabel from 'components/resources/ResourceFormFieldLabel'
import ResourceDynamicInput from 'components/resources/ResourceDynamicInput'
import HelperText from 'components/InputHelperText'
import FormFieldErrorLabel from 'components/FormFieldErrorLabel'
import FormFieldMustExistLabel from 'components/FormFieldMustExistLabel'
import { getMustExistAt } from 'components/resources'

export default ({
  labeled,
  error,
  attribute,
  inputType,
  inputValue,
  unsafeInputValue,
  isMultiple,
  setAttribute,
  contactUserOptions,
  optionalAttributes,
  disabled = false
}) => {
  const optional = React.useMemo(() => optionalAttributes.includes(attribute), [
    optionalAttributes,
    attribute
  ])
  const mustExistAt = React.useMemo(() => getMustExistAt(attribute), [
    attribute
  ])

  return (
    <FormField
      borderless={['sequencemaps', 'biosafety_level'].includes(inputType)}
      label={
        labeled && (
          <ResourceFormFieldLabel optional={optional} attribute={attribute} />
        )
      }
      help={<HelperText attribute={attribute} />}
      error={error && <FormFieldErrorLabel />}
      info={
        mustExistAt && (
          <FormFieldMustExistLabel url={getMustExistAt(inputValue)} />
        )
      }
    >
      <ResourceDynamicInput
        attribute={attribute}
        inputType={inputType}
        inputValue={inputValue}
        unsafeInputValue={unsafeInputValue}
        isMultiple={isMultiple}
        setAttribute={setAttribute}
        contactUserOptions={contactUserOptions}
        disabled={disabled}
      />
    </FormField>
  )
}
