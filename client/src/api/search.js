import { fakeSearchMaterialsResponse } from '../helpers/testData'

export const searchResources = async () => {
  // perform fetch from api
  const fakeAPICall = new Promise((resolve) =>
    setTimeout(() => resolve(fakeSearchMaterialsResponse), 20)
  )
  const response = await fakeAPICall

  return response
}

export default {
  searchResources
}
