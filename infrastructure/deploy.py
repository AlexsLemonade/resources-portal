"""This script is a bit of a work-in-progress. I'd like to use
docker-py to interact with Docker's API directly in python, but can't
get it to work. I have an issue open to track this TODO:
https://github.com/AlexsLemonade/resources-portal/issues/33
"""

import argparse
import os
import subprocess

import docker

description = """This script can be used to deploy and update a `resources portal` instance stack.
It will create all of the AWS infrasctructure (roles/instances/db/network/etc),
open an ingress, perform a database migration, and close the
ingress. This can be run from a CI/CD machine or a local dev box.
This script must be run from /infrastructure!"""
parser = argparse.ArgumentParser(description=description)

env_help_text = """Specify the environment you would like to deploy to. Not optional. Valid values
are: prod, staging, and dev `prod` and `staging` will deploy the production stack. These should
only be used from a deployment machine. `dev` will deploy a dev stack which is appropriate for a
single developer to use to test."""
parser.add_argument(
    "-e", "--env", help=env_help_text, required=True, choices=["dev", "staging", "prod"],
)

user_help_text = (
    "Specify the username of the deployer. Should be the developer's name in development stacks."
)
parser.add_argument("-u", "--user", help=user_help_text, required=True)

dockerhub_help_text = (
    "Specify the dockerhub repo from which to pull the docker image."
    " Can be useful for using your own dockerhub repo for a development stack."
)
parser.add_argument("-d", "--dockerhub-repo", help=dockerhub_help_text, required=True)

version_help_text = "Specify the version of the system that is being deployed."
parser.add_argument("-v", "--system-version", help=version_help_text, required=True)

region_help_text = "Specify the AWS region to deploy the stack to. Default is us-east-1."
parser.add_argument("-r", "--region", help=region_help_text, default="us-east-1")

args = parser.parse_args()

# This could be configurable, but there isn't much point.
HTTP_PORT = 8081

image_name = f"{args.dockerhub_repo}/resources_portal_api:{args.system_version}"

# Hopefully this gets answered and we can use docker-py:
# https://github.com/docker/docker-py/issues/2526
#  client = docker.DockerClient(base_url="unix://var/run/docker.sock", version="auto")
# # client = docker.from_env(version="auto")
# client.images.build(
#     path="../api",
#     dockerfile="Dockerfile.prod",
#     tag=image_name,
#     buildargs={"SYSTEM_VERSION": args.system_version, "HTTP_PORT": HTTP_PORT},
# )

# Until then, use subprocess to call docker :(
# Change dir so docker can see the code.
os.chdir("../api")

system_version_build_arg = "SYSTEM_VERSION={}".format(args.system_version)
http_port_build_arg = "HTTP_PORT={}".format(HTTP_PORT)

# check_call() will raise an exception for us if this fails.
completed_command = subprocess.check_call(
    [
        "docker",
        "build",
        "--tag",
        image_name,
        "--build-arg",
        system_version_build_arg,
        "--build-arg",
        http_port_build_arg,
        "-f",
        "Dockerfile.prod",
        ".",
    ],
)

completed_command = subprocess.check_call(["docker", "push", image_name])

# Change dir back so terraform is run from the correct location:
os.chdir("../infrastructure")

os.environ["TF_VAR_user"] = args.user
os.environ["TF_VAR_stage"] = args.env
os.environ["TF_VAR_region"] = args.region
os.environ["TF_VAR_dockerhub_repo"] = args.dockerhub_repo
os.environ["TF_VAR_system_version"] = args.system_version

var_file_arg = "-var-file=environments/{}.tfvars".format(args.env)
completed_command = subprocess.check_call(["terraform", "apply", var_file_arg, "-auto-approve"])
