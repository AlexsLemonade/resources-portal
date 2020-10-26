import React from 'react'
import { Box, Button, Select, TextInput, Keyboard, ThemeContext } from 'grommet'
import { normalizeColor } from 'grommet/utils'
import { useSearchResources } from '../hooks/useSearchResources'
import { resourceCategories } from './resources'
import { getReadable } from '../helpers/readableNames'

const searchInputTheme = {
  select: {
    control: {
      extend: (props) => `
        background-color: ${normalizeColor('black-tint-95', props.theme)};
        border: none;
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
        &:hover {
          background-color: ${normalizeColor('black-tint-80', props.theme)};
        }

        input {
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
          background-color:  ${normalizeColor('black-tint-95', props.theme)};
        }
      `
    }
  }
}

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
  const [selectWidth, setSelectWith] = React.useState(
    resourceType === 'ALL' ? '60px' : '156px'
  )

  const handleSubmit = () => {
    removeFacet('category')
    if (resourceType !== 'ALL') {
      addFacet('category', resourceType)
    }
    setSearchTerm(inputValue)
    goToSearchResults(true)
  }

  const resourceCategoryOptions = [
    'ALL',
    ...resourceCategories
  ].map((option) => ({ value: option, label: getReadable(option) }))

  return (
    <ThemeContext.Extend value={searchInputTheme}>
      <Box direction="row">
        <Box
          direction="row"
          width={selectWidth}
          border={{ size: 'xsmall', color: 'black-tint-60', side: 'all' }}
          round={{ size: 'xsmall', corner: 'left' }}
          overflow="hidden"
        >
          <Select
            background="black-tint-95"
            name="search"
            size={size}
            value={resourceCategoryOptions.find(
              (option) => option.value === resourceType
            )}
            valueKey="value"
            labelKey="label"
            options={resourceCategoryOptions}
            onChange={({ value: { value } }) => {
              setSelectWith(value === 'ALL' ? '60px' : '156px')
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
    </ThemeContext.Extend>
  )
}
