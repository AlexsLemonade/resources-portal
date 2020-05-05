import { fakeSearchMaterialsResponse } from '../helpers/testData'

export const searchResources = async () => {
  // perform fetch from api
  console.log('faking materials api search endpoint (20ms)')
  const fakeAPICall = new Promise((resolve) =>
    setTimeout(() => resolve(fakeSearchMaterialsResponse), 20)
  )
  const response = await fakeAPICall

  return response
}

export default {
  searchResources
}
