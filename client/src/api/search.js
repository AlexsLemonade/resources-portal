import getAPIUrl from 'helpers/getAPIUrl'
import request from 'helpers/request'

export default {
  resources: (query) => request(getAPIUrl('search/materials/', query)),
  users: (query, authorization) =>
    request(getAPIUrl('search/users/', query), { authorization })
}
