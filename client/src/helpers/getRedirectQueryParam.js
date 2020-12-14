// this code can only be run on the client
export default (path = '') => {
  return decodeURI(`${window.location.origin}${path}`)
}
