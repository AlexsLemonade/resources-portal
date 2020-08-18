import React from 'react'
import { Box, Text } from 'grommet'

// links should be a list of object with text, destination, notifications
export const SideNav = ({
  active,
  links = [],
  border = { side: 'right', size: 'small', color: 'black-tint-95' },
  onLinkClick = () => {}
}) => {
  return (
    <Box border={border}>
      {links.map((link) => (
        <Box
          key={link.href}
          as="a"
          direction="row"
          width="full"
          height="40px"
          background={
            active && link.href === active.href ? 'brand' : 'tint-black-95'
          }
          onClick={() => onLinkClick(link)}
          hoverIndicator={{ color: 'black-tint-80' }}
          pad="small"
          align="center"
          justify="between"
        >
          <Text>{link.text}</Text>
          {link.notifications > 0 && (
            <Box
              align="center"
              round="100%"
              background="error"
              width="24px"
              height="24px"
            >
              <Text>{link.notifications}</Text>
            </Box>
          )}
        </Box>
      ))}
    </Box>
  )
}
