# Import SRA
Allows users to import an SRA material by providing the accession code of a particular read of an experiment. This endpoint will populate all possible fields on the material with information from the European Nucleotide Archive database.

## Import an SRA material:

**Request**:

`POST` `/materials/import/`

Parameters:

Name                           | Type   | Description
-------------------------------|--------|---
import_type                    | string | The type of resource being imported. Options include: ["SRA"].
run_accession                  | int    | The accession code for the run represeting the SRA material, in the form "SRR123456".
organization_id                | int    | The ID of the organization that this material will be owned by.
grant_id                       | int    | The ID of the grant that this material will be associated with.

*Note:*

- All paramaters are required.
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
      "platform":"Illumina HiSeq 2500"
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
