#!/bin/bash -e

print_description() {
    echo 'This script can be used to deploy and update a `resources portal` instance stack.'
    echo 'It will create all of the AWS infrasctructure (roles/instances/db/network/etc),'
    echo 'open an ingress, perform a database migration, and close the'
    echo 'ingress. This can be run from a CI/CD machine or a local dev box.'
    echo 'This script must be run from /infrastructure!'
}

print_options() {
    echo 'This script accepts the following arguments: -e, -u, -r, and -h.'
    echo '-h prints this help message and exits.'
    echo '-e specifies the environment you would like to deploy to and is not optional. Its valid values are:'
    echo '   "-e prod" will deploy the production stack. This should only be used from a CD machine.'
    echo '   "-e staging" will deploy the staging stack. This should only be used from a CD machine.'
    echo '   "-e dev" will deploy a dev stack which is appropriate for a single developer to use to test.'
    echo "-u specifies the username of the deployer. Should be the developer's name in development stacks."
    echo '   This option may be omitted, in which case the TF_VAR_user variable MUST be set instead.'
    echo '-r specifies the AWS region to deploy the stack to. Defaults to us-east-1.'
}

while getopts ":e:d:v:u:r:h" opt; do
    case $opt in
    e)
        export env=$OPTARG
        export TF_VAR_stage=$OPTARG
        ;;
    d)
        export TF_VAR_dockerhub_repo=$OPTARG
        ;;
    v)
        export TF_VAR_system_version=$OPTARG
        ;;
    u)
        export TF_VAR_user=$OPTARG
        ;;
    r)
        export TF_VAR_region=$OPTARG
        ;;
    h)
        print_description
        echo
        print_options
        exit 0
        ;;
    \?)
        echo "Invalid option: -$OPTARG" >&2
        print_options >&2
        exit 1
        ;;
    :)
        echo "Option -$OPTARG requires an argument." >&2
        print_options >&2
        exit 1
        ;;
    esac
done

if [[ $env != "dev" && $env != "staging" && $env != "prod" ]]; then
    echo 'Error: must specify environment as either "dev", "staging", or "prod" with -e.'
    exit 1
fi

if [[ -z $TF_VAR_user ]]; then
    echo 'Error: must specify the username by either providing the -u argument or setting TF_VAR_user.'
    exit 1
fi

if [[ -z $TF_VAR_region ]]; then
    TF_VAR_region=us-east-1
fi

if [[ -z $TF_VAR_system_version ]]; then
    echo 'Error: must specify the system version with -v.'
    exit 1
fi

if [[ -z $TF_VAR_dockerhub_repo ]]; then
    TF_VAR_dockerhub_repo=resources_portal_staging
fi

# This could be configurable, but there isn't much point.
HTTP_PORT=8081

image_name=$TF_VAR_dockerhub_repo/resources_portal_api:$TF_VAR_system_version

docker build -t $image_name --build-arg SYSTEM_VERSION=$TF_VAR_system_version --build-arg HTTP_PORT=$HTTP_PORT .

docker push $image_name

terraform apply -var-file=environments/$env.tfvars -auto-approve
