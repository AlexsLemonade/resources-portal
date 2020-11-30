import getAPIUrl from 'helpers/getAPIUrl'
import request from 'helpers/request'

export default {
  create: (email, authorization) =>
    request(getAPIUrl('email-invitation/'), {
      authorization,
      method: 'POST',
      body: JSON.stringify({ email })
    })
}
