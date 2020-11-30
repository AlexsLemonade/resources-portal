import getAPIUrl from 'helpers/getAPIUrl'
import request from 'helpers/request'

export default {
  create: (authCode, originUrl) =>
    request(getAPIUrl('orcid-credentials/'), {
      method: 'POST',
      body: JSON.stringify({ code: authCode, origin_url: originUrl })
    })
}
