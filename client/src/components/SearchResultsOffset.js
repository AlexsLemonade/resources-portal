import React from 'react'
import { Box, Button } from 'grommet'
import { FormPrevious, FormNext } from 'grommet-icons'

import { useMaterialsSearch } from '../hooks/useMaterialsSearch'

export const SearchResultsOffset = () => {
  const {
    query: { limit, offset },
    response: { count },
    setOffset,
    goToSearchResults
  } = useMaterialsSearch()

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
    goToSearchResults()
  }

  const atEnd = safeOffset === lastOffset
  const atStart = safeOffset === 0

  return (
    <Box
      pad={{ bottom: 'gutter' }}
      direction="row"
      gap="gutter"
      align="center"
      alignSelf="center"
    >
      <Box direction="row" gap="medium">
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
            <Button key="elipse-start" disabled plain label="..." />
          )
        ]}
        {pageButtonsOffsets.map((pageOffset) => (
          <Button
            key={pageOffset}
            plain
            label={pageOffset + 1}
            disabled={pageOffset === safeOffset}
            onClick={() => goToOffset(pageOffset)}
          />
        ))}
        {!pageButtonsOffsets.includes(lastOffset) && [
          !pageButtonsOffsets.includes(lastOffset - 1) && (
            <Button key="elipse" disabled plain label="..." />
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
      <Box>Jump to page</Box>
    </Box>
  )
}

export default SearchResultsOffset
