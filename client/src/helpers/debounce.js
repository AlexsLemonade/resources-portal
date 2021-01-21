export default (f, delay) => {
  let timer = null

  return (...args) => {
    clearTimeout(timer)
    return new Promise((resolve) => {
      timer = setTimeout(() => resolve(f(...args)), delay)
    })
  }
}

export const debouncer = (delay) => {
  let timer = null
  return (f, ...args) => {
    clearTimeout(timer)
    return new Promise((resolve) => {
      timer = setTimeout(() => resolve(f(...args)), delay)
    })
  }
}
