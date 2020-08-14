# Users
Supports registering, viewing, and updating user accounts.

## Description
A user represents a single researcher or scientist on the site. A user is created using OAuth through ORCID, which allows each user to be associated with an ORCID.

## Get a user's profile information

**Request**:

`GET` `/users/:id`

Parameters:

*Note:*

- **[Authorization Protected](authentication.md)**

**Response**:

```json
Content-Type application/json
200 OK

{
  "id": "6d5f9bae-a31b-4b7b-82c4-3853eda2b011",
  "username": "richard",
  "first_name": "Richard",
  "last_name": "Hendriks",
  "email": "richard@piedpiper.com",
  "addresses": [],
  "assignments": [],
  "created_at": "2020-08-12T15:51:47+0000",
  "grants": [],
  "invitations": [],
  "material_requests": [],
  "orcid": "842d2e20-7d17-42b7-a48b-1e9263c08dd9",
  "organizations": [],
  "owned_attachments": [],
  "owned_organizations": [],
  "updated_at": "2020-08-12T15:51:47+0000",
}
```


## Update your profile information

**Request**:

`PUT/PATCH` `/users/:id`

Parameters:

Name       | Type   | Description
-----------|--------|---
first_name | string | The first_name of the user object.
last_name  | string | The last_name of the user object.
email      | string | The user's email address.



*Note:*

- All parameters are optional
- **[Authorization Protected](authentication.md)**

**Response**:

```json
Content-Type application/json
200 OK

{
  "id": "6d5f9bae-a31b-4b7b-82c4-3853eda2b011",
  "username": "richard",
  "first_name": "Richard",
  "last_name": "Hendriks",
  "email": "richard@piedpiper.com",
  "addresses": [],
  "assignments": [],
  "created_at": "2020-08-12T15:51:47+0000",
  "grants": [],
  "invitations": [],
  "material_requests": [],
  "orcid": "842d2e20-7d17-42b7-a48b-1e9263c08dd9",
  "organizations": [],
  "owned_attachments": [],
  "owned_organizations": [],
  "updated_at": "2020-08-12T15:51:47+0000",
}
```
