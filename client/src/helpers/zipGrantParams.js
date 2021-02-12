// takes a query object and returns a list of grant objects if available
export default ({
  grant_title: grantTitles,
  grant_funder_id: grantFunderIds,
  grant_year: grantYears
}) => {
  if (!(grantTitles || grantFunderIds || grantYears)) return []

  const areArrays =
    Array.isArray(grantTitles) &&
    Array.isArray(grantFunderIds) &&
    Array.isArray(grantYears)

  if (areArrays)
    return grantTitles
      .map((title, index) => ({
        title,
        funder_id: grantFunderIds[index],
        year: grantYears[index]
      }))
      .filter(({ title, funder_id: id }) => title && id)

  return [{ title: grantTitles, funder_id: grantFunderIds, year: grantYears }]
}
