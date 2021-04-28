import React from 'react'
import request from 'helpers/request'
import getErrorMessages from 'helpers/getErrorMessages'

export default (portalId, formId) => {
  const [formData, setFormData] = React.useState({})
  const [errors, setErrors] = React.useState({})

  const apiBase = 'https://api.hsforms.com/submissions/v3/integration/submit'
  const endpoint = `${apiBase}/${portalId}/${formId}`

  const getAttribute = (attribute) => formData[attribute]

  const setAttribute = (attribute, value) => {
    resetError(attribute)
    const newFormData = { ...formData }
    newFormData[attribute] = value
    setFormData(newFormData)
  }

  // helper for slowly removing errors from the error obj
  const resetError = (attribute) => {
    if (attribute in errors) {
      const newErrors = { ...errors }
      delete newErrors[attribute]
      setErrors(newErrors)
    }
  }

  // take a schema from /schemas test it and set errors from helper
  // call this before submit()
  const validate = async (schema) => {
    try {
      await schema.validate(formData, { abortEarly: false })
    } catch (e) {
      setErrors(getErrorMessages(e))
      return false
    }

    return true
  }

  // can't just post the json data, no that would be too easy
  // convert to {fields: [{name, value}]}
  const submit = async () => {
    const fields = Object.keys(formData).map((f) => ({
      name: f,
      value: getAttribute(f)
    }))
    return request(endpoint, {
      method: 'POST',
      body: JSON.stringify({ fields })
    })
  }

  // helper for knowing when to disable the button
  const hasError = Object.keys(errors).length !== 0

  return {
    getAttribute,
    setAttribute,
    submit,
    validate,
    errors,
    hasError
  }
}
