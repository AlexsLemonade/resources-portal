import { Box, Button, Layer } from 'grommet'
import * as React from 'react'
import Cross from '../images/cross.svg'

export const Modal = ({ showing, setShowing, children }) => {
  return (
    <Box>
      {showing && (
        <Layer
          onEsc={() => setShowing(false)}
          onClickOutside={() => setShowing(false)}
        >
          <Box
            pad="none"
            gap="none"
            align="center"
            border={[{ color: 'black-tint-95' }]}
            background="white"
          >
            <Box alignSelf="end">
              <Button
                icon={<Cross />}
                onClick={() => setShowing(false)}
                alignSelf="start"
              />
            </Box>
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
