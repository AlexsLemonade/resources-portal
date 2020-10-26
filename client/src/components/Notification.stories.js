import React from 'react'
import { Grommet, Box } from 'grommet'
import { storiesOf } from '@storybook/react'
import { Notification } from './Notification'
import theme from '../theme'

storiesOf('Notification', module).add('default', () => {
  const notification = {
    id: 1,
    created_at: '2020-07-31T19:26:23.868260+00:00',
    notification_type: 'APPROVE_REQUEST_PERM_GRANTED',
    email: 'no@nope.com',
    message:
      'PrimaryProf granted you permission to approve material transfer requests in PrimaryLab.',
    associated_material_id: null,
    associated_organization_id: 1,
    associated_user_id: null,
    notified_user_id: '10000000-0f5a-4165-b518-b2386a753d6f',
    deleted: null,
    delivered: true
  }

  return (
    <Grommet theme={theme}>
      <Box width="large" pad="small">
        <Notification notification={notification} />
      </Box>
    </Grommet>
  )
})
