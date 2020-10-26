import FormData from 'form-data'

// create new form data object and attach keys from object
export default (obj, ...keys) => {
  const formData = new FormData()
  keys.forEach((key) => {
    if (Object.keys(obj).includes(key)) {
      formData.append(key, obj[key])
    }
  })
  return formData
}
