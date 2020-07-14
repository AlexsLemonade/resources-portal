# Materials
Supports creating, viewing, and updating materials.

## Description
Materials are used to represent any transferrable piece of research listed on the site. They contain metadata about the information or scientific resource which they represent.

## Add a new material

**Request**:

`POST` `/materials/`

Parameters:

Name                     | Type      | Description
-------------------------|-----------|---
category                 | string    | The category of material.
url                      | string    | The URL that the material was imported from.
pubmed_id                | string    | The PubMed ID of the associated publication.
additional_metadata      | json      | Additional details about the material in JSON format.
title                    | string    | The title of the material.
needs_mta                | boolean   | Boolean specifying whether the material needs a Material Transfer Agreement to be transferred.
needs_irb                | boolean   | Boolean specifying whether the material needs an IRB document to be transferred.
needs_abstract           | boolean   | Boolean specifying whether the material needs a research abstract to be transferred.
imported                 | boolean   | Boolean specifying whether the material was imported.
import_source            | string    | String specifying the import source.
organism                 | string[]  | The organism that the material is associated with. Nullable.
publication_title        | string    | The title of the associated publication. Nullable.
pre_print_doi            | string    | The DOI of the associated pre-print document. Nullable.
pre_print_title          | string    | The title of the associated pre-print document. Nullable.
citation                 | string    | The citation to be used for the material or its publication. Nullable.
additional_info          | string    | Any additional description of the material or it's publication. Nullable.
embargo_date             | date      | The date that embargo will be lifted for this material. Nullable.
contact_user_id          | string    | The ID of the associated user.
mta_attachment_id        | integer   | The ID of the MTA attachment. Nullable.
organization_id          | integer   | The ID of the associated organization.
shipping_requirements_id | integer   | The ID of the shipping requerements. Nullable.

*Note:*

- Not Authorization Protected

## Get a material's information

**Request**:

`GET` `/materials/:id`

*Note:*

- Not Authorization Protected
- Attributes of ```additonal_metadata``` will vary from material to material.

**Response**:

```json
Content-Type application/json
200 OK

{
    "id": 1,
    "category": "CELL_LINE",
    "title": "Zebrafish Cell Line",
    "url": "",
    "organization": 4,
    "pubmed_id": "32223680",
    "additional_metadata": {
        "age": "Four Months",
        "sex": "Male",
        "disease": "Affymetrix Zebrafish Genome Array",
        "cell_type": "Microarray",
        "ethnicity": "N/A",
        "str_profile": "Amelogenin: X Y\nCSF1PO: 11\nD13S317: 8, 14\nD16S539: 9, 11\nD5S818: 11, 13\nD7S820: 10\nTH01: 6, 9.3\nTPOX: 9, 12\nvWA: 16, 17",
        "subculturing": "Methanol",
        "growth_medium": "Ethanol",
        "cell_line_name": "A549",
        "passage_number": "21430780",
        "storage_medium": "Liquid nitrogen vapor phase",
        "biosafety_level": "3",
        "cryopreservation": "Liquid nitrogen",
        "tissue_histology": "Brain Tumor",
        "culture_conditions": "Reproducing at a swift rate",
        "population_doubling_time": "20 Hours",
        "number_availible_cell_lines": "20"
    },
    "contact_user": {
        "id": "30000000-231f-4dc8-bbfa-02bccfb0372c",
        "username": "SecondaryProf",
        "first_name": "Secundus",
        "last_name": "Profarius",
        "created_at": "2020-05-08T18:17:39+0000",
        "updated_at": "2020-05-08T18:17:39+0000"
    },
    "created_at": "2020-05-08T18:17:40+0000",
    "updated_at": "2020-05-08T18:17:40+0000"
}
```

## Update a material

**Request**:

`PUT/PATCH` `/materials/id`

Parameters:

Name                     | Type      | Description
-------------------------|-----------|---
category                 | string    | The category of material.
url                      | string    | The URL that the material was imported from.
pubmed_id                | string    | The PubMed ID of the associated publication.
additional_metadata      | json      | Additional details about the material in JSON format.
title                    | string    | The title of the material.
needs_mta                | boolean   | Boolean specifying whether the material needs a Material Transfer Agreement to be transferred.
needs_irb                | boolean   | Boolean specifying whether the material needs an IRB document to be transferred.
needs_abstract           | boolean   | Boolean specifying whether the material needs a research abstract to be transferred.
imported                 | boolean   | Boolean specifying whether the material was imported.
import_source            | string    | String specifying the import source.
organism                 | string[]  | The organism that the material is associated with. Nullable.
publication_title        | string    | The title of the associated publication. Nullable.
pre_print_doi            | string    | The DOI of the associated pre-print document. Nullable.
pre_print_title          | string    | The title of the associated pre-print document. Nullable.
citation                 | string    | The citation to be used for the material or its publication. Nullable.
additional_info          | string    | Any additional description of the material or it's publication. Nullable.
embargo_date             | date      | The date that embargo will be lifted for this material. Nullable.
contact_user_id          | string    | The ID of the associated user.
mta_attachment_id        | integer   | The ID of the MTA attachment. Nullable.
organization_id          | integer   | The ID of the associated organization.
shipping_requirements_id | integer   | The ID of the shipping requerements. Nullable.

*Note:*

- All parameters are optional
- Not Authorization Protected

**Response**:

```json
Content-Type application/json
200 OK

{
    "id": 1,
    "category": "MODEL_ORGANISM",
    "title": "Mouse Model Organism",
    "url": "",
    "organization": 1,
    "pubmed_id": "32223680",
    "additional_metadata": {
        "genotype": "TTdDsS",
        "zygosity": "Heterozygous",
        "description": "Investigation of expression differences between skin and melanomas from a house mouse.",
        "strain_name": "Sylvaticus",
        "construct_details": "The dominant gene is represented in this sample.",
        "genetic_background": "TTdDss",
        "number_availible_models": "20"
    },
    "contact_user": {
        "id": "20000000-a55d-42b7-b53e-056956e18b8c",
        "username": "PostDoc",
        "first_name": "Postsworth",
        "last_name": "Doktor",
        "created_at": "2020-05-08T18:17:39+0000",
        "updated_at": "2020-05-08T18:17:39+0000"
    },
    "created_at": "2020-05-08T18:17:40+0000",
    "updated_at": "2020-05-08T18:17:40+0000"
}
```
