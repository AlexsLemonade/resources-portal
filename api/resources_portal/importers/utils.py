import xml.etree.ElementTree as ET

import requests
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry

PUBMED_METADATA_URL_TEMPLATE = (
    "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id={}"
)


def requests_retry_session(
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


def get_pubmed_publication_title(pubmed_id):
    formatted_metadata_URL = PUBMED_METADATA_URL_TEMPLATE.format(pubmed_id)
    response = requests_retry_session().get(formatted_metadata_URL)
    pubmed_xml = ET.fromstring(response.text)[0]

    for child in pubmed_xml:
        if "Name" in child.attrib and child.attrib["Name"] == "Title":
            return child.text
