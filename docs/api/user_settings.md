# User Settings
Supports viewing and updating user settings.

## Description
User settings determine what notifications a user will recieve. They can toggle each of a number of categories of notifications on or off.

## Get information on a user's settings:

**Request**:

`GET` `/organization-user-settings/:id`

*Note:*

- **[Authorization Protected](authentication.md)**
- Only the user referenced by a settings object can view it. They also can only view settings while they are still in the organization referenced by the settings object.

**Response**:

```json
Content-Type application/json
200 OK

{
   "id":8,
   "new_request_notif":true,
   "change_in_request_status_notif":true,
   "request_approval_determined_notif":true,
   "request_assigned_notif":true,
   "reminder_notif":true,
   "user":"UUID("   "8adbfcf0-7b4e-45b7-811a-f63a44d63c3d"   ")",
   "organization":3,
   "created_at":"2020-07-01T19:52:07+0000",
   "updated_at":"2020-07-01T19:52:07+0000"
}
```

## Update an attachment

**Request**:

`PUT/PATCH` `/organization-user-settings/:id`

Parameters:

Name                             | Type | Description
---------------------------------|------|---
new_request_notif                | bool | Specifies whether the user will recieve notifications of new requests from the assocoiated organization.
change_in_request_status_notif   | bool | Specifies whether the user will recieve notifications of changes in requests from the assocoiated organization.
request_approval_determined_notif| bool | Specifies whether the user will recieve notifications when requests are approved/denied.
request_assigned_notif           | bool | Specifies whether the user will recieve notifications when a new request is assigned to them.
reminder_notif                   | bool | Specifies whether the user will recieve notifications reminding them of outstanding requirements.

*Note:*

- All parameters are optional
- **[Authorization Protected](authentication.md)**
- Only the user referenced by a settings object can update it. They also can only update settings while they are still in the organization referenced by the settings object.

**Response**:

```json
Content-Type application/json
200 OK

{
   "id":8,
   "new_request_notif":true,
   "change_in_request_status_notif":true,
   "request_approval_determined_notif":true,
   "request_assigned_notif":true,
   "reminder_notif":true,
   "user":"UUID("   "8adbfcf0-7b4e-45b7-811a-f63a44d63c3d"   ")",
   "organization":3,
   "created_at":"2020-07-01T19:52:07+0000",
   "updated_at":"2020-07-01T19:52:07+0000"
}
```
