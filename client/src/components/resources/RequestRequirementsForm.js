import React from 'react'
import {
  Box,
  Button,
  FormField,
  Text,
  TextArea,
  RadioButtonGroup
} from 'grommet'
import { CheckBoxWithInfo } from 'components/CheckBoxWithInfo'
import DropZone from 'components/DropZone'
import Icon from 'components/Icon'
import useResourceForm from 'hooks/useResourceForm'

export default () => {
  const {
    setAttribute,
    getAttribute,
    setMtaAttachment,
    removeMtaAttachment
  } = useResourceForm()
  const onCheckChange = (attribute, { target: { checked } }) =>
    setAttribute(attribute, checked)
  const onRadioChange = (attribute, { target: { value } }) => {
    setAttribute(attribute, value === 'true')
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

  return (
    <Box width="large" height={{ min: '500px' }}>
      <Box border={{ side: 'bottom', color: 'turteal-tint-80' }}>
        <Text size="large">Request Requirements</Text>
        <Text italic color="black-tint-60">
          Specify materials you require from the requester to review and fulfill
          requests
        </Text>
      </Box>
      <Text weight="bold" margin={{ top: 'large' }}>
        Specify New Requirements
      </Text>
      <CheckBoxWithInfo
        disabled={!!mtaAttachment}
        label="Signed Material Transfer Agreement (MTA)"
        checked={showMTA}
        onChange={(e) => setShowMTA(e.target.checked)}
      />
      {showMTA && (
        <Box pad="large" animation="fadeIn">
          <Text>
            Upload the MTA signed by you and the necessary authorities at your
            organization
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
        label="IRB"
        checked={getAttribute('needs_irb')}
        onChange={(e) => onCheckChange('needs_irb', e)}
      />
      <CheckBoxWithInfo
        label="Abstract"
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
                      label: 'The Requester is responsible for shipping costs.'
                    }
                  ]}
                />
                {getAttribute('sharer_pays_shipping') === false && (
                  <Box pad={{ horizontal: 'large' }}>
                    <Text
                      italic
                      size="small"
                      color="black-tint-60"
                      margin={{ bottom: 'small' }}
                    >
                      What payments methods you support? Choose at least 1.
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
                      checked={getAttribute('accepts_other_payment_methods')}
                      onChange={(e) => {
                        onCheckChange('accepts_other_payment_methods', e)
                      }}
                    />
                  </Box>
                )}
              </Box>
            </Box>
            <FormField
              label="Shipping Restriction"
              help="What are restrictions imposed on shipping?  Is there a specific shipping service provider which is supported?"
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
    </Box>
  )
}
