import React from 'react'
import { Box, RadioButtonGroup, RadioButton, Text } from 'grommet'
import getAddressOptions from 'helpers/getAddressOptions'
import PreviewAddress from 'components/PreviewAddress'
import styled from 'styled-components'

const AddressRadioButtonGroup = styled(RadioButtonGroup)`
  label label {
    align-items: start;

    div:first-child {
      margin-top: 4px;
    }
  }
`

export default ({ addresses, onSelect }) => {
  const [address, setAddress] = React.useState({})
  const addressOptions = getAddressOptions(addresses)

  const handleSelect = ({ target: { value } }) => {
    const selectedOption = addressOptions.find(({ id }) => id === value)
    setAddress(selectedOption.address)
    onSelect(selectedOption.address)
  }

  return (
    <Box margin={{ vertical: 'medium' }}>
      <Text margin={{ bottom: 'small' }}>Saved Addresses</Text>
      <AddressRadioButtonGroup
        name="addresses"
        options={addressOptions}
        value={{ id: address.id }}
      >
        {(option, { hover }) => (
          <RadioButton
            key={option.label}
            name={option.name}
            hover={hover}
            checked={address.id === option.value}
            label={<PreviewAddress noLabel address={option.address} />}
            value={option.value}
            onChange={handleSelect}
          />
        )}
      </AddressRadioButtonGroup>
    </Box>
  )
}
