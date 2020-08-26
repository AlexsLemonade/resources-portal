import React from 'react'
import { Box, Button, Text } from 'grommet'
import Link from 'next/link'

export const AccountEmptyPage = ({
  paragraphs = [],
  buttonLabel,
  onClick,
  link,
  children
}) => {
  return (
    <Box align="center" pad="xxlarge">
      <Box align="center" margin={{ bottom: 'xxlarge' }}>
        {paragraphs.map((p) => (
          <Text
            key={p}
            color="black-tint-40"
            size="xxlarge"
            margin={{ bottom: 'large' }}
            textAlign="center"
          >
            {p}
          </Text>
        ))}
        {buttonLabel && onClick && (
          <Button primary label={buttonLabel} onClick={onClick} />
        )}
        {buttonLabel && link && (
          <Link href={link}>
            <Button primary label={buttonLabel} />
          </Link>
        )}
      </Box>
      {children}
    </Box>
  )
}

export default AccountEmptyPage
