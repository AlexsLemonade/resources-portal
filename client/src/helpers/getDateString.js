// eg: 2nd Oct 2020

export const getOrdinalSuffix = (day) => {
  if (day % 10 === 1 && day !== 11) return 'st'
  if (day % 10 === 2 && day !== 12) return 'nd'
  if (day % 10 === 3 && day !== 13) return 'rd'
  return 'th'
}

export default (date) => {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sept',
    'Oct',
    'Nov',
    'Dec'
  ]

  const day = date.getDay()
  const month = date.getUTCMonth()
  const year = date.getFullYear()
  const suffix = getOrdinalSuffix(day)

  return `${day}${suffix} ${months[month]} ${year}`
}
