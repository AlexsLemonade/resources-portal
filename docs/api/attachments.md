# Attachments
Supports adding, viewing, deleting, and updating attachments.

## Description
Attachments are used to support any kind of external file. These are often PDFs or images. Attachments are used for Material Transfer Agreements, Institutional Review Board documents, and sequence maps for materials among other things.

## Add a new attachment:

**Request**:

`POST` `/attachments/`

Parameters:

Name            | Type   | Description
----------------|--------|---
filename        | string | The filename of the attachment.
description     | string | A description of the attachment.
s3_bucket       | string | The bucket name if the attachment file.
s3_key          | string | The key of your s3 object.
sequence_map_for| json   | A material object in json. The material which this attachment is a sequence map for.

*Note:*

- `sequence_map_for` is optional, and should only be provided when the attachment is a sequence map.
- **[Authorization Protected](authentication.md)**

**Response**:

```json
Content-Type application/json
201 CREATED

{
   "id":18,
   "filename":"attachment_file",
   "description":"A file for testing",
   "s3_bucket":"bucket-name",
   "s3_key":"keyname",
   "s3_resource_deleted":false,
   "created_at":"2020-07-01T16:53:13+0000",
   "updated_at":"2020-07-01T16:53:13+0000",
   "sequence_map_for":"None"
}
```

## Get information on an attachment:

**Request**:

`GET` `/attachments/:id`

*Note:*

- **[Authorization Protected](authentication.md)**
- The only users who can view an attachment are:
   1. Users who are part of an organization which has an active material request
   2. Users who are the `requester` on an active material request
   3. Admins

**Response**:

```json
Content-Type application/json
200 OK

{
   "id":21,
   "filename":"attachment_file",
   "description":"A file for testing",
   "s3_bucket":"bucket-name",
   "s3_key":"keyname",
   "s3_resource_deleted":false,
   "created_at":"2020-07-01T17:09:17+0000",
   "updated_at":"2020-07-01T17:09:17+0000",
   "sequence_map_for":"None"
}
```

## List attachments:

**Request**:

`GET` `/attachments/`

*Note:*

- **[Authorization Protected](authentication.md)**
- Only admins can list attachments.

**Response**:

```json
Content-Type application/json
200 OK

[
   {
      "id":21,
      "filename":"attachment_file",
      "description":"A file for testing",
      "s3_bucket":"bucket-name",
      "s3_key":"keyname",
      "s3_resource_deleted":false,
      "created_at":"2020-07-01T17:09:17+0000",
      "updated_at":"2020-07-01T17:09:17+0000",
      "sequence_map_for":"None"
   }
]

```

## Update an attachment

**Request**:

`PUT/PATCH` `/attachments/:id`

Parameters:

Name            | Type   | Description
----------------|--------|---
filename        | string | The filename of the attachment.
description     | string | A description of the attachment.
s3_bucket       | string | The bucket name if the attachment file.
s3_key          | string | The key of your s3 object.
sequence_map_for| json   | A material object in json, the material which this attachment is a sequence map for.

*Note:*

- All parameters are optional
- **[Authorization Protected](authentication.md)**
- The only users who can update an attachment are:
   1. Users who are part of an organization which has an active material request
   2. Users who are the `requester` on an active material request
   3. Admins

**Response**:

```json
Content-Type application/json
200 OK

{
   "id":21,
   "filename":"attachment_file",
   "description":"A file for testing",
   "s3_bucket":"bucket-name",
   "s3_key":"keyname",
   "s3_resource_deleted":false,
   "created_at":"2020-07-01T17:09:17+0000",
   "updated_at":"2020-07-01T17:09:17+0000",
   "sequence_map_for":"None"
}
```

## Delete an attachment

**Request**:

`DELETE` `/attachments/:id`

*Note:*

- **[Authorization Protected](authentication.md)**
- The only users who can delete an attachment are:
   1. Users who are part of an organization which has an active material request
   2. Users who are the `requester` on an active material request
   3. Admins

**Response**:

```json
Content-Type application/json
204 NO_CONTENT
```
