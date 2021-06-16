import React from 'react'
import { Box, Button, Paragraph, TextInput } from 'grommet'
import { FormPrevious, FormNext } from 'grommet-icons'
import { isOnlyNumbers } from 'helpers/isOnlyNumbers'
import { useSearchResources } from 'hooks/useSearchResources'
import { offsetToPage, pageToOffset } from 'helpers/getPagination'

export const SearchResultsOffset = () => {
  const {
    setOffset,
    goToSearchResults,
    pagination: { offset, limit, last }
  } = useSearchResources()

  const [enteredPageNumber, setEnteredPageNumber] = React.useState('')
  const [
    enteredPageNumberInRange,
    setEnteredPageNumberInRange
  ] = React.useState(false)

  const atEnd = offset === last
  const atStart = offset === 0

  const handlePageNumberRequest = ({ target: { value } }) => {
    if (isOnlyNumbers(value)) {
      const pageOffset = parseInt(value, 10) - 1
      const inRange = pageOffset <= last && offset >= 0
      setEnteredPageNumberInRange(inRange)
      setEnteredPageNumber(value)
    }
    if (value === '') setEnteredPageNumber('')
  }
  const goToOffset = (newOffset) => {
    setOffset(newOffset)
    setEnteredPageNumber('')
    goToSearchResults()
    // scroll to top of page changing page
    window.scrollTo({
      top: 0
    })
  }

  const goToOffsetRequest = () => {
    goToOffset(pageToOffset(parseInt(enteredPageNumber, 10)))
  }

  const getDisplayedOffsets = () => {
    const page = offsetToPage(offset, limit)
    const lastPage = offsetToPage(last, limit)
    const allOffsets = [...Array(lastPage).keys()].map((o) => o * limit)
    // get first 6
    if (page <= 2) return allOffsets.slice(0, 6)
    // get last 5
    if (lastPage - page <= 2) return allOffsets.slice(-5)
    // get 2 before and 2 after current
    return allOffsets.slice(page - 2, page + 3)
  }

  const buttonOffsets = getDisplayedOffsets()

  return (
    <Box
      pad={{ bottom: 'gutter' }}
      direction="row"
      gap="gutter"
      align="center"
      alignSelf="center"
    >
      <Box direction="row" gap="6px">
        <Button
          plain
          gap="xxsmall"
          width="small"
          label="Previous"
          icon={<FormPrevious color={atStart ? 'black-tint-60' : 'brand'} />}
          disabled={!offset}
          onClick={() => goToOffset(offset - limit)}
        />
        {!buttonOffsets.includes(0) && [
          <Button
            plain
            key="start"
            pad="xsmall"
            label={1}
            onClick={() => goToOffset(0)}
          />,
          !buttonOffsets.includes(1) && (
            <Paragraph
              key="elipse-start"
              size="medium"
              margin="none"
              color="black-tint-60"
            >
              ...
            </Paragraph>
          )
        ]}
        {buttonOffsets.map((pageOffset) =>
          offset !== pageOffset ? (
            <Button
              key={pageOffset}
              plain
              label={offsetToPage(pageOffset, limit)}
              onClick={() => goToOffset(pageOffset)}
            />
          ) : (
            <Paragraph
              key="current-page"
              size="medium"
              margin="none"
              color="black"
            >
              {offsetToPage(pageOffset, limit)}
            </Paragraph>
          )
        )}
        {!buttonOffsets.includes(last) && [
          !buttonOffsets.includes(last - limit) && (
            <Paragraph
              key="elipse-end"
              size="medium"
              margin="none"
              color="black-tint-60"
            >
              ...
            </Paragraph>
          ),
          <Button
            plain
            key={last}
            pad="xsmall"
            label={offsetToPage(last, limit)}
            onClick={() => goToOffset(last)}
          />
        ]}
        <Button
          plain
          reverse
          gap="xxsmall"
          width="small"
          label="Next"
          icon={<FormNext color={atEnd ? 'black-tint-60' : 'brand'} />}
          disabled={atEnd}
          onClick={() => goToOffset(offset + limit)}
        />
      </Box>
      <Box direction="row" align="center" gap="small">
        <Paragraph size="medium" margin="none" color="black">
          Jump to page
        </Paragraph>
        <Box width="xsmall">
          <TextInput
            size="medium"
            value={enteredPageNumber}
            onChange={handlePageNumberRequest}
          />
        </Box>
        <Button
          label="Go"
          disabled={!enteredPageNumberInRange || enteredPageNumber === ''}
          onClick={goToOffsetRequest}
        />
      </Box>
    </Box>
  )
}

export default SearchResultsOffset
