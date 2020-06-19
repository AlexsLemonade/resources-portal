import logging
import os
import sys
from multiprocessing import current_process

from django.conf import settings

import daiquiri
import requests
from retrying import retry

# Found: http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-metadata.html
METADATA_URL = "http://169.254.169.254/latest/meta-data"
INSTANCE_ID = None


def get_instance_id() -> str:
    """Returns the AWS instance id where this is running or "local"."""
    global INSTANCE_ID
    if INSTANCE_ID is None:
        if settings.RUNNING_IN_CLOUD:

            @retry(stop_max_attempt_number=3)
            def retrieve_instance_id():
                return requests.get(os.path.join(METADATA_URL, "instance-id")).text

            INSTANCE_ID = retrieve_instance_id()
        else:
            INSTANCE_ID = "local"

    return INSTANCE_ID


def get_worker_id() -> str:
    """Returns <instance_id>/<thread_id>."""
    return get_instance_id() + "/" + current_process().name


def get_volume_index(path="/home/user/data_store/VOLUME_INDEX") -> str:
    """ Reads the contents of the VOLUME_INDEX file, else returns default """

    if settings.RUNNING_IN_CLOUD:
        default = "-1"
    else:
        default = "0"

    try:
        with open(path, "r") as f:
            v_id = f.read().strip()
            return v_id
    except Exception as e:
        # Our configured logger needs util, so we use the standard logging library for just this.
        import logging

        logger = logging.getLogger(__name__)
        logger.info(str(e))
        logger.info("Could not read volume index file, using default: " + str(default))

    return default


# Most of the formatting in this string is for the logging system. All
# that the call to format() does is replace the "{0}" in the string
# with the worker id.
FORMAT_STRING = (
    "%(asctime)s {0} [volume: {1}] %(name)s %(color)s%(levelname)s%(extras)s"
    ": %(message)s%(color_stop)s"
).format(get_instance_id(), get_volume_index())
LOG_LEVEL = None


def unconfigure_root_logger():
    """Prevents the root logger from duplicating our messages.

    The root handler comes preconfigured with a handler. This causes
    all our logs to be logged twice, once with our cool handler and
    one that lacks all context. This function removes that stupid
    extra handler.
    """
    root_logger = logging.getLogger(None)
    # Remove all handlers
    for handler in list(root_logger.handlers):
        root_logger.removeHandler(handler)


def get_and_configure_logger(name: str) -> logging.Logger:
    unconfigure_root_logger()

    global LOG_LEVEL
    if LOG_LEVEL is None:
        LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

    logger = daiquiri.getLogger(name)
    logger.setLevel(logging.getLevelName(LOG_LEVEL))

    # This is the local handler
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(daiquiri.formatter.ColorExtrasFormatter(fmt=FORMAT_STRING, keywords=[]))
    logger.logger.addHandler(handler)

    return logger
