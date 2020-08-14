import GEOparse

from resources_portal.importers.utils import get_pubmed_publication_title

GEO_URL_TEMPLATE = "https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc={accession_code}"


def get_temp_path(accession_code):
    return "/tmp/" + accession_code + "/"


def gather_all_metadata(experiment_accession_code):
    gse = GEOparse.get_GEO(
        experiment_accession_code,
        destdir=get_temp_path(experiment_accession_code),
        how="brief",
        silent=True,
    )

    metadata = {
        "title": gse.metadata["title"],
        "description": "".join(gse.metadata["summary"]),
        "platform": gse.metadata["platform_id"],
        "technology": gse.metadata["type"],
        "number_samples": len(gse.metadata["sample_id"]),
    }

    if "pubmed_id" in gse.metadata:
        metadata["pubmed_id"] = gse.metadata["pubmed_id"]
        metadata["publication_title"] = get_pubmed_publication_title(metadata["pubmed_id"])

    organisms = set()
    for sample_accession_code, sample in gse.gsms.items():
        organisms.add(sample.metadata["organism_ch1"][0].replace(" ", "_").upper())

    metadata["organism_names"] = list(organisms)
    metadata["url"] = GEO_URL_TEMPLATE.format(accession_code=experiment_accession_code)

    return metadata
