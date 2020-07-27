import xml.etree.ElementTree as ET
from typing import Dict

from resources_portal.importers.utils import get_pubmed_publication_title, requests_retry_session

ENA_URL_TEMPLATE = "https://www.ebi.ac.uk/ena/data/view/{}"

ENA_METADATA_URL_TEMPLATE = "https://www.ebi.ac.uk/ena/data/view/{}&display=xml"


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

    # SRA contains several types of data. We only want RNA-Seq for now.
    if metadata["library_strategy"] != "RNA-Seq":
        raise UnsupportedDataTypeError("library_strategy not RNA-Seq.")
    if metadata["library_source"] not in ["TRANSCRIPTOMIC", "OTHER"]:
        raise UnsupportedDataTypeError(
            "library_source: " + metadata["library_source"] + " not TRANSCRIPTOMIC or OTHER."
        )


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


def _gather_study_metadata(study_accession: str) -> None:
    formatted_metadata_URL = ENA_METADATA_URL_TEMPLATE.format(study_accession)
    response = requests_retry_session().get(formatted_metadata_URL)
    study_xml = ET.fromstring(response.text)

    discoverable_accessions = [
        "sample_accession",
        "submission_accession",
        "experiment_accession",
        "run_accession",
    ]

    metadata = {}

    metadata["study_accession"] = study_accession

    study = study_xml[0]
    for child in study:
        if child.tag == "DESCRIPTOR":
            for grandchild in child:
                if grandchild.tag == "STUDY_TITLE" or grandchild.tag == "STUDY_ABSTRACT":
                    metadata[grandchild.tag.lower()] = grandchild.text
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
    formatted_metadata_URL = ENA_METADATA_URL_TEMPLATE.format(metadata["experiment_accession"])
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


def gather_all_metadata(study_accession):
    metadata = _gather_study_metadata(study_accession)

    if metadata != {}:
        _gather_experiment_metadata(metadata)
        _gather_sample_metadata(metadata)

        metadata["num_samples"] = _get_number_of_samples(metadata["run_accession"])

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