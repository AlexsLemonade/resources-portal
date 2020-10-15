import React from 'react'
import { Box, Button, Drop } from 'grommet'
import { normalizeColor } from 'grommet/utils'
import styled from 'styled-components'

const PopoverDrop = styled(Drop)`
  padding: 8px 4px;
  margin: 0;
  border: none;
  box-shadow: none;
  background: transparent;
`

const PopoverBox = styled(Box)`
  box-shadow: 0 4px 18px 1px rgba(0, 0, 0, 0.23);
  &:after {
    ${(props) => `
      background-color: ${normalizeColor('white', props.theme)};
    `}
    position: absolute;
    content: '';
    top: 0;
    left: 16px;
    width: 16px;
    height: 16px;
    transform: rotate(45deg);
  }
`

export const Popover = ({ label, children }) => {
  const buttonRef = React.useRef()
  const [show, setShow] = React.useState(false)
  const onDropClose = React.useCallback(
    (event) => {
      // if the user has clicked on our Button, don't do anything here,
      // handle that in onClickInternal() below.
      let node = event.target
      while (node !== document && node !== buttonRef.current) {
        node = node.parentNode
      }
      if (node !== buttonRef.current) {
        // don't change internal state if caller is driving
        setShow(false)
      }
    },
    [buttonRef]
  )
  const onClickInternal = React.useCallback(() => {
    if (!show) {
      setShow(true)
    } else {
      setShow(false)
    }
  }, [show])

  return (
    <>
      <Button
        label={label}
        ref={buttonRef}
        onClick={onClickInternal}
        plain
        color="brand"
        width="auto"
      />
      {buttonRef.current && show && (
        <PopoverDrop
          align={{ top: 'bottom', left: 'left' }}
          target={buttonRef.current}
          onEsc={onDropClose}
          onClickOutside={onDropClose}
          stretch={false}
          overflow="initial"
        >
          <PopoverBox pad="medium" background="white" round={false}>
            {children}
          </PopoverBox>
        </PopoverDrop>
      )}
    </>
  )
}

export default Popover
