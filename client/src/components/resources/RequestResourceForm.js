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
    createResourceRequest
  } = useRequestResourceForm(resource)

  const [showAddresses, setShowAddresses] = React.useState(false)
  const toggleShippingLabel = showAddresses
    ? 'Specify New Address'
    : 'View Saved Addresses'
  const hasAddresses = addresses.length !== 0

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
            <FormField label="Abstract">
              <TextArea
                value={getAttribute('abstract')}
                onChange={({ target: { value } }) => {
                  setAttribute('abstract', value)
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
                  margin={{ vertical: 'medium' }}
                >
                  <Text weight="bold">Receiver's Address</Text>
                  <Button
                    plain
                    label={toggleShippingLabel}
                    onClick={() => {
                      setShowAddresses(!showAddresses)
                    }}
                    disabled={!hasAddresses}
                  />
                </Box>
                {!showAddresses && (
                  <Box>
                    <Text>Specify New Address</Text>
                    <FormField label="Full Name">
                      <TextInput
                        value={getAddressAttribute('name')}
                        onChange={({ target: { value } }) => {
                          setAddressAttribute('name', value)
                        }}
                      />
                    </FormField>
                    <FormField label="Institution/Organization Name">
                      <TextInput
                        value={getAddressAttribute('institution')}
                        onChange={({ target: { value } }) => {
                          setAddressAttribute('institution', value)
                        }}
                      />
                    </FormField>
                    <FormField label="Address">
                      <TextInput
                        value={getAddressAttribute('address_line_1')}
                        onChange={({ target: { value } }) => {
                          setAddressAttribute('address_line_1', value)
                        }}
                      />
                    </FormField>
                    <FormField label="Building/Floor/Suite">
                      <TextInput
                        value={getAddressAttribute('address_line_2')}
                        onChange={({ target: { value } }) => {
                          setAddressAttribute('address_line_2', value)
                        }}
                      />
                    </FormField>
                    <FormField label="City">
                      <TextInput
                        value={getAddressAttribute('locality')}
                        onChange={({ target: { value } }) => {
                          setAddressAttribute('locality', value)
                        }}
                      />
                    </FormField>
                    <FormField label="State/Province/Region">
                      <TextInput
                        value={getAddressAttribute('state')}
                        onChange={({ target: { value } }) => {
                          setAddressAttribute('state', value)
                        }}
                      />
                    </FormField>
                    <FormField label="Zip/Postal Code">
                      <TextInput
                        value={getAddressAttribute('postal_code')}
                        onChange={({ target: { value } }) => {
                          setAddressAttribute('postal_code', value)
                        }}
                      />
                    </FormField>
                    <FormField label="Country">
                      <TextInput
                        value={getAddressAttribute('country')}
                        onChange={({ target: { value } }) => {
                          setAddressAttribute('country', value)
                        }}
                      />
                    </FormField>
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
                {showAddresses && <Box>existing shipping forms</Box>}
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