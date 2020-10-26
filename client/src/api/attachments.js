import getAPIUrl from 'helpers/getAPIUrl'
import request from 'helpers/request'
import urlSearchParamsFromKeys from 'helpers/urlSearchParamsFromKeys'
import formDataFromKeys from 'helpers/formDataFromKeys'

export default {
  create: async (attachment, authorization) => {
    const formData = formDataFromKeys(
      attachment,
      'file',
      'description',
      'owned_by_org'
    )
    return request(getAPIUrl('attachments/'), {
      authorization,
      method: 'POST',
      body: formData
    })
  },
  update: (id, attachment, authorization) => {
    // take the attachment object and only PUT the changeable things
    const updates = urlSearchParamsFromKeys(
      attachment,
      'description',
      'sequence_map_for'
    )
    return request(getAPIUrl(`attachments/${id}/`), {
      authorization,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      method: 'PATCH',
      body: updates
    })
  },
  delete: (id, authorization) =>
    request(getAPIUrl(`attachments/${id}/`), {
      authorization,
      method: 'DELETE'
    }),
  copy: (id, authorization) =>
    request(getAPIUrl(`attachments/${id}/copy`), {
      authorization,
      method: 'POST'
    })
}
