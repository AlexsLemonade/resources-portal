import React from 'react'
import { Box, Text, Anchor } from 'grommet'
import Link from 'next/link'
import { getReadable } from 'helpers/readableNames'
import Icon from 'components/Icon'
import styled from 'styled-components'

const BoldAnchor = styled(Anchor)`
  font-weight: bold;
`

export const ResourceCard = ({
  size = 'medium',
  resource,
  children,
  stack = false
}) => {
  const direction = stack ? 'column' : 'row'

  return (
    <Box direction="row" justify="between" align="center" width="full">
      <Box width={{ max: '62%' }}>
        <Link href={`/resources/${resource.id}`}>
          <BoldAnchor
            size={size}
            margin={{ bottom: size }}
            weight="bold"
            color="brand"
          >
            {resource.title}
          </BoldAnchor>
        </Link>
        <Box>
          <Box direction={direction} gap={size}>
            <Box direction="row" gap="small">
              <Icon color="plain" name="ResourceType" />
              <Text>{getReadable(resource.category)}</Text>
            </Box>
            {resource.organisms && resource.organisms.length > 0 && (
              <Box direction="row" gap="small">
                <Icon color="plain" name="Organism" />
                {resource.organisms.map((organism, i, { length }) => (
                  <Text key={organism}>
                    {organism}
                    {i < length - 1 && ', '}
                  </Text>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </Box>
      <Box>{children}</Box>
    </Box>
  )
}
