# Search
Supports searching, filtering, and sorting materials, users, and organizations.

## Search Options

### Searching

Searches can be performed by adding ```?:search_parameter``` onto the search request. Searches can be performed on any text-based field of a object. For example, to search for a material titled "Melanoma Reduction Plasmid", your request would be:
```search/materials?search=Melanoma%20Reduction%20Plasmid```

### Filtering

Filtering can narrow down your search results. To filter, specify the name of your filterable field and a value to filter on. For example, to filter your search to dataset materials only, your request would be:
```search/materials?category=DATASET```
A list of all filterable fields for a given search will be returned with the search results, under the "facets" field, in the following format:
```json
"facets": {
    "has_publication": {
        "1": 15,
        "0": 2
    },
    "category": {
        "DATASET": 4,
        "MODEL_ORGANISM": 4,
        "CELL_LINE": 2,
        "OTHER": 2,
        "PLASMID": 2,
        "PROTOCOL": 2,
        "PDX": 1
    },
    "contact_user.published_name": {
        "Dr. Prim Proffer": 9,
        "Dr. Postsworth Doktor": 6,
        "Dr. Secundus Profarius": 2
    }
}
```
Note that only Materials are filterable.

### Ordering

Ordering can be performed on the ```created_at``` and ```updated_at``` fields of any object, as well as the following fields:

Material: "title", "category"

Organization: "name"

To order your results by title, the request would be:
```search/materials?ordering=title```
By default fields are ordered by their relevance to the search.

### Multiple Constraints

Any or all of these requests can be combined. For example, to search for "zebrafish", filter on cell lines, and order by title, your request would be:
```search/materials?search=zebrafish&category=CELL_LINE&ordering=title```

## Performing a Search on Materials
The search endpoint will return materials matching the search. Additional information on the results returned will be availible in the "facets" attribute.

**Request**:

`GET` `search/materials?search=<search_param>&filter=<filter_param>&ordering=<ordering_param>`

*Note:*

- Attributes of ```additonal_metadata``` will vary from material to material.
- All parameters are optional

**Response**:

```json
Content-Type application/json
200 OK
{
    "facets": {
        "has_publication": {
            "1": 15,
            "0": 2
        },
        "contact_user.published_name": {
            "Dr. Prim Proffer": 9,
            "Dr. Postsworth Doktor": 6,
            "Dr. Secundus Profarius": 2
        }
    },
    "results": [
        {
            "id": 10,
            "category": "DATASET",
            "title": "Imported SRA Dataset",
            "url": "https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE37165",
            "pubmed_id": "32223680",
            "created_at": "2020-05-08T15:23:20.139476+00:00",
            "updated_at": "2020-05-08T15:23:20.139490+00:00",
            "organisms": [],
            "has_publication": true,
            "has_pre_print": true,
            "additional_info": "This paper was co-authored by Postworth Docktor.",
            "needs_mta": false,
            "needs_irb": false,
            "publication_title": "Data collected from genetically modified zebrafish",
            "pre_print_doi": "10.1109/5.771073",
            "pre_print_title": "Proposal for Data Collection from Zebrafish",
            "embargo_date": "2020-01-30",
            "contact_user": {
                "first_name": "Prim",
                "last_name": "Proffer",
                "published_name": "Dr. Prim Proffer",
                "email": "pprof@havard.edu"
            },
            "shipping_requirements": {
                "needs_shipping_address": true,
                "needs_payment": true,
                "accepts_shipping_code": true,
                "accepts_reimbursement": false,
                "accepts_other_payment_methods": false,
                "restrictions": "Only ships within the greater Hanover area.",
                "created_at": "2020-05-08T15:23:19.294852+00:00",
                "updated_at": "2020-05-08T15:23:19.294868+00:00"
            },
            "organization": {
                "name": "PrimaryLab",
                "id": 1
            },
            "mta_attachment": {},
            "additional_metadata": {
                "embargo_date": "2020-01-30",
                "title": "GEO Zebrafish Analysis",
                "description": "This dataset has interesting implications for future research.",
                "number_samples": "15",
            },
            "imported": true,
            "import_source": "SRA"
        }
    ]
}
...
```

## Performing a Search on Organizations

The search endpoint will return organizations matching the search.

**Request**:

`GET` `search/organizations?search=<search_param>&ordering=<ordering_param>`

*Note:*

- All parameters are optional

**Response**:

```json
Content-Type application/json
200 OK
{
    "results": [
        {
            "id": 1,
            "name": "PrimaryLab",
            "owner": {
                "first_name": "Prim",
                "last_name": "Proffer",
                "published_name": "Dr. Prim Proffer",
                "email": "pprof@havard.edu"
            },
            "created_at": "2020-05-08T15:23:19.307520+00:00",
            "updated_at": "2020-05-08T15:23:19.307533+00:00"
        }
    ]
}
```

## Performing a Search on Users

The search endpoint will return users matching the search.

**Request**:

`GET` `search/users?search=<search_param>&ordering=<ordering_param>`

*Note:*

- All parameters are optional

**Response**:

```json
Content-Type application/json
200 OK
{
    "results": [
        {
            "id": "4c7f0122-3064-402e-b7db-2f7e94403a01",
            "first_name": "",
            "last_name": "",
            "published_name": "",
            "created_at": "2020-05-08T15:21:22.040058+00:00",
            "updated_at": "2020-05-08T15:21:22.040077+00:00"
        }
    ]
}
```
