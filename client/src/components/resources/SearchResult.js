import React from 'react'
import Link from 'next/link'
import { Box, Anchor, Button, Heading, Text } from 'grommet'
import { getReadable } from '../../helpers/readableNames'
import { getResourceData } from '../../helpers/getResourceData'
import { getPubmedUrl } from '../../helpers/getPubmedUrl'
import { getDOIUrl } from '../../helpers/getDOIUrl'
import ResourceTypeIcon from '../../images/resource-type.svg'
import OrganismIcon from '../../images/organism.svg'
import configs from './configs'

export const SearchResult = ({
  resource,
  hideDefaults = false,
  margin = { bottom: 'gutter' }
}) => {
  const { searchResult } = configs[resource.category]
  return (
    <Box
      round="xsmall"
      pad="large"
      margin={margin}
      elevation="medium"
      border={
        resource.imported
          ? {
              color: 'turteal-tint-80',
              size: 'medium',
              side: 'top'
            }
          : false
      }
    >
      <Box
        direction="row"
        justify="between"
        align="center"
        border={[{ side: 'bottom', size: '2px', color: 'black-tint-95' }]}
        margin={{ bottom: 'medium' }}
        pad={{ bottom: 'medium' }}
      >
        <div>
          <Heading level="5" margin={{ top: '0', bottom: 'medium' }}>
            <Link href="/resources/[id]" as={`/resources/${resource.id}`}>
              <Anchor bold label={resource.title} />
            </Link>
          </Heading>
          <Box direction="row">
            <Box
              as="span"
              margin={{ right: 'large' }}
              gap="small"
              align="center"
              direction="row"
            >
              <ResourceTypeIcon />
              {getReadable(resource.category)}
            </Box>
            {resource.organisms.length > 0 && (
              <Box as="span" align="center" direction="row" gap="small">
                <OrganismIcon />
                <span>
                  {resource.organisms.map((organism, i) => [
                    i !== 0 && ', ',
                    <Text key={organism}>{organism}</Text>
                  ])}
                </span>
              </Box>
            )}
          </Box>
        </div>
        <Box>
          {!resource.imported && (
            <Link href="/resources/[id]" as={`/resources/${resource.id}`}>
              <Button label="View Resource" primary />
            </Link>
          )}
          {resource.imported && (
            <>
              <Button
                as="a"
                href={resource.url}
                label={`View on ${
                  getReadable(resource.import_source) || 'Source Site'
                }`}
                margin={{ bottom: 'small' }}
                primary
              />
              <Link href="/resources/[id]" as={`/resources/${resource.id}`}>
                <Button label="View Resource" />
              </Link>
            </>
          )}
        </Box>
      </Box>
      <Box>
        {searchResult.map((attribute) => (
          <SearchResultDetail
            key={attribute}
            data={getResourceData(resource, attribute)}
          />
        ))}
      </Box>
      {!hideDefaults && <PublicationDetails resource={resource} />}
      {!hideDefaults && <RequestRequirements resource={resource} />}
    </Box>
  )
}

export const SearchResultDetail = ({
  data = {},
  italic,
  children,
  margin = { top: 'small', bottom: 'medium' },
  direction = 'row'
}) => {
  const handleArray = (value) =>
    Array.isArray(value) ? value.join(', ') : value
  return (
    <Box>
      <Text weight="bold">{data.label}</Text>
      <Box margin={margin} direction={direction}>
        {data.value && <Text italic={italic}>{handleArray(data.value)}</Text>}
        {children}
      </Box>
    </Box>
  )
}

export const PublicationDetails = ({ resource }) => {
  // Link To Publication
  if (resource.pubmed_id) {
    const title = 'Publication'
    const label =
      resource.additional_metadata.publication_title || 'Link to Publication'
    const link = getPubmedUrl(resource.pubmed_id)

    return (
      <SearchResultDetail title={title}>
        <Anchor
          href={link}
          rel="noopener noreferrer"
          target="_blank"
          label={label}
        />
      </SearchResultDetail>
    )
  }

  // Link To Pre-print
  if (resource.pre_print_doi) {
    const title = 'Pre-print Title'
    const label =
      resource.additional_metadata.pre_print_title || 'Link to Publication'
    const link = getDOIUrl(resource.additional_metadata.pre_print_doi)

    return (
      <SearchResultDetail title={title}>
        <Anchor
          href={link}
          rel="noopener noreferrer"
          target="_blank"
          label={label}
        />
      </SearchResultDetail>
    )
  }

  // fall back to not specified
  return <SearchResultDetail italic title="Publication" label="not specified" />
}

export const RequestRequirements = ({ resource }) => {
  if (resource.imported) {
    return (
      <SearchResultDetail title="Request Requirements">
        <Anchor
          href={resource.url}
          label={`Request on ${
            getReadable(resource.import_source) || 'Source Site'
          }`}
          target="_blank"
          rel="nooper norefferer"
        />
      </SearchResultDetail>
    )
  }

  const requirements = []
  const MTA = 'Material Transfer Agreement'
  if (resource.needs_abstract) requirements.push('Abstract')
  if (resource.needs_irb) requirements.push('IRB')
  if (Object.keys(resource.mta_attachment).length) requirements.push(MTA)
  if (Object.keys(resource.shipping_requirement).length)
    requirements.push('Shipping Information')

  // NOTE: mta_s3_url will be an attachment in the near future
  return (
    <SearchResultDetail
      title="Request Requirements"
      margin={{ top: 'small' }}
      direction="row"
    >
      {requirements.length === 0 && 'Not Available'}
      {requirements.length > 0 && (
        <span>
          {requirements.map((req, i) => [
            i !== 0 && ', ',
            req === MTA ? (
              <Anchor
                key={req}
                href={resource.mta_attachment.download_url}
                target="_blank"
                rel="noopener noreferrer"
                label={req}
              />
            ) : (
              <Text key={req}>{req}</Text>
            )
          ])}
        </span>
      )}
    </SearchResultDetail>
  )
}
