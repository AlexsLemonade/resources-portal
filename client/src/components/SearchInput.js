import React from 'react'
import { Box, Button, Select, TextInput, Keyboard } from 'grommet'
import { useMaterialsSearch } from '../hooks/useMaterialsSearch'
import { Mappings } from './resources'
import { sortedObjectKeys } from '../helpers/sortObjectKeys'
import { getReadable } from '../helpers/readableNames'

export default function SearchInput({
  initialString = '',
  onChange,
  size = 'medium'
}) {
  const {
    query: { search },
    addFacet,
    removeFacet,
    goToSearchResults,
    setSearchString
  } = useMaterialsSearch()
  const [resourceType, setResourceType] = React.useState('ALL')
  const [string, setString] = React.useState(search || initialString)
  const resourceOptions = [
    { label: 'All', value: 'ALL' },
    ...sortedObjectKeys(Mappings).map((mapping) => {
      return {
        label: getReadable(mapping.key),
        value: mapping.key
      }
    })
  ]

  const submitForm = () => {
    removeFacet('category')
    if (resourceType !== 'ALL') {
      addFacet('category', resourceType)
    }
    setSearchString(string)
    goToSearchResults(true)
  }

  return (
    <Box direction="row">
      <Box
        direction="row"
        width="155px"
        border={{ size: 'xsmall', color: 'black-tint-60', side: 'all' }}
        round={{ size: 'xsmall', corner: 'left' }}
        overflow="hidden"
      >
        <Select
          plain
          value={resourceType}
          options={resourceOptions}
          valueKey="value"
          labelKey="label"
          onChange={({ option: { value } }) => {
            setResourceType(value)
          }}
        />
      </Box>
      <Box
        border={[
          {
            color: 'black-tint-60',
            side: 'horizontal'
          },
          {
            color: 'black-tint-60',
            side: 'right'
          }
        ]}
        round={{ size: 'xsmall', corner: 'right' }}
        flex="grow"
      >
        <Keyboard onEnter={submitForm}>
          <TextInput
            plain
            value={string}
            size={size}
            onChange={({ target: { value } }) => {
              setString(value)
              if (onChange) onChange(value)
            }}
          />
        </Keyboard>
      </Box>
      <Button
        label="Search"
        size={size}
        width="96px"
        margin={{ left: 'medium' }}
        onClick={submitForm}
      />
    </Box>
  )
}
