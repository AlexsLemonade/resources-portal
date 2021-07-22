import re
import xml.etree.ElementTree as ET
from typing import Dict

from resources_portal.importers.utils import get_pubmed_publication_title, requests_retry_session

ENA_URL_TEMPLATE = "https://www.ebi.ac.uk/ena/browser/view/{}"
ENA_METADATA_URL_TEMPLATE = "https://www.ebi.ac.uk/ena/browser/api/xml/{}"


class UnsupportedDataTypeError(Exception):
    pass


def _get_number_of_samples(srr_string):
    """
    SRR accession codes are provided in the following format:
    "SRR000001, SRR000002, SRR000003-SRR000008"
    You can count the non-consecutive elements, but the ranges must be parsed.
    """

    num_samples = 0

    srr_list = srr_string.split(",")

    for srr in srr_list:
        srr = srr.replace("SRR", "")
        if "-" in srr:
            srr_range = srr.split("-")
            num_samples += int(srr_range[1]) - int(srr_range[0]) + 1
        else:
            num_samples += 1

    return num_samples


def _gather_library_metadata(metadata: Dict, library: ET.Element) -> None:
    for child in library:
        if child.tag == "LIBRARY_LAYOUT":
            metadata["library_layout"] = child[0].tag
        else:
            metadata[child.tag.lower()] = child.text


def _parse_study_link(run_link: ET.ElementTree) -> (str, str):
    key = ""
    value = ""

    # The first level in this element is a XREF_LINK which is
    # really just an unnecessary level
    for child in run_link[0]:
        if child.tag == "DB":
            # The key is prefixed with "ena-" which is unnecessary
            # since we know this is coming from ENA
            key = child.text.lower().replace("ena-", "") + "_accession"
        elif child.tag == "ID":
            value = child.text

    return (key, value)


def _gather_sample_metadata(metadata: Dict) -> None:
    formatted_metadata_URL = ENA_METADATA_URL_TEMPLATE.format(metadata["sample_accession"])
    response = requests_retry_session().get(formatted_metadata_URL)
    sample_xml = ET.fromstring(response.text)

    sample = sample_xml[0]

    organism_names = set()
    for child in sample:
        if child.tag == "TITLE":
            metadata["sample_title"] = child.text
        elif child.tag == "SAMPLE_NAME":
            for grandchild in child:
                if grandchild.tag == "SCIENTIFIC_NAME":
                    organism_names.add(grandchild.text.replace(" ", "_").upper())

    metadata["organism_names"] = list(organism_names)


def _gather_study_metadata(accession_code: str) -> None:
    formatted_metadata_URL = ENA_METADATA_URL_TEMPLATE.format(accession_code)
    response = requests_retry_session().get(formatted_metadata_URL)
    study_xml = ET.fromstring(response.text)

    discoverable_accessions = [
        "sample_accession",
        "submission_accession",
        "experiment_accession",
        "run_accession",
    ]

    metadata = {}

    metadata["accession_code"] = accession_code

    study = study_xml[0]
    for child in study:
        if child.tag == "DESCRIPTOR":
            for grandchild in child:
                if grandchild.tag == "STUDY_TITLE":
                    metadata["study_title"] = grandchild.text

                if grandchild.tag == "STUDY_DESCRIPTION" or grandchild.tag == "STUDY_ABSTRACT":
                    metadata["study_abstract"] = grandchild.text
        elif child.tag == "STUDY_LINKS":
            for grandchild in child:
                for ggc in grandchild:
                    if ggc.getchildren()[0].text == "pubmed":
                        metadata["pubmed_id"] = ggc.getchildren()[1].text
                        break
                key, value = _parse_study_link(grandchild)
                if value != "" and key in discoverable_accessions:
                    metadata[key] = value

    return metadata


def _gather_experiment_metadata(metadata: Dict) -> None:
    # We only need one accession.
    first_accession = re.match(r"SRX\d+", metadata["experiment_accession"]).group()

    formatted_metadata_URL = ENA_METADATA_URL_TEMPLATE.format(first_accession)
    response = requests_retry_session().get(formatted_metadata_URL)
    experiment_xml = ET.fromstring(response.text)
    experiment = experiment_xml[0]
    for child in experiment:
        if child.tag == "DESIGN":
            for grandchild in child:
                if grandchild.tag == "LIBRARY_DESCRIPTOR":
                    _gather_library_metadata(metadata, grandchild)
                if grandchild.tag == "DESIGN_DESCRIPTION":
                    metadata["experiment_design_description"] = grandchild.text
        elif child.tag == "PLATFORM":
            # This structure is extraneously nested.
            metadata["platform_instrument_model"] = child[0][0].text


def _gather_pubmed_metadata(metadata: Dict):
    pubmed_title = get_pubmed_publication_title(metadata["pubmed_id"])
    if pubmed_title:
        metadata["publication_title"] = pubmed_title


def get_SRP_from_PRJNA(accession_code):
    formatted_metadata_URL = ENA_METADATA_URL_TEMPLATE.format(accession_code)
    response = requests_retry_session().get(formatted_metadata_URL)
    experiment_xml = ET.fromstring(response.text)

    for child in experiment_xml:
        if child.tag != "PROJECT":
            continue

        for grandchild in child:
            if grandchild.tag != "IDENTIFIERS":
                continue

            for identifier in grandchild:
                if identifier.tag == "SECONDARY_ID":
                    return identifier.text


def get_SRP_from_SRR(accession_code):
    formatted_metadata_URL = ENA_METADATA_URL_TEMPLATE.format(accession_code)
    response = requests_retry_session().get(formatted_metadata_URL)
    experiment_xml = ET.fromstring(response.text)

    for run in experiment_xml:
        for child in run:
            if child.tag != "RUN_LINKS":
                continue

            for grandchild in child:
                if grandchild.tag != "RUN_LINK":
                    continue

                for xref_link in grandchild:
                    if xref_link.tag != "XREF_LINK":
                        continue

                    for link_item in xref_link:
                        if link_item.tag == "ID" and link_item.text.startswith("SRP"):
                            return link_item.text


def gather_all_metadata(accession_code):
    # If we've been given a URL instead of an accession code the
    # accession code will be trailing the URL. Trailing '/'s break the
    # URL so we don't have to worry about them.
    if accession_code.lower().startswith("https://www.ebi.ac.uk"):
        accession_code = accession_code.split("/")[-1]
    elif accession_code.lower().startswith("https://trace.ncbi.nlm.nih.gov/"):
        accession_code = accession_code.split("=")[-1]

    if accession_code.upper().startswith("PRJNA"):
        accession_code = get_SRP_from_PRJNA(accession_code)
    elif accession_code.upper().startswith("SRR"):
        accession_code = get_SRP_from_SRR(accession_code)

    # We failed to convert the accession code.
    if not accession_code:
        return {}

    metadata = _gather_study_metadata(accession_code)

    if metadata != {}:
        _gather_experiment_metadata(metadata)
        _gather_sample_metadata(metadata)

        metadata["number_of_samples"] = _get_number_of_samples(metadata["run_accession"])

        if "pubmed_id" in metadata.keys():
            _gather_pubmed_metadata(metadata)

    # Make sure the specific fields that are needed are present with
    # the expected keys.
    metadata["url"] = ENA_URL_TEMPLATE.format(metadata["submission_accession"])
    metadata["description"] = metadata["study_abstract"]
    metadata["platform"] = metadata["platform_instrument_model"]
    metadata["technology"] = metadata["library_strategy"]
    metadata["title"] = metadata["study_title"]

    return metadata
