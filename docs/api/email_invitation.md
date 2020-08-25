# Email Invitations
Supports adding, viewing, deleting, and updating email invitations.

## Description
POSTing to this endpoint will send an email invitation to a provided email.

## Add a new email_invitation:

**Request**:

`POST` `/email-invitations/`

Parameters:

Name            | Type   | Description
----------------|--------|---
email           | string | The email address to send an email invitation to.

*Note:*

- On success no data will be returned, because no object is created.
- **[Authorization Protected](authentication.md)**

**Response**:

```json
Content-Type application/json
201 CREATED

{}
```
