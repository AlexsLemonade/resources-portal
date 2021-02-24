import React from 'react'
import {
  Box,
  Button,
  FormField,
  Text,
  TextArea,
  RadioButtonGroup,
  RadioButton
} from 'grommet'
import styled from 'styled-components'
import { CheckBoxWithInfo } from 'components/CheckBoxWithInfo'
import DropZone from 'components/DropZone'
import Icon from 'components/Icon'
import useResourceForm from 'hooks/useResourceForm'
import getResourceOptions from 'helpers/getResourceOptions'
import getRequestRequirements from 'helpers/getRequestRequirements'
import RequirementsLabel from 'components/resources/ResourceRequirementsRadioLabel'

// this overrides the default styles for a RadioButtonGroup
// to allow for full width Box after the radio
const ExistingResourcesRadioButtonGroup = styled(RadioButtonGroup)`
  label,
  > label > div,
  label > div > label {
    width: 100%;
  }
`

export default () => {
  const {
    resource,
    setAttribute,
    getAttribute,
    setMtaAttachment,
    removeMtaAttachment,
    teamResources,
    grantOptions,
    existingRequirementsResource,
    setExistingRequirementsResource,
    isSaved
  } = useResourceForm()
  const onCheckChange = (attribute, { target: { checked } }) =>
    setAttribute(attribute, checked)
  const onRadioChange = (attribute, { target: { value } }) => {
    setAttribute(attribute, value === 'true')
  }

  const { hasRequirements } = getRequestRequirements(resource)
  const hasExisting = teamResources && teamResources.length > 0
  const iconColor = hasExisting ? 'brand' : 'black-tint-80'
  const [showExisting, setShowExisting] = React.useState(
    existingRequirementsResource || (!hasRequirements && hasExisting)
  )
  const handleSelect = (requirementsResource) => {
    setExistingRequirementsResource(requirementsResource)
  }
  const teamResourceOptions = getResourceOptions(teamResources, grantOptions)
  const toggleExisting = () => {
    if (showExisting) setExistingRequirementsResource('')
    setShowExisting(!showExisting)
  }

  // show on load when has shipping requirement
  const mtaAttachment = getAttribute('mta_attachment')
  const [showMTA, setShowMTA] = React.useState(!!mtaAttachment)
  const [
    showShippingRequirements,
    setShowShippingRequirements
  ] = React.useState(!!getAttribute('shipping_requirement'))
  const updateShippingRequirements = (hasShippingRequirements) => {
    setShowShippingRequirements(hasShippingRequirements)
    if (!hasShippingRequirements) {
      setAttribute('shipping_requirement', undefined)
    } else {
      setAttribute('shipping_requirement', {
        needs_shipping_address: true,
        needs_payment: true
      })
    }
  }

  const formTitle = isSaved
    ? 'Edit Request Requirements'
    : 'Specify New Requirements'
  const title = showExisting ? 'Use Same Requirements As' : formTitle
  const toggleButtonLabel = showExisting
    ? formTitle
    : 'Copy Requirements from Another Resource'

  return (
    <Box width="large" height={{ min: '500px' }}>
      <Box border={{ side: 'bottom', color: 'turteal-tint-80' }}>
        <Text size="large">Request Requirements</Text>
        <Text italic color="black-tint-60">
          Specify materials you require from the requester to review and fulfill
          requests
        </Text>
      </Box>
      <Box
        direction="row"
        justify="between"
        align="center"
        margin={{ vertical: 'large' }}
      >
        <Text weight="bold">{title}</Text>
        <Button
          plain
          bold
          disabled={!hasExisting}
          icon={<Icon name="Plus" size="16px" color={iconColor} />}
          label={toggleButtonLabel}
          onClick={toggleExisting}
        />
      </Box>
      {!showExisting && (
        <>
          <CheckBoxWithInfo
            disabled={!!mtaAttachment}
            label="Signed Material Transfer Agreement (MTA)"
            checked={showMTA}
            onChange={(e) => setShowMTA(e.target.checked)}
          />
          {showMTA && (
            <Box pad="large" animation="fadeIn">
              <Text>
                Upload the MTA signed by you and the necessary authorities at
                your organization
              </Text>
              {/* SHOW MTA FORM WITH DELETE OPTION */}
              {mtaAttachment ? (
                <Box direction="row" justify="between">
                  <Text>
                    <Icon name="FilePDF" />
                    {mtaAttachment.filename}
                  </Text>
                  <Button
                    plain
                    bold
                    icon={<Icon name="Cross" size="small" />}
                    label="remove"
                    onClick={removeMtaAttachment}
                  />
                </Box>
              ) : (
                <DropZone
                  multiple={false}
                  fileTypes={['PDF']}
                  onDrop={setMtaAttachment}
                />
              )}
            </Box>
          )}
          <CheckBoxWithInfo
            label="IRB Approval"
            checked={getAttribute('needs_irb')}
            onChange={(e) => onCheckChange('needs_irb', e)}
          />
          <CheckBoxWithInfo
            label="Project Abstract"
            value={getAttribute('needs_abstract')}
            onChange={(e) => onCheckChange('needs_abstract', e)}
          />
          <CheckBoxWithInfo
            label="Shipping Information"
            checked={showShippingRequirements}
            onChange={({ target: { checked } }) => {
              updateShippingRequirements(checked)
            }}
          />
          {showShippingRequirements && (
            <Box pad={{ horizontal: 'large' }}>
              <CheckBoxWithInfo
                label="Shipping Address"
                checked={getAttribute('needs_shipping_address')}
                disabled
                onChange={(e) => onCheckChange('needs_shipping_address', e)}
              />
              <CheckBoxWithInfo
                label="Shipping Payment"
                checked={getAttribute('needs_payment')}
                disabled
                onChange={(e) => onCheckChange('needs_payment', e)}
              />
              <>
                <Box pad={{ horizontal: 'large' }}>
                  <Box align="start" pad={{ vertical: 'medium' }}>
                    <RadioButtonGroup
                      name="doc"
                      value={getAttribute('sharer_pays_shipping')}
                      onChange={(e) => {
                        onRadioChange('sharer_pays_shipping', e)
                      }}
                      options={[
                        {
                          value: true,
                          label: "I'm responsible for shipping costs."
                        },
                        {
                          value: false,
                          label:
                            'The Requester is responsible for shipping costs.'
                        }
                      ]}
                    />
                    {getAttribute('sharer_pays_shipping') === false && (
                      <>
                        <Box pad={{ horizontal: 'large' }}>
                          <Text
                            italic
                            size="small"
                            color="black-tint-60"
                            margin={{ bottom: 'small' }}
                          >
                            What payment methods do you support? Choose at least
                            1.
                          </Text>
                          <CheckBoxWithInfo
                            label="Shipping Carrier Code ( ex: UPS, FedEx )"
                            checked={getAttribute('accepts_shipping_code')}
                            onChange={(e) => {
                              onCheckChange('accepts_shipping_code', e)
                            }}
                          />
                          <CheckBoxWithInfo
                            label="Accept reimbursement for shipping costs"
                            checked={getAttribute('accepts_reimbursement')}
                            onChange={(e) => {
                              onCheckChange('accepts_reimbursement', e)
                            }}
                          />
                          <CheckBoxWithInfo
                            label="Other"
                            checked={getAttribute(
                              'accepts_other_payment_methods'
                            )}
                            onChange={(e) => {
                              onCheckChange('accepts_other_payment_methods', e)
                            }}
                          />
                        </Box>
                        {getAttribute('accepts_other_payment_methods') && (
                          <Box pad={{ horizontal: 'large' }} animation="fadeIn">
                            <FormField
                              label="Accepted Payment Details"
                              help="Is there a specific shipping service provider which is supported? If you have selected 'Other' above please specify here."
                            >
                              <TextArea
                                value={getAttribute('accepted_payment_details')}
                                onChange={({ target: { value } }) => {
                                  setAttribute(
                                    'accepted_payment_details',
                                    value
                                  )
                                }}
                              />
                            </FormField>
                          </Box>
                        )}
                      </>
                    )}
                  </Box>
                </Box>
                <FormField
                  label="Shipping Restrictions"
                  help="Are there any restrictions imposed on shipping?"
                >
                  <TextArea
                    value={getAttribute('restrictions')}
                    onChange={({ target: { value } }) => {
                      setAttribute('restrictions', value)
                    }}
                  />
                </FormField>
              </>
            </Box>
          )}
        </>
      )}
      {showExisting && (
        <Box>
          <ExistingResourcesRadioButtonGroup
            options={teamResourceOptions}
            name="existing-requirements"
          >
            {({ resource: existingResource, ...option }, { hover }) => (
              <RadioButton
                key={option.label}
                name={option.name}
                hover={hover}
                checked={existingRequirementsResource.id === option.value}
                value={option.value}
                label={<RequirementsLabel resource={existingResource} />}
                onChange={() => handleSelect(existingResource)}
              />
            )}
          </ExistingResourcesRadioButtonGroup>
        </Box>
      )}
    </Box>
  )
}
