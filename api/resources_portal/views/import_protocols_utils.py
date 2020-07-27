from json import loads

from resources_portal.views.import_materials import _requests_retry_session

PROTOCOLS_IO_URL_TEMPLATE = "https://www.protocols.io/api/v3/protocols/{}"


def gather_all_protocols_metadata(protocol_id):
    formatted_metadata_URL = PROTOCOLS_IO_URL_TEMPLATE.format(protocol_id)
    response = _requests_retry_session().get(formatted_metadata_URL)

    protocol_json = loads(response.text)

    import pdb

    pdb.set_trace()

    i = 1
