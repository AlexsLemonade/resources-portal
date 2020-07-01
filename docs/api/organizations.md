# Organizations
Supports creating, viewing, and updating organizations and their members.

## Create a new organization

**Request**:

`POST` `/organizations/`

Parameters:

Name       | Type         | Required | Description
-----------|--------------|----------|------------
owner      | string       | Yes      | The owner of the organization.
members    | list(string) | Yes      | A list of the IDs of members of the organization.

*Note:*

- Not Authorization Protected

## Get an organization's information

**Request**:

`GET` `/organizations/:id`

*Note:*

- Not Authorization Protected

**Response**:

```json
Content-Type application/json
200 OK

{
    "id": 1,
    "owner": {
        "id": "10000000-0f5a-4165-b518-b2386a753d6f",
        "username": "PrimaryProf",
        "first_name": "Prim",
        "last_name": "Proffer",
        "created_at": "2020-05-08T18:17:39+0000",
        "updated_at": "2020-05-08T18:17:39+0000"
    },
    "members": [
        {
            "id": "10000000-0f5a-4165-b518-b2386a753d6f",
            "username": "PrimaryProf",
            "first_name": "Prim",
            "last_name": "Proffer",
            "created_at": "2020-05-08T18:17:39+0000",
            "updated_at": "2020-05-08T18:17:39+0000"
        }
    ],
    "created_at": "2020-05-08T18:17:39+0000",
    "updated_at": "2020-05-08T18:17:39+0000"
}
```

## Update an organization

**Request**:

`PUT/PATCH` `/organizations/id`

Parameters:

Name       | Type         | Required | Description
-----------|--------------|----------|------------
owner      | string       | Yes      | The owner of the organization.
members    | list(string) | Yes      | A list of the IDs of members of the organization.

*Note:*

- All parameters are optional
- Not Authorization Protected

**Response**:

```json
Content-Type application/json
200 OK

{
    "id": 1,
    "owner": {
        "id": "10000000-0f5a-4165-b518-b2386a753d6f",
        "username": "PrimaryProf",
        "first_name": "Prim",
        "last_name": "Proffer",
        "created_at": "2020-05-08T18:17:39+0000",
        "updated_at": "2020-05-08T18:17:39+0000"
    },
    "members": [
        {
            "id": "10000000-0f5a-4165-b518-b2386a753d6f",
            "username": "PrimaryProf",
            "first_name": "Prim",
            "last_name": "Proffer",
            "created_at": "2020-05-08T18:17:39+0000",
            "updated_at": "2020-05-08T18:17:39+0000"
        },
        {
            "id": "20000000-a55d-42b7-b53e-056956e18b8c",
            "username": "PostDoc",
            "first_name": "Postsworth",
            "last_name": "Doktor",
            "created_at": "2020-05-08T18:17:39+0000",
            "updated_at": "2020-05-08T18:17:39+0000"
        }
    ],
    "created_at": "2020-05-08T18:17:39+0000",
    "updated_at": "2020-05-08T18:17:39+0000"
}
```
