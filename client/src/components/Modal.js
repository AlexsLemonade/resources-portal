import Icon from 'components/Icon'
import { Box, Button, Layer, Text } from 'grommet'
import * as React from 'react'

export const Modal = ({
  showing,
  setShowing,
  nondismissable,
  children,
  title
}) => {
  const dismissModal = () => {
    if (!nondismissable) {
      setShowing(false)
    }
  }
  return (
    <Box>
      {showing && (
        <Layer onEsc={dismissModal} onClickOutside={dismissModal}>
          <Box
            pad="none"
            gap="none"
            align="center"
            border={[{ color: 'black-tint-95' }]}
            background="white"
          >
            {!nondismissable && (
              <Box alignSelf="end">
                <Button
                  icon={<Icon color="black-tint-30" name="Cross" />}
                  onClick={dismissModal}
                  alignSelf="start"
                />
              </Box>
            )}
            {title && (
              <Box width="full" pad={{ horizontal: 'medium' }}>
                <Box
                  width="full"
                  border={{ side: 'bottom', color: 'border-black' }}
                >
                  <Text>{title}</Text>
                </Box>
              </Box>
            )}
            <Box fill pad="medium">
              {children}
            </Box>
          </Box>
        </Layer>
      )}
    </Box>
  )
}

export default Modal
