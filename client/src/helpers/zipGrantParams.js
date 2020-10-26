// takes a query object and returns a list of grant objects if available
export default ({
  grant_title: grantTitles,
  grant_funder_id: grantFunderIds
}) => {
  if (!(grantTitles || grantFunderIds)) return []

  if (Array.isArray(grantTitles) && Array.isArray(grantFunderIds))
    return grantTitles.map((title, index) => ({
      title,
      funder_id: grantFunderIds[index]
    }))

  return [{ title: grantTitles, funder_id: grantFunderIds }]
}
