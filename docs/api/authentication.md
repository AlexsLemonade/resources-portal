# Authentication
For clients to authenticate, the token key should be included in the Authorization HTTP header. The key should be prefixed by the string literal "Token", with whitespace separating the two strings. For example:

```
Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b
```

Unauthenticated responses that are denied permission will result in an HTTP `401 Unauthorized` response with an appropriate `WWW-Authenticate` header. For example:

```
WWW-Authenticate: Token
```

The curl command line tool may be useful for testing token authenticated APIs. For example:

```bash
curl -X GET http://127.0.0.1:8000/api/v1/example/ -H 'Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b'
```

## Retrieving Tokens
Authorization tokens are issued and returned when a user registers. A registered user can also retrieve their token with the following request:

**Request**:

`POST` `/login`

Parameters:

Name       | Type   | Description
-----------|--------|---
code       | string | An authorization code issued through ORCID OAuth
origin_url | string | The URL of the endpoint the user is authenticated from. Must match the redirect_url used to retrieve the ORCID auth code.

**Response**:
```json
{
    "user_id" : "10000000-0f5a-4165-b518-b2386a753d6f",
    "token" : "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b",
    "expires" : "2021-02-22T17:09:15.513Z"
}
```
