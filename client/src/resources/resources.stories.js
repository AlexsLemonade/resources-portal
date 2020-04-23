import * as React from 'react'
import { Grommet, Box } from 'grommet'
import { storiesOf } from '@storybook/react'
import { getReadable } from '../helpers/readableNames'
import theme from '../theme'
import { Mappings, SearchResult, ResourceDetails } from './index'

// import test data from api folder
import { materials } from '../../../api/dev_data/materials.json'

const data = {}

const convertTruthies = (obj) => {
  const keys = Object.keys(obj)
  const convertedObj = obj

  keys.forEach((key) => {
    if (obj[key] === 'True') convertedObj[key] = true
    if (obj[key] === 'False') convertedObj[key] = false
    if (typeof obj[key] === 'object') convertedObj[key] = convertTruthies(obj[key])
  })

  return convertedObj
}

materials.forEach((material) => {
  data[material.category] = data[material.category] || []
  const convertedMaterial = convertTruthies(material)
  data[material.category].push(convertedMaterial)
})

for (const key of Object.keys(Mappings)) {
  storiesOf(`Resources/${getReadable(key)}`, module)
    .add('SearchResult', () => {
      return (
        <Grommet theme={theme}>
          <Box pad="xlarge" width={{ max: '928px' }}>
            { data[key].map((resource) => (
              <SearchResult resource={resource} />
            ))}
          </Box>
        </Grommet>
      )
    })
    .add('Details', () => (
      <Grommet theme={theme}>
        { data[key].map((resource) => (
          <Box pad="xlarge" key={resource.id}>
            <ResourceDetails resource={resource} />
          </Box>
        ))}
      </Grommet>
    ))
}
