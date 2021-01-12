export const renameOrg = (org, name = 'My Resources') => {
  return { ...org, name }
}

export default (orgOrOrgs) => {
  if (Array.isArray(orgOrOrgs)) {
    return orgOrOrgs.map((org) => {
      if (!org.is_personal_organization) return org
      return renameOrg(org)
    })
  }
  return renameOrg(orgOrOrgs)
}
