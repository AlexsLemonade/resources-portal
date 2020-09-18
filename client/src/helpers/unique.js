export default (arr, key) => {
  if (!key) return arr.filter((e, i) => arr.indexOf(e) === i)

  const keys = arr.map((e) => e[key])

  return arr.filter((e, i) => keys.indexOf(e[key]) === i)
}
