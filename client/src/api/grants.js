import getAPIUrl from 'helpers/getAPIUrl'
import request from 'helpers/request'

export default {
  material: {
    create: (grantId, materialId, authorization) =>
      request(getAPIUrl(`grants/${grantId}/materials/`), {
        authorization,
        method: 'POST',
        body: JSON.stringify({
          id: materialId
        })
      }),
    delete: (grantId, materialId, authorization) =>
      request(getAPIUrl(`grants/${grantId}/materials/`), {
        authorization,
        method: 'DELETE',
        body: JSON.stringify({
          id: materialId
        })
      })
  }
}
