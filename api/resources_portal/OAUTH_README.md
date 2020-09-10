## Three-legged ORCID OAUTH Integration

The primary method to sign in to the Resources Portal is through ORCID's OAUTH functionality. Within this flow, users will use two tokens to authenticate with ORCID.

1. Authentication Code
The first call made in the OAUTH flow is to ORCID's authentication endpoint. This call redirects the user to ORCID's sign-in page. The user will enter their credentials and grant "Trusted-party" access to ALSF. ORCID will then redirect back to the Resources Portal website with an authentication code.

Call Format:
`https://orcid.org/oauth/authorize?
client_id=APP-123456789
&response_type=code
&scope=/authenticate
&redirect_uri=https://resources.alexslemonade.org/`

This code has only one purpose- to be exchanged for the user's ORCID, access token, and refresh token. It is very short-lived (a minute or two), and can only be used once. Once we have this code, we submit it along with the redirect_uri to the /orcid-credentials endpoint, which performs the exchange. Note the the redirect_uri submitted must match the redirect_uri in the first call.

This exchange consumes a few additional variables, provided in the project's settings:
1. The ORCID client ID
2. The ORCID client secret

2. Access Token
Once we have exchanged the code for the access token, we are able to request records from ORCID. This is done as part of the /login or /create-user endpoints. The `/login` endpoint will simply submit the access_token to ORCID to authenticate. The `/create-user` endpoint will submit requests to ORCID to retreive the user's name and email.

Sandbox vs Production
