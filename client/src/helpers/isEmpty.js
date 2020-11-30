export default (test) => {
  // check if empty object
  if (typeof test === 'object') return Object.keys(test).length === 0
  // check if empty array
  if (Array.isArray(test)) return test.length === 0
  // check if empty string
  if (typeof test === 'string') return test.length === 0
  // coerce boolean
  return Boolean(test)
}
