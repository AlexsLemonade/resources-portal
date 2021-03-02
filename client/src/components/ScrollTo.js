import React from 'react'
import { useRouter } from 'next/router'
import { Box } from 'grommet'

/*
 * link to your component with `http://my.example.url?scroll=name`
 * Usage: <ScrollTo name="name"> <AnyComponent /> </ScrollTo>
 */

export default ({ name, children }) => {
  const router = useRouter()
  const ref = React.useRef()
  const scrolledRef = React.useRef(false)
  React.useEffect(() => {
    const nameMatch = name && name === router.query.scroll
    const hasRef = !!ref.current
    const scrolled = scrolledRef.current
    if (nameMatch && hasRef && !scrolled) {
      scrolledRef.current = true
      // TODO: this will need to be updated when responsive to account for the
      // also this is not the best implementation of this feature since the
      // document height is not set until after the api requests are returned
      setTimeout(() => {
        window.scroll(0, ref.current.offsetTop - 83)
      }, 475)
    }
  }, [])
  return <Box ref={ref}>{children}</Box>
}
