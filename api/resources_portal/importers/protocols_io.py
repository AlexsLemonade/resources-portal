from html.parser import HTMLParser

from resources_portal.importers.utils import requests_retry_session

PROTOCOL_IO_API_TEMPLATE = "https://www.protocols.io/api/v3/protocols/{doi_suffix}"

PROTOCOL_IO_VIEW_TEMPLATE = "https://www.protocols.io/view/{protocol_uri}"


class ProtocolNotFoundError(Exception):
    pass


class HTMLDataParser(HTMLParser):
    def __init__(self):
        HTMLParser.__init__(self)
        self.data = ""

    def handle_data(self, data):
        self.data += data


def extract_doi_suffix(protocol_doi):
    """
    DOIs come in a format like 'dx.doi.org/10.17504/protocols.io.bazhif36'.
    We just need the 'protocols.io.bazhif36' element to form our query url.
    """
    return protocol_doi.split("/")[2]


def gather_all_metadata(protocol_doi):
    doi_suffix = extract_doi_suffix(protocol_doi)
    formatted_metadata_URL = PROTOCOL_IO_API_TEMPLATE.format(doi_suffix=doi_suffix)
    response = requests_retry_session().get(formatted_metadata_URL)

    if "protocol" in response.json():
        protocol_json = response.json()["protocol"]
    else:
        raise ProtocolNotFoundError

    html_parser = HTMLDataParser()
    html_parser.feed(protocol_json["description"])
    description = html_parser.data

    metadata = {
        "protocol_name": protocol_json["title"],
        "description": description,
        "url": PROTOCOL_IO_VIEW_TEMPLATE.format(protocol_uri=protocol_json["uri"]),
    }

    return metadata
