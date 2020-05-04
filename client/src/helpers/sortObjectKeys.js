// transforms an object into an array
// maps an object to an array of object for each key
// key is the object key and value is the value for that key

// the default sort function is alphabetical
export const sortedObjectKeys = (obj, sort) => {
  return Object.keys(obj)
    .sort(sort)
    .map((key) => ({
      key,
      value: obj[key]
    }))
}

// this sorts the resulting array by the value of each key
// this expects all of the values in the object to be numerical
export const sortedObjectKeysByValues = (obj, ascending = true) => {
  const sort = ascending ? (a, b) => obj[b] - obj[a] : (a, b) => obj[a] - obj[b]
  return Object.keys(obj)
    .sort(sort)
    .map((key) => ({
      key,
      value: obj[key]
    }))
}
