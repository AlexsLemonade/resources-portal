import GEOparse

from resources_portal.importers.utils import get_pubmed_publication_title

GEO_URL_TEMPLATE = "https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc={accession_code}"


def get_temp_path(accession_code):
    return "/tmp/" + accession_code + "/"


def get_GSE_from_GSM(accession_code):
    gsm = GEOparse.get_GEO(
        accession_code,
        destdir=get_temp_path(accession_code),
        silent=True,
    )

    if "series_id" in gsm.metadata:
        return gsm.metadata["series_id"][0]


def gather_all_metadata(accession_code):
    if accession_code.lower().startswith("https://www.ncbi.nlm.nih.gov/geo"):
        accession_code = accession_code.split("=")[-1]

    if accession_code.upper().startswith("GSM"):
        accession_code = get_GSE_from_GSM(accession_code)

    if not accession_code:
        # We failed to find an experiment accession code.
        return {}

    gse = GEOparse.get_GEO(
        accession_code,
        destdir=get_temp_path(accession_code),
        silent=True,
    )

    # Sometimes title or pubmed_id is a list for some reason.
    title = (
        gse.metadata["title"][0] if type(gse.metadata["title"]) is list else gse.metadata["title"]
    )
    metadata = {
        "accession_code": accession_code,
        "title": title,
        "description": "".join(gse.metadata["summary"]),
        "platform": gse.metadata["platform_id"],
        "technology": gse.metadata["type"],
        "number_of_samples": len(gse.metadata["sample_id"]),
    }

    if "pubmed_id" in gse.metadata:
        if type(gse.metadata["pubmed_id"]) is list:
            pubmed_id = gse.metadata["pubmed_id"][0]
        else:
            pubmed_id = gse.metadata["pubmed_id"]

        metadata["pubmed_id"] = pubmed_id
        metadata["publication_title"] = get_pubmed_publication_title(metadata["pubmed_id"])

    organisms = set()
    for sample_accession_code, sample in gse.gsms.items():
        organisms.add(sample.metadata["organism_ch1"][0].replace(" ", "_").upper())

    metadata["organism_names"] = list(organisms)
    metadata["url"] = GEO_URL_TEMPLATE.format(accession_code=accession_code)

    return metadata
