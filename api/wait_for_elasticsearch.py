#!/usr/bin/env python3

import os
import time
from datetime import datetime, timedelta

import requests

from resources_portal.config.logging import get_and_configure_logger

logger = get_and_configure_logger(__name__)

port = os.getenv("ELASTICSEARCH_PORT", "9200")

start = datetime.now()
max_time = timedelta(seconds=60)
success = False

while (datetime.now() - start < max_time) and not success:
    try:
        response = requests.get(
            f"http://elasticsearch:{port}/_cluster/health?wait_for_status=yellow&timeout=50s"
        )
        success = response.status_code == 200
    except Exception:
        pass

    if not success:
        logger.info("Waiting on elasticsearch to start....")

        time.sleep(1)

if datetime.now() - start > max_time:
    logger.info("Elasticsearch never came up.")
    exit(1)
