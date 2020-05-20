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
  const popoverRef = React.useRef()
  const [show, setShow] = React.useState(false)
  return (
    <>
      <Button
        label={label}
        ref={popoverRef}
        onClick={() => setShow(!show)}
        plain
        color="brand"
        width="auto"
      />
      {popoverRef.current && show && (
        <PopoverDrop
          align={{ top: 'bottom', left: 'left' }}
          target={popoverRef.current}
          onEsc={() => setShow(false)}
          stretch={false}
          overflow="initial"
        >
          <PopoverBox pad="medium" background="white" round={false}>
            {Array(50).map(() => children)}
            {children}
          </PopoverBox>
        </PopoverDrop>
      )}
    </>
  )
}

export default Popover
