import * as React from 'react'
import { Grommet, Box } from 'grommet'
import { storiesOf } from '@storybook/react'
import { getReadable } from '../../helpers/readableNames'
import theme from '../../theme'
import { resourceCategories } from './index'
import { SearchResult } from './SearchResult'
import { ResourceDetails } from './ResourceDetails'

import { fakeSearchMaterialsResponse } from '../../helpers/testData'

const data = {}

fakeSearchMaterialsResponse.results.forEach((material) => {
  data[material.category] = data[material.category] || []
  data[material.category].push(material)
})

for (const key of resourceCategories) {
  storiesOf(`Resources/${getReadable(key)}`, module)
    .add('SearchResult', () => {
      return (
        <Grommet theme={theme}>
          <Box pad="xlarge" width={{ max: '928px' }}>
            {data[key].map((resource) => (
              <SearchResult resource={resource} />
            ))}
          </Box>
        </Grommet>
      )
    })
    .add('Details', () => (
      <Grommet theme={theme}>
        {data[key].map((resource) => (
          <Box pad="xlarge" key={resource.id}>
            <ResourceDetails resource={resource} />
          </Box>
        ))}
      </Grommet>
    ))
}
