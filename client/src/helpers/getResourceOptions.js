import getRequestRequirements from 'helpers/getRequestRequirements'

// filters out resources with no requirements
// maps to options for a select to consume

export default (resources = [], grantOptions = []) =>
  resources
    .filter((resource) => getRequestRequirements(resource).hasRequirements)
    .filter((resource) => resource.grants.length > 0)
    .map((resource) => {
      const grants = resource.grants
        .map((id) => {
          return grantOptions.find((g) => g.id === id)
        })
        .filter((g) => g)

      return {
        disabled: false,
        id: `${resource.id}`,
        name: `resource-${resource.id}`,
        value: resource.id,
        resource: {
          ...resource,
          grants
        }
      }
    })
