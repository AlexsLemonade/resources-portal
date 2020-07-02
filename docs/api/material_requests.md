# Material Requests
Supports adding, viewing, deleting, and updating material requests.

## Description
Material Requests are used to track the progress of a material trasfer between a requester and the organization in charge of the requested material. All documents associated with the transfer are linked to the Material Request object.

## Add a new material request:

**Request**:

`POST` `/material-requests/`

Parameters:

Name                           | Type   | Description
-------------------------------|--------|---
material                       | int    | The ID of the material being requested.
requester_signed_mta_attachment| int    | The ID of an attachment object which references a signed Material Transfer Agreement attachment.
irb_attachment                 | int    | The ID of an attachment object which references an Institutional Review Board attachment.


*Note:*

- `sequence_map_for` is optional, and should only be provided when the attachment is a sequence map.
- **[Authorization Protected](authentication.md)**

**Response**:

```json
Content-Type application/json
201 CREATED

{
   "id":6,
   "material":5,
   "requester":"ee1d43f8-7407-4031-9f1b-f9a5fcf2da26",
   "requester_signed_mta_attachment":15,
   "irb_attachment":14,
   "executed_mta_attachment":13,
   "is_active":true,
   "status":"PENDING",
   "assigned_to":"f75bd715-e188-4c4e-80a3-623793770730"
}
```

## Get information on a material request

**Request**:

`GET` `/material-requests/:id`

*Note:*

- **[Authorization Protected](authentication.md)**
- The only users who can view a material requests are:
   1. Users who are part of the organization which owns the requested material
   2. The requester

**Response**:

```json
Content-Type application/json
200 OK

{
   "id":6,
   "material":5,
   "requester":"ee1d43f8-7407-4031-9f1b-f9a5fcf2da26",
   "requester_signed_mta_attachment":15,
   "irb_attachment":14,
   "executed_mta_attachment":13,
   "is_active":true,
   "status":"PENDING",
   "assigned_to":"f75bd715-e188-4c4e-80a3-623793770730"
}
```

## List material requests:

**Request**:

`GET` `/material-requests/`

*Note:*

- **[Authorization Protected](authentication.md)**
- The only users who can list material requests are users who are part of the organization which owns the requested material.

**Response**:

```json
Content-Type application/json
200 OK

...
    {
    "id":6,
    "material":5,
    "requester":"ee1d43f8-7407-4031-9f1b-f9a5fcf2da26",
    "requester_signed_mta_attachment":15,
    "irb_attachment":14,
    "executed_mta_attachment":13,
    "is_active":true,
    "status":"PENDING",
    "assigned_to":"f75bd715-e188-4c4e-80a3-623793770730"
    }
...

```

## Update a material request

**Request**:

`PUT/PATCH` `/material-requests/:id`

Parameters:

Name                           | Type   | Description
-------------------------------|--------|---
status                         | string | The current status of the material request. Updating this will send notifications to the other party in the material request.
requester_signed_mta_attachment| int    | The ID of an attachment object which references a signed Material Transfer Agreement attachment.
irb_attachment                 | int    | The ID of an attachment object which references an Institutional Review Board attachment.
executed_mta_attachment        | int    | The ID of an attachment object which references an executed MTA attachment.
is_active                      | bool   | Boolean determining if the material request has been resolved or not.

*Note:*

- All parameters are optional
- **[Authorization Protected](authentication.md)**
- The only users who can update an attachment are:
   1. Users who are part of an organization which has an active material request
   2. The requester

**Response**:

```
json
Content-Type application/json
200 OK

{
   "id":6,
   "material":5,
   "requester":"ee1d43f8-7407-4031-9f1b-f9a5fcf2da26",
   "requester_signed_mta_attachment":15,
   "irb_attachment":14,
   "executed_mta_attachment":13,
   "is_active":True,
   "status":"PENDING",
   "assigned_to":"f75bd715-e188-4c4e-80a3-623793770730"
}
```

## Delete an attachment

**Request**:

`DELETE` `/material-requests/:id`

*Note:*

- **[Authorization Protected](authentication.md)**
- Only admins can delete a material request.

**Response**:

```json
Content-Type application/json
204 NO_CONTENT
```
