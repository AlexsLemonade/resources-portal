import React from 'react'
import { Box, Button, Paragraph, TextInput } from 'grommet'
import { FormPrevious, FormNext } from 'grommet-icons'
import { isOnlyNumbers } from '../helpers/isOnlyNumbers'
import { useSearchResources } from '../hooks/useSearchResources'

export const SearchResultsOffset = () => {
  const {
    query: { limit, offset },
    response: { count },
    setOffset,
    goToSearchResults
  } = useSearchResources()

  const [enteredPageNumber, setEnteredPageNumber] = React.useState('')
  const [
    enteredPageNumberInRange,
    setEnteredPageNumberInRange
  ] = React.useState(false)

  const safeOffset = parseInt(offset, 10) || 0
  const safeCount = parseInt(count, 10) || 0
  const safeLimit = parseInt(limit, 10)
  const lastOffset =
    safeCount && safeLimit > 0 ? Math.floor(safeCount / safeLimit) : 0

  const startingPageSlices =
    safeOffset <= 2 ? [0, 6] : [safeOffset - 2, safeOffset + 3]

  const pageSlices = lastOffset - safeOffset <= 2 ? [-5] : startingPageSlices

  const pageButtonsOffsets = [...Array(lastOffset + 1).keys()].slice(
    ...pageSlices
  )

  const goToOffset = (page) => {
    setOffset(page)
    setEnteredPageNumber('')
    goToSearchResults()
  }

  const atEnd = safeOffset === lastOffset
  const atStart = safeOffset === 0

  const handlePageNumberRequest = ({ target: { value } }) => {
    const parsedValue = parseInt(value, 10)
    if (isOnlyNumbers(value)) {
      const pageOffset = parsedValue - 1
      const inRange = pageOffset <= lastOffset && pageOffset >= 0
      setEnteredPageNumberInRange(inRange)
      setEnteredPageNumber(value)
    }
    if (value === '') setEnteredPageNumber('')
  }

  const goToOffsetRequest = () => {
    goToOffset(parseInt(enteredPageNumber, 10) - 1)
  }

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
          disabled={!safeOffset}
          onClick={() => goToOffset(safeOffset - 1)}
        />
        {!pageButtonsOffsets.includes(0) && [
          <Button
            plain
            key="start"
            pad="xsmall"
            label={1}
            onClick={() => goToOffset(0)}
          />,
          !pageButtonsOffsets.includes(1) && (
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
        {pageButtonsOffsets.map((pageOffset) =>
          safeOffset !== pageOffset ? (
            <Button
              key={pageOffset}
              plain
              label={pageOffset + 1}
              onClick={() => goToOffset(pageOffset)}
            />
          ) : (
            <Paragraph
              key="current-page"
              size="medium"
              margin="none"
              color="black"
            >
              {pageOffset + 1}
            </Paragraph>
          )
        )}
        {!pageButtonsOffsets.includes(lastOffset) && [
          !pageButtonsOffsets.includes(lastOffset - 1) && (
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
            key={lastOffset}
            pad="xsmall"
            label={lastOffset + 1}
            onClick={() => goToOffset(lastOffset)}
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
          onClick={() => goToOffset(safeOffset + 1)}
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
