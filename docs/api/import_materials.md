# Import Material
Allows users to import a material by providing an external source to pull information from. This endpoint will populate all possible fields on the material with information from the given source.

## Import an SRA material:

**Request**:

`POST` `/materials/import/`

Parameters:

Name                           | Type   | Description
-------------------------------|--------|---
import_type                    | string | The type of resource being imported. Options include: ["SRA", "GEO", "PROTOCOLS.IO"].
study_accession                | int    | The accession code for the study represeting the SRP material, in the form "SRP123456".
organization_id                | int    | The ID of the organization that this material will be owned by.
grant_id                       | int    | The ID of the grant that this material will be associated with.

*Note:*

- To import an SRA material, ```import_type``` must be set to "SRA".
- All parameters are required.
- **[Authorization Protected](authentication.md)**
- The user making the request must own the given grant and be a part of the given organization.

**Response**:

```json
Content-Type application/json
200 OK

{
   "id":3,
   "category":"DATASET",
   "url":"https://www.ebi.ac.uk/ena/data/view/SRA464955",
   "pubmed_id":"28085667",
   "additional_metadata":{
      "study_id":"SRA464955",
      "description":"Tails of the GFP positive embryos were amputated. Tails were placed on ice for 30min before tissue disociation. GFP positive cells were sorted by FACS. RNA was harvested from GFP positive cells using Trizol reagent. Illumina TruSeq RNA Sample Prep Kit (Cat#RS-122-2302) was used with 13 ng of total RNA for the construction of sequencing libraries. RNA libraries were prepared for sequencing using standard Illumina protocols.",
      "platform":"Illumina HiSeq 2500",
      "technology":"Rna-Seq",
      "num_samples":9
   },
   "mta_attachment":"None",
   "title":"Proliferation-independent regulation of organ size by Notch signaling",
   "needs_irb":false,
   "needs_abstract":false,
   "imported":true,
   "shipping_requirements":"None",
   "import_source":"SRA",
   "contact_user":"c308f9ed-20d2-4be9-8e5f-0c33e60f0689",
   "organization":1,
   "organism":[
      "Danio rerio"
   ],
   "publication_title":"Proliferation-independent regulation of organ size by Fgf/Notch signaling.",
   "pre_print_doi":"None",
   "pre_print_title":"None",
   "citation":"None",
   "additional_info":"None",
   "embargo_date":"None",
   "grants":[
      1
   ]
}
```

## Import a GEO material:

**Request**:

`POST` `/materials/import/`

Parameters:

Name                           | Type   | Description
-------------------------------|--------|---
import_type                    | string | The type of resource being imported. Options include: ["SRA", "GEO", "PROTOCOLS.IO"].
study_accession                | int    | The accession code for the study represeting the SRP material, in the form "SRP123456".
organization_id                | int    | The ID of the organization that this material will be owned by.
grant_id                       | int    | The ID of the grant that this material will be associated with.

*Note:*

- To import a GEO material, ```import_type``` must be set to "GEO".
- All parameters are required.
- **[Authorization Protected](authentication.md)**
- The user making the request must own the given grant and be a part of the given organization.


**Response**:

```json
Content-Type application/json
200 OK

{
   "id":9,
   "category":"DATASET",
   "url":"https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE24528",
   "pubmed_id":[
      "21430780"
   ],
   "additional_metadata":{
      "study_id":"GSE24528",
      "description":"Investigation of expression differences between skin and melanomas from a transgenic BRAFV600E zebrafish model of melanomaThe embryos described in this study are further analyzed in a manuscript submitted for publication by White, et al.",
      "platform":[
         "GPL1319"
      ],
      "technology":[
         "Expression profiling by array"
      ],
      "num_samples":15
   },
   "mta_attachment":"None",
   "title":[
      "Expression analysis of zebrafish melanoma and skin from the mitf-BRAFV600E;p53-/- line"
   ],
   "needs_irb":false,
   "needs_abstract":false,
   "imported":true,
   "shipping_requirements":"None",
   "import_source":"GEO",
   "contact_user":"3e9aaef0-7b49-48c4-9f39-191ce7ab5aec",
   "organization":16,
   "organisms":[
      "DANIO_RERIO"
   ],
   "publication_title":"None",
   "pre_print_doi":"None",
   "pre_print_title":"None",
   "citation":"None",
   "additional_info":"None",
   "embargo_date":"None",
   "is_archived":false,
   "grants":[
      4
   ]
}
```

## Import a protocols.io material:

**Request**:

`POST` `/materials/import/`

Parameters:

Name                           | Type   | Description
-------------------------------|--------|---
import_type                    | string | The type of resource being imported. Options include: ["SRA", "GEO", "PROTOCOLS.IO"].
study_accession                | int    | The accession code for the study represeting the SRP material, in the form "SRP123456".
organization_id                | int    | The ID of the organization that this material will be owned by.
grant_id                       | int    | The ID of the grant that this material will be associated with.

*Note:*

- To import a protocols.io material, ```import_type``` must be set to "PROTOCOLS.IO".
- All parameters are required.
- **[Authorization Protected](authentication.md)**
- The user making the request must own the given grant and be a part of the given organization.


**Response**:

```json
Content-Type application/json
200 OK

{
   "id":9,
   "category":"PROTOCOL",
   "url":"https://www.protocols.io/view/lysis-buffer-20-ml-c4gytv",
   "pubmed_id":"",
   "additional_metadata":{
      "protocol_name":"Lysis Buffer (20 mL)",
      "abstract":"Must be made fresh before experiment because of the Sucrose. For 20 mL solutions."
   },
   "mta_attachment":"None",
   "title":"Lysis Buffer (20 mL)",
   "needs_irb":false,
   "needs_abstract":false,
   "imported":true,
   "shipping_requirements":"None",
   "import_source":"PROTOCOLS.IO",
   "contact_user":"2fb65e45-bdee-49e3-b30e-9b7edfad5a97",
   "organization":16,
   "organisms":"None",
   "publication_title":"None",
   "pre_print_doi":"None",
   "pre_print_title":"None",
   "citation":"None",
   "additional_info":"None",
   "embargo_date":"None",
   "is_archived":false,
   "grants":[
      4
   ]
}
```
