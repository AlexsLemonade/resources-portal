import * as React from 'react'
import { Grommet, Box, Button } from 'grommet'
import { storiesOf } from '@storybook/react'
import { ProgressBar } from './ProgressBar'
import theme from '../theme'

storiesOf('Progress Bar', module).add('default', () => {
  const steps = ['First Step', 'Second Step', 'Third Step']
  const [currentIndex, setCurrentIndex] = React.useState(-1)
  const decrement = () => setCurrentIndex(Math.max(-1, currentIndex - 1))
  const increment = () =>
    setCurrentIndex(Math.min(steps.length - 1, currentIndex + 1))

  return (
    <Grommet theme={theme}>
      <Box pad="medium">
        <ProgressBar steps={steps} index={currentIndex} />
      </Box>
      <Box direction="row" justify="center" gap="20px">
        <Button
          disabled={currentIndex === -1}
          label="Previous"
          onClick={decrement}
        />
        <Button
          disabled={currentIndex === steps.length - 1}
          label="Next"
          onClick={increment}
        />
      </Box>
    </Grommet>
  )
})
