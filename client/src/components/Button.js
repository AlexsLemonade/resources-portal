import React from 'react'
import { Button } from 'grommet'
import useWaitForAsync from 'hooks/useWaitForAsync'

export default ({ onClick, ...props }) => {
  const [waiting, asyncOnClick] = useWaitForAsync(onClick)
  const disabled = waiting || props.disabled

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Button {...props} onClick={asyncOnClick} disabled={disabled} />
  )
}
