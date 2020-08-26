import React from 'react'
import { Anchor, Box, Heading } from 'grommet'
import NextLink from 'next/link'
import Icon from 'components/Icon'

// linker is just a placeholder for Link
// this allows us to render the component in StoryBook
// where we override it with a native anchor tag

export const DrillDownNav = ({
  title,
  linkBack,
  secondaryLinkLabel,
  secondaryLink,
  Link = NextLink,
  children
}) => {
  return (
    <>
      <Box
        border={{
          side: 'bottom',
          size: 'small',
          color: 'turteal-tint-80'
        }}
        width="full"
        alignContent="between"
        align="center"
        pad={{ bottom: 'xsmall' }}
        gap="small"
        direction="row"
      >
        {linkBack && (
          <Link href={linkBack}>
            <Anchor href={linkBack} margin={{ top: '4px' }}>
              <Icon name="ChevronLeft" size="16px" />
            </Anchor>
          </Link>
        )}
        <Heading serif level={5} margin="none">
          {title}
        </Heading>
        {secondaryLink && (
          <Box align="end" fill="horizontal">
            <Link href={secondaryLink}>
              <Anchor href={secondaryLink} label={secondaryLinkLabel} />
            </Link>
          </Box>
        )}
      </Box>
      <Box pad={{ top: 'medium' }}>{children}</Box>
    </>
  )
}

export default DrillDownNav
