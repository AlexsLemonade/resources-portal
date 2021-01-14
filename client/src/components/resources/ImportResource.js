import React from 'react'
import { Box, Button, FormField, Text, TextInput, Paragraph } from 'grommet'
import { useRouter } from 'next/router'
import { InfoCard } from 'components/InfoCard'
import ResourceImportSourceSelector from 'components/resources/ResourceImportSourceSelector'
import ResourceReview from 'components/resources/ResourceReview'
import ResourceImportForm from 'components/resources/ResourceEditImportedForm'
import { getImportSourceCategory } from 'components/resources'
import { getReadable } from 'helpers/readableNames'
import useResourceForm from 'hooks/useResourceForm'
import { useAlertsQueue } from 'hooks/useAlertsQueue'

export default () => {
  const {
    getAttribute,
    setAttribute,
    fetchImport,
    fetched,
    form,
    isSupported,
    importAttribute,
    save,
    clearResourceContext,
    validate
  } = useResourceForm()
  const router = useRouter()
  const { addAlert } = useAlertsQueue()
  const [step, setStep] = React.useState(0)

  const importSource = getAttribute('import_source')
  const canShowForm =
    form && ((getAttribute(importAttribute) && fetched) || !isSupported)
  const canShowReview = importSource && (fetched || !isSupported)
  const canShowInfoCard =
    !isSupported && importSource && importSource !== 'OTHER'

  React.useEffect(() => {
    if (!getAttribute('imported')) setAttribute('imported', true)
  })

  const importSourceHelpers = {
    GEO: (
      <Paragraph size="small" color="black-tint-40">
        ex:{' '}
        <Text size="small" weight="bold">
          GSE24542
        </Text>
        {' or '}
        <Text size="small" weight="bold">
          https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM609241
        </Text>
      </Paragraph>
    ),
    SRA: (
      <Paragraph size="small" color="black-tint-40">
        ex:{' '}
        <Text size="small" weight="bold">
          SRR944283
        </Text>
        {' or '}
        <Text size="small" weight="bold">
          https://www.ebi.ac.uk/ena/browser/view/SRP003819
        </Text>
      </Paragraph>
    ),
    PROTOCOLS_IO: (
      <Paragraph size="small" color="black-tint-40">
        Please use the following format:{' '}
        <Text size="small" weight="bold">
          dx.doi.org/10.17504/protocols.io.bj64krgw
        </Text>
      </Paragraph>
    )
  }
  return (
    <Box align="center">
      {step === 0 && (
        <Box align="center" margin={{ bottom: 'large' }}>
          <ResourceImportSourceSelector />
          {isSupported && (
            <>
              <FormField
                fill
                label={getReadable(importAttribute)}
                help={importSourceHelpers[importSource]}
              >
                <TextInput
                  value={getAttribute(importAttribute) || ''}
                  onChange={({ target: { value } }) => {
                    setAttribute(importAttribute, value)
                  }}
                />
              </FormField>
              <Button
                alignSelf="end"
                primary
                label="Import"
                disabled={fetched}
                onClick={async () => {
                  if (await fetchImport()) {
                    // todo:: validate here before showing preview view
                    setStep(1)
                  } else {
                    addAlert('An error occurred while importing', 'error')
                  }
                }}
              />
            </>
          )}
          {canShowInfoCard && (
            <Box margin={{ vertical: 'large' }}>
              <InfoCard type="Warning">
                <Paragraph margin={{ bottom: 'none' }}>
                  We don't support automatic import from{' '}
                  {getReadable(importSource)} yet.
                </Paragraph>
                <Paragraph>
                  Please provide some basic information about your{' '}
                  {getReadable(
                    getImportSourceCategory(importSource)
                  ).toLowerCase()}
                </Paragraph>
              </InfoCard>
            </Box>
          )}
        </Box>
      )}
      {step === 0 && canShowForm && (
        <>
          <Box
            animation="slideUp"
            elevation="small"
            width="large"
            round="xsmall"
            background="white"
            pad="large"
          >
            <ResourceImportForm />
          </Box>
          <Box
            width="large"
            direction="row"
            justify="end"
            margin={{ vertical: 'large' }}
          >
            <Button
              onClick={() => {
                validate(() => setStep(1))
              }}
              primary
              label="Review"
            />
          </Box>
        </>
      )}
      {step === 1 && canShowReview && (
        <>
          <ResourceReview onEditResourceDetails={() => setStep(0)} />
          <Box
            width="xlarge"
            direction="row"
            justify="end"
            gap="large"
            margin={{ vertical: 'large' }}
          >
            <Button
              primary
              onClick={async () => {
                // you need to show the resource added screen
                const savedResource = await save()
                if (savedResource.id) {
                  clearResourceContext()
                  router.push(`/resources/${savedResource.id}`)
                }
              }}
              label="List Resource"
            />
          </Box>
        </>
      )}
    </Box>
  )
}
