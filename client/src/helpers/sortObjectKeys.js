// transforms an object into an array

export const sortedObjectKeys = (obj, sort) => {
  return Object.keys(obj)
    .sort(sort)
    .map((key) => ({
      key,
      value: obj[key]
    }))
}

export const sortedObjectKeysByValues = (obj, ascending = true) => {
  const sort = ascending ? (a, b) => obj[b] - obj[a] : (a, b) => obj[a] - obj[b]
  return Object.keys(obj)
    .sort(sort)
    .map((key) => ({
      key,
      value: obj[key]
    }))
}
