import argparse
import subprocess

parser = argparse.ArgumentParser(
    description="""
This script can be used to destroy an infrastructure stack that was created with deploy.py.
This script must be run from /infrastructure!"""
)

# This should probably use some kind of options feature. I bet they have that.
parser.add_argument(
    "-e",
    "--env",
    help="""Specify the environment you would like to deploy to. Not optional. Valid values are:
    prod, staging, and dev
    `prod` and `staging` will deploy the production stack.
    These should only be used from a deployment machine.
    `dev` will deploy a dev stack which is appropriate for a single developer to use to test.""",
    required=True,
)

parser.add_argument(
    "-u",
    "--user",
    help="""
    Specify the username of the deployer.
    Should be the developer's name in development stacks.""",
    required=True,
)


args = parser.parse_args()

var_file_arg = "-var-file=environments/{}.tfvars".format(args.env)
completed_command = subprocess.check_call(["terraform", "destroy", var_file_arg, "-auto-approve"])
