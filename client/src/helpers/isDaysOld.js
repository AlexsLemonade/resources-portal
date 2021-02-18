export const daysSince = (dateString) => {
  const date = new Date(dateString)
  const today = new Date()
  const timeSinceToday = Math.abs(today.getTime() - date.getTime())
  return Math.round(timeSinceToday / (1000 * 60 * 60 * 24))
}

export default (dateString, numberOfDays = 0) => {
  return daysSince(dateString) >= numberOfDays
}
