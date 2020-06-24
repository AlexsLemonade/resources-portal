import uuid

from django.urls import reverse

from faker import Faker

fake = Faker()

MOCK_AUTHORIZATION_CODE = "mock"
MOCK_EMAIL = fake.email()

first_name = fake.first_name()
last_name = fake.last_name()

ORCID_AUTHORIZATION_DICT = {
    "name": f"{first_name} {last_name}",
    "orcid": str(uuid.uuid4()),
    "access_token": str(uuid.uuid4()),
    "refresh_token": str(uuid.uuid4()),
}

ORCID_SUMMARY_DICT = {
    "name": {"given-names": {"value": first_name}, "family-name": {"value": last_name}}
}


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


def get_mock_oauth_url(grants):
    base_url = reverse("user-list")
    url = f"{base_url}" f"?code={MOCK_AUTHORIZATION_CODE}" f"&email={MOCK_EMAIL}"

    for grant in grants:
        url += f"&grant_id={grant.id}"

    return url
