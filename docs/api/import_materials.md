# Import Material
Allows users to import a material by providing an external source to pull information from. This endpoint will populate all possible fields on the material with information from the given source.

## Import a Dataset:

**Request**:

`POST` `/materials/import/`

Parameters:

Name                           | Type   | Description
-------------------------------|--------|---
import_type                    | string | The type of resource being imported. Options include: ["SRA", "GEO", "PROTOCOLS_IO"].
accession                      | int    | The accession code for the study representing the material, in the form "SRP123456" for SRA or "GSE123456" for GEO.
organization_id                | int    | The ID of the organization that this material will be owned by.
grant_id                       | int    | The ID of the grant that this material will be associated with.

*Note:*

- To import a material from SRA or GEO, set "import_type" to the corresponding value.
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

## Import a Protocol:

**Request**:

`POST` `/materials/import/`

Parameters:

Name                           | Type   | Description
-------------------------------|--------|---
import_type                    | string | The type of resource being imported. Options include: ["SRA", "GEO", "PROTOCOLS_IO"].
protocol_doi                   | int    | The DOI of the protocol in question. This can be taken from a protocol's page on protocols.io, and is in the form "dx.doi.org/10.17504/protocols.io.c4gytv"
organization_id                | int    | The ID of the organization that this material will be owned by.
grant_id                       | int    | The ID of the grant that this material will be associated with.

*Note:*

- To import a protocols.io material, ```import_type``` must be set to "PROTOCOLS_IO".
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
   "import_source":"PROTOCOLS_IO",
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
