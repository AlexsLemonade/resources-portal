export default (type, value, fallback) => {
  let parsed = NaN
  if (type === 'float') {
    parsed = parseFloat(value)
    if (`${value}`.endsWith('.')) {
      parsed = `${parsed}.`
    }
  }
  if (type === 'integer') {
    parsed = parseInt(value, 10)
  }

  if (value === '') return ''

  if (Number.isNaN(parsed)) return fallback

  return parsed
}
