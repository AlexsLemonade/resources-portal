import React from 'react'
import { Box, Button, Select, TextInput, Keyboard } from 'grommet'
import { useSearchResources } from '../hooks/useSearchResources'
import { Mappings } from './resources'
import { sortedObjectKeys } from '../helpers/sortObjectKeys'
import { getReadable } from '../helpers/readableNames'

export default function SearchInput({ onChange, size = 'medium' }) {
  const {
    query,
    addFacet,
    removeFacet,
    goToSearchResults,
    setSearchTerm
  } = useSearchResources()
  const [resourceType, setResourceType] = React.useState('ALL')
  const [inputValue, setInputValue] = React.useState(query.search || '')

  const handleSubmit = () => {
    removeFacet('category')
    if (resourceType !== 'ALL') {
      addFacet('category', resourceType)
    }
    setSearchTerm(inputValue)
    goToSearchResults(true)
  }

  // this is just the help make the select look more like the designs
  const selectWidth = resourceType === 'ALL' ? '60px' : '156px'
  return (
    <Box direction="row">
      <Box
        direction="row"
        width={selectWidth}
        border={{ size: 'xsmall', color: 'black-tint-60', side: 'all' }}
        round={{ size: 'xsmall', corner: 'left' }}
        overflow="hidden"
      >
        <Select
          plain
          size={size}
          value={resourceType}
          options={['ALL', ...sortedObjectKeys(Mappings).map((map) => map.key)]}
          labelKey={getReadable}
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
        <Keyboard onEnter={handleSubmit}>
          <TextInput
            plain
            value={inputValue}
            size={size}
            onChange={({ target: { value } }) => {
              setInputValue(value)
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
        onClick={handleSubmit}
      />
    </Box>
  )
}
