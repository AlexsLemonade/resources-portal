"""This script is a bit of a work-in-progress. I'd like to use
docker-py to interact with Docker's API directly in python, but can't
get it to work. I have an issue open to track this TODO:
https://github.com/AlexsLemonade/resources-portal/issues/33
"""

import argparse
import os
import re
import signal
import subprocess
import time

from init_terraform import init_terraform

# import docker

KEY_FILE_PATH = "resources-portal-key.pem"


def parse_args():
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

    user_help_text = "Specify the username of the deployer. Should be the developer's name in development stacks."
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

    return parser.parse_args()


def build_and_push_docker_image(args):
    # This could be configurable, but there isn't much point.
    HTTP_PORT = 8081

    image_name = f"{args.dockerhub_repo}/resources_portal_api"

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

    docker_login_command = ["docker", "login"]

    if "DOCKER_ID" in os.environ:
        docker_login_command.extend(["--username", os.environ["DOCKER_ID"]])

        if "DOCKER_PASSWORD" in os.environ:
            docker_login_command.extend(["--password", os.environ["DOCKER_PASSWORD"]])

    try:
        completed_command = subprocess.check_call(docker_login_command)
    except subprocess.CalledProcessError as e:
        print("Failed to login to docker.")
        return 1

    if completed_command != 0:
        return completed_command

    completed_command = subprocess.check_call(["docker", "push", image_name])

    # Change dir back so terraform is run from the correct location:
    os.chdir("../infrastructure")

    return completed_command


def load_env_vars(args):
    """Load environment specific variables.

    For dev environment, just use the variables contained in
    api-configuration/dev-secrets.

    For staging and prod environments, filter all the environment
    variables just starting with "STAGING_" or "PROD_". This is
    because github actions will always provide all the env variables.
    """
    if args.env == "dev":
        with open("api-configuration/dev-secrets") as dev_secrets:
            for line in dev_secrets.readlines():
                [key, val] = line.split("=")
                # Test this!
                os.environ[key] = val
    else:
        env_prefix = args.env.upper() + "_"
        for key in filter(lambda var: var.startswith(env_prefix), os.environ.keys()):
            val = os.environ.get(key)
            stripped_key = key.split(env_prefix)[-1]
            os.environ[stripped_key] = val

    os.environ["TF_VAR_user"] = args.user
    os.environ["TF_VAR_stage"] = args.env
    os.environ["TF_VAR_region"] = args.region
    os.environ["TF_VAR_dockerhub_repo"] = args.dockerhub_repo
    os.environ["TF_VAR_system_version"] = args.system_version


def run_terraform(args):
    var_file_arg = "-var-file=tf_vars/{}.tfvars".format(args.env)

    try:
        terraform_process = subprocess.Popen(
            ["terraform", "apply", var_file_arg, "-auto-approve"], stdout=subprocess.PIPE
        )
        output = ""
        for line in iter(terraform_process.stdout.readline, b""):
            decoded_line = line.decode("utf-8")
            print(decoded_line, end="")
            output += decoded_line

        terraform_process.wait()

        return terraform_process.returncode, output
    except KeyboardInterrupt:
        terraform_process.send_signal(signal.SIGINT)
        terraform_process.wait()


def run_remote_command(ip_address, command):
    completed_command = subprocess.check_call(
        [
            "ssh",
            "-i",
            KEY_FILE_PATH,
            "-o",
            "StrictHostKeyChecking=no",
            "ubuntu@" + ip_address,
            command,
        ],
    )

    return completed_command


def restart_api_if_still_running(args, api_ip_address):
    try:
        run_remote_command(api_ip_address, "echo The API is still up! Restarting it!")
    except subprocess.CalledProcessError:
        print("Seems like the API isn't up yet, which means it got cylced.")
        return 0

    run_remote_command(api_ip_address, "docker rm -f $(docker ps -a -q) 2>/dev/null || true")

    print("Waiting for API container to stop.")
    time.sleep(30)

    return run_remote_command(api_ip_address, "sudo bash start_api_with_migrations.sh")


if __name__ == "__main__":
    args = parse_args()

    docker_code = build_and_push_docker_image(args)

    if docker_code != 0:
        exit(docker_code)

    load_env_vars(args)

    init_code = init_terraform(args.env, args.user)

    if init_code != 0:
        exit(init_code)

    terraform_code, terraform_output = run_terraform(args)
    if terraform_code != 0:
        exit(terraform_code)

    ip_address_match = re.match(
        r".*\napi_server_1_ip = (\d+\.\d+\.\d+\.\d+)\n.*", terraform_output, re.DOTALL
    )

    if ip_address_match:
        api_ip_address = ip_address_match.group(1)
    else:
        print("Could not find the API's IP address. Something has gone wrong or changed.")
        exit(1)

    # Create a key file from env var
    if args.env != "dev":
        with open(KEY_FILE_PATH) as key_file:
            key_file.write(os.environ["API_SSH_KEY"])

        os.chmod(KEY_FILE_PATH, 0o600)

    # This is the last command, so the script's return code should
    # match it.
    return_code = restart_api_if_still_running(args, api_ip_address)

    if return_code == 0:
        print("Deploy completed successfully!!")

    exit(return_code)
