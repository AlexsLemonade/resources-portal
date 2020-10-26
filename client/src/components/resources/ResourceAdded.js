import React from 'react'
import { Box, Button, Text } from 'grommet'
import Link from 'next/link'
import ResourceAddedImage from '../../images/resource-added.svg'

export const AccountEmptyPage = ({ resource }) => {
  const addAnotherLink = '/resources'
  const viewResourceLink = `/resources/${resource.id}`

  return (
    <Box
      margin={{ top: 'xxlarge' }}
      align="center"
      justify="center"
      pad="xxlarge"
      fill
    >
      <Text serif textAlign="center" size="xlarge">
        Resource Added!
      </Text>
      <Box
        direction="row"
        align="center"
        pad={{ vertical: 'medium' }}
        gap="xlarge"
      >
        <Box>
          <ResourceAddedImage />
        </Box>
        <Box align="start" gap="large">
          <Link href={addAnotherLink}>
            <Button primary label="Add Another!" href={addAnotherLink} />
          </Link>
          <Link href={viewResourceLink}>
            <Button label="View Resource" href={viewResourceLink} />
          </Link>
        </Box>
      </Box>
    </Box>
  )
}

export default AccountEmptyPage
