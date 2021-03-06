import { getReadable } from 'helpers/readableNames'

// convert Yup.js validationError object to error messages object
export default (validationError) => {
  const messages = {}
  validationError.inner.forEach(({ path, errors }) => {
    let message = messages
    path.split('.').forEach((attribute, index, arr) => {
      message[attribute] = message[attribute] || {}
      if (index === arr.length - 1) {
        message[attribute] = errors.map((error) =>
          error.replace(path, getReadable(attribute))
        )
      } else {
        message = message[attribute]
      }
    })
  })

  return messages
}
