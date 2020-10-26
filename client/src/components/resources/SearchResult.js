import React from 'react'
import Link from 'next/link'
import { Box, Anchor, Button, Heading, Text } from 'grommet'
import RequestRequirementsList from 'components/resources/RequestRequirementsList'
import { getReadable } from 'helpers/readableNames'
import { getResourceData } from 'helpers/getResourceData'
import { getPubmedUrl } from 'helpers/getPubmedUrl'
import { getDOIUrl } from 'helpers/getDOIUrl'
import { ResourceTypeOrganisms } from 'components/resources/ResourceCard'
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
        <Box>
          <Heading level="5" margin={{ top: '0', bottom: 'medium' }}>
            <Link href="/resources/[id]" as={`/resources/${resource.id}`}>
              <Anchor bold label={resource.title} />
            </Link>
          </Heading>
          <ResourceTypeOrganisms resource={resource} />
        </Box>
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
            showEmpty
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
  direction = 'row',
  showEmpty
}) => {
  const joinedValue = Array.isArray(data.value)
    ? data.value.join(', ')
    : data.value
  const formattedValue = showEmpty && !joinedValue ? 'None' : joinedValue
  return (
    <Box>
      <Text weight="bold">{data.label}</Text>
      <Box margin={margin} direction={direction}>
        <Text italic={italic}>{formattedValue}</Text>
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

  return (
    <SearchResultDetail
      title="Request Requirements"
      margin={{ top: 'small' }}
      direction="row"
    >
      <RequestRequirementsList resource={resource} />
    </SearchResultDetail>
  )
}
