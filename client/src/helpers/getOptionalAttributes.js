// converts a schema to a list of optional attributes
export default (schema, object) => {
  const optionalAttributes = []

  const addRequired = ([key, desc]) => {
    if (
      key &&
      !desc.tests.find((t) => ['defined', 'required'].includes(t.name))
    ) {
      optionalAttributes.push(key)
    }
    if (desc.fields) Object.entries(desc.fields).forEach(addRequired)
  }

  addRequired([undefined, schema.describe(object)])

  return optionalAttributes
}
