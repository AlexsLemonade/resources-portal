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
owned_by_org    | int    | The ID of the organization that you would like this attachment to be owned by or shared with.
sequence_map_for| json   | A material object in json. The material which this attachment is a sequence map for.

*Note:*

- `sequence_map_for` is optional, and should only be provided when the attachment is a sequence map.
- `owned_by_org` is optional.
- **[Authorization Protected](authentication.md)**

**Response**:

```json
Content-Type application/json
201 CREATED

{
   "id":5,
   "filename":"nerd_sniping.png",
   "description":"A file for testing",
   "download_url":"/v1/uploaded-file/attachment_5/nerd_sniping.png",
   "s3_resource_deleted":false,
   "created_at":"2020-07-22T05:08:21+0000",
   "updated_at":"2020-07-22T05:08:21+0000",
   "sequence_map_for":"None",
   "owned_by_org":3,
   "owned_by_user":"06fca1ec-8a9d-485b-8a37-3eba49081aec"
}
```

## Get information on an attachment:

**Request**:

`GET` `/attachments/:id`

*Note:*

- **[Authorization Protected](authentication.md)**
- The only users who can view an attachment are:
   1. The `owned_by_user`
   2. Members of the `owned_by_organization`
   3. Admins

**Response**:

```json
Content-Type application/json
200 OK

{
   "id":5,
   "filename":"nerd_sniping.png",
   "description":"A file for testing",
   "download_url":"/v1/uploaded-file/attachment_5/nerd_sniping.png",
   "s3_resource_deleted":false,
   "created_at":"2020-07-22T05:08:21+0000",
   "updated_at":"2020-07-22T05:08:21+0000",
   "sequence_map_for":"None",
   "owned_by_org":3,
   "owned_by_user":"06fca1ec-8a9d-485b-8a37-3eba49081aec"
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
      "id":5,
      "filename":"nerd_sniping.png",
      "description":"A file for testing",
      "download_url":"/v1/uploaded-file/attachment_5/nerd_sniping.png",
      "s3_resource_deleted":false,
      "created_at":"2020-07-22T05:08:21+0000",
      "updated_at":"2020-07-22T05:08:21+0000",
      "sequence_map_for":"None",
      "owned_by_org":3,
      "owned_by_user":"06fca1ec-8a9d-485b-8a37-3eba49081aec"
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
owned_by_user   | uuid   | The ID of the owning user.
owned_by_org    | int    | The ID of the organization that you would like this attachment to be owned by or shared with.
sequence_map_for| json   | A material object in json. The material which this attachment is a sequence map for.

*Note:*

- All parameters are optional
- **[Authorization Protected](authentication.md)**
- The only users who can update an attachment are:
   1. The `owned_by_user`
   2. Members of the `owned_by_organization`
   3. Admins

**Response**:

```json
Content-Type application/json
200 OK

{
   "id":5,
   "filename":"nerd_sniping.png",
   "description":"A file for testing",
   "download_url":"/v1/uploaded-file/attachment_5/nerd_sniping.png",
   "s3_resource_deleted":false,
   "created_at":"2020-07-22T05:08:21+0000",
   "updated_at":"2020-07-22T05:08:21+0000",
   "sequence_map_for":"None",
   "owned_by_org":3,
   "owned_by_user":"06fca1ec-8a9d-485b-8a37-3eba49081aec"
}
```

## Delete an attachment

**Request**:

`DELETE` `/attachments/:id`

*Note:*

- **[Authorization Protected](authentication.md)**
- The only users who can delete an attachment are:
   1. The `owned_by_user`
   2. Members of the `owned_by_organization`
   3. Admins

**Response**:

```json
Content-Type application/json
204 NO_CONTENT
```
