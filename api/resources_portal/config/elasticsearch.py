import boto3
from elasticsearch import RequestsHttpConnection
from requests_aws4auth import AWS4Auth


class AWSHttpConnection(RequestsHttpConnection):
    def perform_request(
        self, method, url, params=None, body=None, timeout=None, ignore=(), headers=None
    ):
        region = "us-east-1"
        service = "es"
        credentials = boto3.Session().get_credentials()
        awsauth = AWS4Auth(
            credentials.access_key,
            credentials.secret_key,
            region,
            service,
            session_token=credentials.token,
        )
        if awsauth is not None:
            self.session.auth = awsauth

        return super().perform_request(method, url, params, body, timeout, ignore, headers)
