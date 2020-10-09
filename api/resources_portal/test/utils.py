import copy
import os
import shutil
import uuid

from django.conf import settings

from faker import Faker

fake = Faker()

MOCK_AUTHORIZATION_CODE = "mock"
MOCK_EMAIL = fake.email()
MOCK_ORIGIN_URL = "http://an-origin-url"
MOCK_GRANTS = [{"title": "Grant1", "funder_id": "12345"}, {"title": "Grant2", "funder_id": "56789"}]

first_name = fake.first_name()
last_name = fake.last_name()

ORCID_AUTHORIZATION_DICT = {
    "name": f"{first_name} {last_name}",
    "orcid": "ORCID",
    "access_token": "ACCESS_TOKEN",
    "refresh_token": "REFRESH_TOKEN",
}

ORCID_SUMMARY_DICT = {
    "person": {
        "name": {"given-names": {"value": first_name}, "family-name": {"value": last_name}},
        "emails": {"email": [{"email": "email@email.com"}]},
    },
    "orcid-identifier": {"path": "ORCID"},
}

MOCK_DATASET_DATA = {
    "description": "Array of tea sandwiches",
    "platform": "Amazon Tabletop",
    "technology": "Toaster",
    "title": "Data on tea sandwiches",
    "url": "www.teasandwiches.com",
    "number_of_samples": "3",
    "organism_names": ["Mus Musculus"],
}

MOCK_PROTOCOL_DATA = {
    "protocol_name": "How to cook a perfect risotto",
    "description": "Gordon Ramsey teaches you how to make a perfect risotto",
    "url": "www.gordonramseyrisotto.com",
}


def get_mock_dataset_data(*args, **kwargs):
    return MOCK_DATASET_DATA


def get_mock_protocol_data(*args, **kwargs):
    return MOCK_PROTOCOL_DATA


class MockORCIDAuthorizationResponse:
    def __init__(self, json_data, status_code):
        self.json_data = json_data
        self.status_code = status_code

    def json(self):
        return self.json_data


class MockORCIDRecordResponse:
    def __init__(self, summary):
        self.summary = summary

    def read_record_public(self, client_id, client_secret, sandbox):
        return self.summary


# This method will be used by the mock to replace requests.get
def generate_mock_orcid_authorization_response(*args, **kwargs):
    return MockORCIDAuthorizationResponse(ORCID_AUTHORIZATION_DICT, 200)


def generate_mock_orcid_record_response(*args, **kwargs):
    return MockORCIDRecordResponse(ORCID_SUMMARY_DICT)


def generate_random_mock_orcid_record_response(*args, **kwargs):
    summary_dict = copy.deepcopy(ORCID_SUMMARY_DICT)
    summary_dict["orcid-identifier"]["path"] = uuid.uuid4()
    return MockORCIDRecordResponse(summary_dict)


def get_mock_auth_data(grants):
    """
    Takes a list of grant info, in the form [{"title": "Title 1", "funder_id": "12345"}...]
    """
    data = {"code": MOCK_AUTHORIZATION_CODE, "email": MOCK_EMAIL, "origin_url": MOCK_ORIGIN_URL}

    if grants:
        data["grants"] = grants

    return data


def clean_test_file_uploads():
    """Cleanup the attachments test directory so there's no from previous tests
    """
    for directory_name in os.listdir(settings.LOCAL_FILE_DIRECTORY):
        directory_path = os.path.join(settings.LOCAL_FILE_DIRECTORY, directory_name)
        shutil.rmtree(directory_path, ignore_errors=True)
