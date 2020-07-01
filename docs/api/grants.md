# Grants
Supports adding, viewing, and updating grants. Contains nested routes for associated materials.

## Register a new user account

**Request**:

`POST` `/grants/`

Parameters:

Name       | Type   | Description
-----------|--------|---
title      | string | The title of the grant.
funder_id  | string | Alex's Lemonade Stand Foundation or third-party grant id.

*Note:*

- **[Authorization Protected](authentication.md)**

**Response**:

```json
Content-Type application/json
200 OK

{
   "id":5,
   "title":"Young Investigator's Grant",
   "funder_id":"1234567890",
   "users":[

   ],
   "organizations":[

   ],
   "materials":[

   ],
   "created_at":"2020-05-11T14:13:39+0000",
   "updated_at":"2020-05-11T14:13:39+0000"
}
```

## Get information on a grant

**Request**:

`GET` `/grants/:id`

*Note:*

- **[Authorization Protected](authentication.md)**
- Only the owner of a grant can get its information.

**Response**:

```json
Content-Type application/json
200 OK

{
   "id":8,
   "title":"Young Investigator's Grant",
   "funder_id":"1234567890",
   "users":[
      {
         "id":"3f8b7a1a-adc8-4fa1-b015-814a9a4b5357",
         "username":"testuser96",
         "first_name":"Shane",
         "last_name":"Cain",
         "created_at":"2020-05-11T13:47:53+0000",
         "updated_at":"2020-05-11T13:47:53+0000"
      }
   ],
   "organizations":[
      {
         "id":26,
         "name":"test_organization",
         "owner":"48fe873e-552d-439c-9af6-e5ff639d439a",
         "members":[

         ],
         "created_at":"2020-05-11T13:47:53+0000",
         "updated_at":"2020-05-11T13:47:53+0000"
      }
   ],
   "materials":[
      {
         "id":15,
         "category":"CELL_LINE",
         "title":"HT-29 (ATCC® HTB-38™)",
         "url":"https://www.atcc.org/products/all/HTB-38.aspx",
         "organization":27,
         "pubmed_id":"",
         "additional_metadata":{

         },
         "contact_user":"0bac6249-df34-45e5-9110-d0887e29c789",
         "created_at":"2020-05-11T13:47:53+0000",
         "updated_at":"2020-05-11T13:47:53+0000"
      }
   ],
   "created_at":"2020-05-11T13:47:53+0000",
   "updated_at":"2020-05-11T13:47:54+0000"
}
```

## Update a grant

**Request**:

`PUT/PATCH` `/grants/:id`

Parameters:

Name       | Type   | Description
-----------|--------|---
title      | string | The title of the grant.
funder_id  | string | Alex's Lemonade Stand Foundation or third-party grant id.

*Note:*

- All parameters are optional
- **[Authorization Protected](authentication.md)**
- Only the owner of a grant can update it.

**Response**:

```json
Content-Type application/json
200 OK

{
   "id":10,
   "title":"New Title",
   "funder_id":"YYY-YYY-YYY",
   "users":[
      {
         "id":"c362123d-7526-4fd8-a3b0-6e3fa026125c",
         "username":"testuser118",
         "first_name":"Carl",
         "last_name":"Mckinney",
         "created_at":"2020-05-11T13:55:46+0000",
         "updated_at":"2020-05-11T13:55:46+0000"
      }
   ],
   "organizations":[
      {
         "id":32,
         "name":"test_organization",
         "owner":"fdc5caaa-255c-4e15-be63-1f3fc6e0dfa3",
         "members":[

         ],
         "created_at":"2020-05-11T13:55:46+0000",
         "updated_at":"2020-05-11T13:55:46+0000"
      }
   ],
   "materials":[
      {
         "id":19,
         "category":"CELL_LINE",
         "title":"HT-29 (ATCC® HTB-38™)",
         "url":"https://www.atcc.org/products/all/HTB-38.aspx",
         "organization":33,
         "pubmed_id":"",
         "additional_metadata":{

         },
         "contact_user":"f9ec1129-6303-4cbd-8ef1-cdc454ecc9c9",
         "created_at":"2020-05-11T13:55:46+0000",
         "updated_at":"2020-05-11T13:55:46+0000"
      }
   ],
   "created_at":"2020-05-11T13:55:46+0000",
   "updated_at":"2020-05-11T13:55:46+0000"
}
```

## Get materials associated with a grant

**Request**:

`GET` `/grants/:id/materials`

*Note:*

- **[Authorization Protected](authentication.md)**
- Only the owner of a grant can view the materials.

**Response**:

```json
Content-Type application/json
200 OK

{
    "id":1,
    "category":"CELL_LINE",
    "title":"HT-29 (ATCC® HTB-38™)",
    "url":"https://www.atcc.org/products/all/HTB-38.aspx",
    "organization":50,
    "pubmed_id":"",
    "additional_metadata":{

    },
    "contact_user":"dc849327-f931-427d-9604-28967580c35f",
    "created_at":"2020-05-11T13:36:58+0000",
    "updated_at":"2020-05-11T13:36:58+0000"
}
```

## Add a new grant-material relationship

**Request**:

`POST` `/grants/:id/materials`

Parameters:

Name       | Type   | Description
-----------|--------|---
material_id| string | The ID of the material to associate with the grant.

*Note:*

- **[Authorization Protected](authentication.md)**
- Only the owner of both the grant and material can add this relationship.
