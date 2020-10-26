import getAPIUrl from 'helpers/getAPIUrl'
import request from 'helpers/request'

export default {
  create: (issue, authorization) =>
    request(getAPIUrl('report-issue/'), {
      authorization,
      method: 'POST',
      body: JSON.stringify(issue)
    })
}
