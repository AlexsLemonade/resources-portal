// presents the grant title with the year if present
export default (grant) => {
  if (!grant.year) return grant.title
  return `${grant.title} (${grant.year})`
}
