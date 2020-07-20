import xml.etree.ElementTree as ET
from typing import Dict

import requests
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry

ENA_URL_TEMPLATE = "https://www.ebi.ac.uk/ena/data/view/{}"

ENA_METADATA_URL_TEMPLATE = "https://www.ebi.ac.uk/ena/data/view/{}&display=xml"

PUBMED_METADATA_URL_TEMPLATE = (
    "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id={}"
)


class UnsupportedDataTypeError(Exception):
    pass


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


def _parse_run_link(run_link: ET.ElementTree) -> (str, str):
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


def _requests_retry_session(
    retries=0, backoff_factor=0.3, status_forcelist=(500, 502, 504), session=None
):
    """
    Exponential back off for requests.

    via https://www.peterbe.com/plog/best-practice-with-retries-with-requests
    """
    session = session or requests.Session()
    retry = Retry(
        total=retries,
        read=retries,
        connect=retries,
        backoff_factor=backoff_factor,
        status_forcelist=status_forcelist,
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    return session


def _gather_run_metadata(run_accession: str) -> Dict:
    """A run refers to a specific read in an experiment."""

    discoverable_accessions = ["study_accession", "sample_accession", "submission_accession"]

    response = _requests_retry_session().get(ENA_METADATA_URL_TEMPLATE.format(run_accession))
    try:
        run_xml = ET.fromstring(response.text)
    except Exception:
        print("Unable to decode response: " + response.text)
        return {}

    # Necessary because ERP000263 has only one ROOT element containing this error:
    # Entry: ERR15562 display type is either not supported or entry is not found.
    if len(run_xml) == 0:
        return {}

    run_item = run_xml[0]

    metadata = {}

    metadata["run_accession"] = run_accession

    for child in run_item:
        if child.tag == "EXPERIMENT_REF":
            metadata["experiment_accession"] = child.attrib["accession"]
        elif child.tag == "RUN_LINKS":
            for grandchild in child:
                key, value = _parse_run_link(grandchild)
                if value != "" and key in discoverable_accessions:
                    metadata[key] = value

    return metadata


def _gather_sample_metadata(metadata: Dict) -> None:
    formatted_metadata_URL = ENA_METADATA_URL_TEMPLATE.format(metadata["sample_accession"])
    response = _requests_retry_session().get(formatted_metadata_URL)
    sample_xml = ET.fromstring(response.text)

    sample = sample_xml[0]

    for child in sample:
        if child.tag == "TITLE":
            metadata["sample_title"] = child.text
        elif child.tag == "SAMPLE_NAME":
            for grandchild in child:
                if grandchild.tag == "SCIENTIFIC_NAME":
                    metadata["organism_name"] = grandchild.text


def _gather_study_metadata(metadata: Dict) -> None:
    formatted_metadata_URL = ENA_METADATA_URL_TEMPLATE.format(metadata["study_accession"])
    response = _requests_retry_session().get(formatted_metadata_URL)
    study_xml = ET.fromstring(response.text)

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


def _gather_experiment_metadata(metadata: Dict) -> None:
    formatted_metadata_URL = ENA_METADATA_URL_TEMPLATE.format(metadata["experiment_accession"])
    response = _requests_retry_session().get(formatted_metadata_URL)
    experiment_xml = ET.fromstring(response.text)

    experiment = experiment_xml[0]
    for child in experiment:
        if child.tag == "DESIGN":
            for grandchild in child:
                if grandchild.tag == "LIBRARY_DESCRIPTOR":
                    _gather_library_metadata(metadata, grandchild)
                    break
        elif child.tag == "PLATFORM":
            # This structure is extraneously nested.
            metadata["platform_instrument_model"] = child[0][0].text


def _gather_pubmed_metadata(metadata: Dict):
    formatted_metadata_URL = PUBMED_METADATA_URL_TEMPLATE.format(metadata["pubmed_id"])
    response = _requests_retry_session().get(formatted_metadata_URL)
    pubmed_xml = ET.fromstring(response.text)[0]

    for child in pubmed_xml:
        if "Name" in child.attrib and child.attrib["Name"] == "Title":
            metadata["publication_title"] = child.text
            return


def gather_all_metadata(run_accession):
    metadata = _gather_run_metadata(run_accession)

    if metadata != {}:
        _gather_experiment_metadata(metadata)
        _gather_sample_metadata(metadata)
        _gather_study_metadata(metadata)
        _gather_pubmed_metadata(metadata)

    return metadata
