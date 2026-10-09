import logging
import sys

def configure_logging():
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter("%(message)s"))

    logger = logging.getLogger("vcegen")
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)
    logger.propagate = False

