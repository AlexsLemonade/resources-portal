# Addresses
Supports adding, viewing, and updating addresses. The route is nested under `/user/`.

## Description
The Address object represents addresses for users.

## Create a new address

**Request**:

`POST` `/users/:user-id/addresses/`

Parameters:

Name             | Type   | Description
-----------------|--------|---
name             | string | The name that items should be addressed to.
institution      | string | The name of the associated institution.
address_line_1   | string | The street address.
address_line_2   | string | The apt/floor/suite number.
locality         | string | The town/village/city.
state            | string | The state/province
country          | string | The country or country code
postal_code      | string | The postal code.
saved_for_reuse  | bool   | Whether or not the address should be able to be reused.


*Note:*

- **[Authorization Protected](authentication.md)**

**Response**:

```json
Content-Type application/json
200 OK

{
   "address_line_1": "11 Ranch Lane",
   "address_line_2": "Suite 3000",
   "country": "US",
   "id": 4,
   "institution": "Ranch Labs Inc.",
   "locality": "Ranchville",
   "name": "My Lab"s Address",
   "postal_code": "12345",
   "saved_for_reuse": True,
   "state": "Pennsylvania",
   "user": "3f8b7a1a-adc8-4fa1-b015-814a9a4b5357"
}
```

## Get information on a address

**Request**:

`GET` `/users/:user-id/addresses/:id`

*Note:*

- **[Authorization Protected](authentication.md)**
- Only the owner of an address can get its information.

**Response**:

```json
Content-Type application/json
200 OK


{
   "address_line_1": "11 Ranch Lane",
   "address_line_2": "Suite 3000",
   "country": "US",
   "id": 4,
   "institution": "Ranch Labs Inc.",
   "locality": "Ranchville",
   "name": "My Lab"s Address",
   "postal_code": "12345",
   "saved_for_reuse": true,
   "state": "Pennsylvania",
   "user": {
         "id":"3f8b7a1a-adc8-4fa1-b015-814a9a4b5357",
         "username":"testuser96",
         "first_name":"Shane",
         "last_name":"Cain",
         "created_at":"2020-05-11T13:47:53+0000",
         "updated_at":"2020-05-11T13:47:53+0000"
   }
}
```

## Update a address

**Request**:

`PUT/PATCH` `/users/:user-id/addresses/:id`

Parameters:


Name             | Type   | Description
-----------------|--------|---
name             | string | The name that items should be addressed to.
institution      | string | The name of the associated institution.
address_line_1   | string | The street address.
address_line_2   | string | The apt/floor/suite number.
locality         | string | The town/village/city.
state            | string | The state/province
country          | string | The country or country code
postal_code      | string | The postal code.
saved_for_reuse  | bool   | Whether or not the address should be able to be reused.

*Note:*

- All parameters are optional
- **[Authorization Protected](authentication.md)**
- Only the owner of an address can update it.

**Response**:

```json
Content-Type application/json
200 OK

{
   "address_line_1": "11 Ranch Lane",
   "address_line_2": "Suite 3000",
   "country": "US",
   "id": 4,
   "institution": "Ranch Labs Inc.",
   "locality": "Ranchville",
   "name": "My Lab"s Address",
   "postal_code": "12345",
   "saved_for_reuse": True,
   "state": "Pennsylvania",
   "user": {
         "id":"3f8b7a1a-adc8-4fa1-b015-814a9a4b5357",
         "username":"testuser96",
         "first_name":"Shane",
         "last_name":"Cain",
         "created_at":"2020-05-11T13:47:53+0000",
         "updated_at":"2020-05-11T13:47:53+0000"
   }
}
```
