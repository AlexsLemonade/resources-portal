import React from 'react'
import {
  Anchor,
  Box,
  Button,
  CheckBox,
  FormField,
  Text,
  TextArea,
  TextInput
} from 'grommet'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import { HeaderRow } from 'components/HeaderRow'
import { InfoCard } from 'components/InfoCard'
import Icon from 'components/Icon'
import useRequestResourceForm from 'hooks/useRequestResourceForm'
import AddressSelect from 'components/AddressSelect'
import FormFieldErrorLabel from 'components/FormFieldErrorLabel'
import { addressAttributes } from 'schemas/address'
import { getReadable } from 'helpers/readableNames'

const SaveAddressCheckBox = styled(CheckBox)`
  margin-left: 0;
`

export default ({ resource }) => {
  const router = useRouter()
  const {
    mta_attachment: mtaAttachment,
    needs_abstract: needsAbstract,
    shipping_requirement: shippingRequirement
  } = resource

  const { needs_shipping_address: needsShippingAddress, restrictions } =
    shippingRequirement || {}

  const {
    setAttribute,
    getAttribute,
    getAddressAttribute,
    setAddressAttribute,
    addresses,
    createResourceRequest,
    setAddress,
    validationErrors
  } = useRequestResourceForm(resource)

  const hasAddresses = addresses.length !== 0
  const [showAddresses, setShowAddresses] = React.useState(hasAddresses)
  const toggleShippingLabel = showAddresses
    ? 'Specify New Address'
    : 'View Saved Addresses'

  return (
    <>
      <Box
        elevation="small"
        round="xsmall"
        background="white"
        pad={{ vertical: 'large', horizontal: 'xlarge' }}
      >
        {needsAbstract && (
          <Box margin={{ bottom: 'medium' }}>
            <FormField
              label="Abstract"
              error={
                validationErrors.requester_abstract && (
                  <FormFieldErrorLabel
                    message={validationErrors.requester_abstract}
                  />
                )
              }
            >
              <TextArea
                value={getAttribute('requester_abstract')}
                onChange={({ target: { value } }) => {
                  setAttribute('requester_abstract', value)
                }}
              />
            </FormField>
          </Box>
        )}
        {mtaAttachment && (
          <Box margin={{ bottom: 'medium' }}>
            <Text>Material Transfer Agreement (MTA)</Text>
            <Box
              direction="row"
              gap="medium"
              align="center"
              margin={{ bottom: 'medium' }}
            >
              <Icon name="Info" color="info" size="16px" />
              <Text size="small">
                Please download the MTA and go through it. Once your request is
                approved, you will be asked to sign the MTA and upload it.
              </Text>
            </Box>
            <Box direction="row" gap="small" align="center">
              <Icon name="FilePDF" size="30px" color="black-tint-30" />
              <Text>
                <Anchor href={mtaAttachment.download_url}>
                  {mtaAttachment.filename}
                </Anchor>
              </Text>
            </Box>
          </Box>
        )}
        {shippingRequirement && (
          <>
            <HeaderRow label="Shipping Information" />
            {restrictions && restrictions.length > 0 && (
              <Box align="center">
                <InfoCard type="Warning" color="warning">
                  <Text weight="bold">Shipping Restrictions</Text>
                  <Text>{restrictions}</Text>
                </InfoCard>
              </Box>
            )}
            {needsShippingAddress && (
              <>
                <Box
                  direction="row"
                  justify="between"
                  margin={{ top: 'xlarge' }}
                >
                  <Text weight="bold">Receiver's Address</Text>
                  <Button
                    plain
                    bold
                    label={toggleShippingLabel}
                    icon={
                      showAddresses ? (
                        <Icon name="Plus" size="16px" />
                      ) : undefined
                    }
                    onClick={() => {
                      setShowAddresses(!showAddresses)
                    }}
                    disabled={!hasAddresses}
                  />
                </Box>
                {!showAddresses && (
                  <Box animation="fadeIn" margin={{ top: 'medium' }}>
                    <Text>Specify New Address</Text>
                    {addressAttributes.map((addressAttribute) => (
                      <FormField
                        label={getReadable(addressAttribute)}
                        error={
                          validationErrors.address &&
                          validationErrors.address[addressAttribute] && (
                            <FormFieldErrorLabel
                              message={
                                validationErrors.address[addressAttribute]
                              }
                            />
                          )
                        }
                      >
                        <TextInput
                          value={getAddressAttribute(addressAttributes)}
                          onChange={({ target: { value } }) => {
                            setAddressAttribute(addressAttribute, value)
                          }}
                        />
                      </FormField>
                    ))}
                    <Box margin={{ vertical: 'medium' }}>
                      <SaveAddressCheckBox
                        checked={getAttribute('saved_for_reuse')}
                        onChange={({ target: { checked } }) => {
                          setAddressAttribute('saved_for_reuse', checked)
                        }}
                        label="Save this address for future use"
                      />
                    </Box>
                  </Box>
                )}
                {showAddresses && (
                  <Box animation="fadeIn">
                    <AddressSelect
                      addresses={addresses}
                      onSelect={setAddress}
                      validationErrors={validationErrors.address}
                    />
                  </Box>
                )}
              </>
            )}
          </>
        )}
      </Box>
      <Box
        direction="row"
        justify="end"
        gap="xlarge"
        margin={{ vertical: 'large' }}
      >
        <Button
          label="Cancel"
          onClick={() => {
            router.push(`/resources/${resource.id}`)
          }}
        />
        <Button
          primary
          label="Request"
          onClick={async () => {
            const saved = await createResourceRequest()
            if (saved.id) {
              router.push(`/account/requests/${saved.id}`)
            } else {
              // show error
            }
          }}
        />
      </Box>
    </>
  )
}
