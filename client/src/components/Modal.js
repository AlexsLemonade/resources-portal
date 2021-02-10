import Icon from 'components/Icon'
import { Box, Button, Layer, Stack, Text } from 'grommet'
import * as React from 'react'

export const Modal = ({
  showing,
  setShowing,
  nondismissable,
  children,
  title,
  critical = false
}) => {
  const dismissModal = () => {
    if (!nondismissable) {
      setShowing(false)
    }
  }

  return (
    <>
      {showing && (
        <Layer
          onEsc={dismissModal}
          onClickOutside={dismissModal}
          modal
          background="white"
          border={{ color: 'black-tint-95' }}
        >
          <Stack anchor="top-right">
            <Box
              flex
              overflow="auto"
              height={{ min: 'min-content', max: '100vh' }}
              width={{ min: '600px', max: '100vw' }}
              pad={{ vertical: 'large', horizontal: 'xlarge' }}
              gap="none"
              align="center"
              round="xsmall"
              border={
                critical
                  ? { side: 'top', color: 'error', size: 'medium' }
                  : undefined
              }
            >
              <Box width="full" height={{ min: 'min-content' }}>
                {title && (
                  <Box
                    width="full"
                    border={{
                      side: 'bottom',
                      color: 'border-black',
                      size: 'small'
                    }}
                    height={{ min: 'min-content' }}
                    pad={{ bottom: 'medium' }}
                    margin={{ bottom: 'medium' }}
                  >
                    <Text serif size="xlarge">
                      {title}
                    </Text>
                  </Box>
                )}
                {children}
              </Box>
            </Box>
            {!nondismissable && (
              <Button
                icon={<Icon color="black-tint-30" name="Cross" size="16px" />}
                onClick={dismissModal}
                alignSelf="end"
                margin="medium"
              />
            )}
          </Stack>
        </Layer>
      )}
    </>
  )
}

export default Modal
