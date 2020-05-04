import { materialsTestData } from '../helpers/testData'

const fakeResponse = {
  count: 201,
  next: null,
  previous: null,
  facets: {
    category: {
      DATASET: 3555,
      MODEL_ORGANISM: 2043,
      CELL_LINE: 12,
      OTHER: 233,
      PLASMID: 4,
      PROTOCOL: 234,
      PDX: 423
    },
    organism: {
      Mousey: 42,
      Ducky: 34,
      Deer: 9999,
      Guy: 400
    },
    has_publication: 200,
    has_pre_print: 12
  },
  results: materialsTestData.slice(0, 10)
}

export const searchResources = async () => {
  // perform fetch from api
  console.log('faking materials api search endpoint (2s)')
  const fakeAPICall = new Promise((resolve) =>
    setTimeout(() => resolve(fakeResponse), 20)
  )
  const response = await fakeAPICall

  return response
}

export default {
  searchResources
}
