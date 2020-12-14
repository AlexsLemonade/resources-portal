// returns link to orcid for oauth
import getRedirectQueryParam from 'helpers/getRedirectQueryParam'

export default (redirectPath = '/account') => {
  const redirectUri = getRedirectQueryParam(redirectPath)
  return `${process.env.ORCID_URL}oauth/authorize?client_id=${process.env.ORCID_CLIENT_ID}&response_type=code&scope=/authenticate&redirect_uri=${redirectUri}`
}
