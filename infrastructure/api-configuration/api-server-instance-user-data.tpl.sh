#!/bin/bash

# This is a template for the instance-user-data.sh script for the API Server.
# For more information on instance-user-data.sh scripts, see:
# https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/user-data.html

# This script will be formatted by Terraform, which will read files from
# the project into terraform variables, and then template them into
# the following script. These will then be written out to files
# so that they can be used locally.

# Change to home directory of the default user
cd /home/ubuntu

# Install and configure Nginx.
cat <<"EOF" > nginx.conf
${nginx_config}
EOF
apt-get update -y
apt-get install nginx awscli zip -y
cp nginx.conf /etc/nginx/nginx.conf
service nginx restart

# install and run docker
apt-get install apt-transport-https ca-certificates curl software-properties-common -y
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu jammy stable" -y
apt-get install docker-ce docker-ce-cli -y

if [[ ${stage} == "staging" || ${stage} == "prod" ]]; then
    # Check here for the cert in S3, if present install, if not run certbot.
    if [[ $(aws s3 ls "${resources_portal_cert_bucket}" | wc -l) == "0" ]]; then
        # Create and install SSL Certificate for the API.
        # Only necessary on staging and prod.
        # We cannot use ACM for this because *.bio is not a Top Level Domain that Route53 supports.
        apt-get install -y software-properties-common
        add-apt-repository ppa:certbot/certbot
        apt-get update
        apt-get install -y python-certbot-nginx

        # g3w4k4t5n3s7p7v8@alexslemonade.slack.com is the email address we
        # have configured to forward mail to the #teamcontact channel in
        # slack. Certbot will use it for "important account
        # notifications".

        # The certbot challenge cannot be completed until the aws_lb_target_group_attachment resources are created.
        sleep 180
        BASE_URL="resources.alexslemonade.org"
        if [[ ${stage} == "staging" ]]; then
            certbot --nginx -d api.staging.$BASE_URL -n --agree-tos --redirect -m g3w4k4t5n3s7p7v8@alexslemonade.slack.com
        elif [[ ${stage} == "prod" ]]; then
            certbot --nginx -d api.$BASE_URL -n --agree-tos --redirect -m g3w4k4t5n3s7p7v8@alexslemonade.slack.com
        fi

        # Add the nginx.conf file that certbot setup to the zip dir.
        cp /etc/nginx/nginx.conf /etc/letsencrypt/

        cd /etc/letsencrypt/ || exit
        sudo zip -r ../letsencryptdir.zip "../$(basename "$PWD")"

        # And then cleanup the extra copy.
        rm /etc/letsencrypt/nginx.conf

        cd - || exit
        mv /etc/letsencryptdir.zip .
        aws s3 cp letsencryptdir.zip "s3://${resources_portal_cert_bucket}/"
        rm letsencryptdir.zip
    else
        zip_filename=$(aws s3 ls "${resources_portal_cert_bucket}" | head -1 | awk '{print $4}')
        aws s3 cp "s3://${resources_portal_cert_bucket}/$zip_filename" letsencryptdir.zip
        unzip letsencryptdir.zip -d /etc/
        mv /etc/letsencrypt/nginx.conf /etc/nginx/
        service nginx restart
    fi
fi

# Install, configure and launch our CloudWatch Logs agent
cat <<EOF >awslogs.conf
[general]
state_file = /var/lib/awslogs/agent-state

[/tmp/error.log]
file = /tmp/error.log
log_group_name = ${log_group}
log_stream_name = log-stream-api-nginx-error-${user}-${stage}

[/tmp/access.log]
file = /tmp/access.log
log_group_name = ${log_group}
log_stream_name = log-stream-api-nginx-access-${user}-${stage}

EOF

mkdir /var/lib/awslogs
wget https://s3.amazonaws.com/aws-cloudwatch/downloads/latest/awslogs-agent-setup.py
python3 ./awslogs-agent-setup.py --region ${region} --non-interactive --configfile awslogs.conf
# Rotate the logs, delete after 3 days.
echo "
/tmp/error.log {
    missingok
    notifempty
    compress
    size 20k
    daily
    maxage 3
}" >> /etc/logrotate.conf
echo "
/tmp/access.log {
    missingok
    notifempty
    compress
    size 20k
    daily
    maxage 3
}" >> /etc/logrotate.conf

# Install our environment variables
cat <<"EOF" > environment
${api_environment}
EOF

# Install the API startup script
cat <<"EOF" > start_api_with_migrations.sh
${start_api_with_migrations}
EOF

chmod +x ./start_api_with_migrations.sh

./start_api_with_migrations.sh

# Set up a cron job to rebuild the ES index every five minutes.
crontab -l > tempcron
# TODO: Stop logging this once it definitely is working!
# https://github.com/AlexsLemonade/resources-portal/issues/422
echo -e "SHELL=/bin/bash\nPATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\n*/5 * * * * docker exec resources_portal_api python3 manage.py update_es_index > /var/log/api_cron.log 2>&1" >> tempcron
echo -e "SHELL=/bin/bash\nPATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\n0 15 * * MON docker exec resources_portal_api python3 manage.py send_weekly_digest_emails > /var/log/api_cron.log 2>&1" >> tempcron
# install new cron file
crontab tempcron
rm tempcron

# Delete the cloudinit and syslog in production.
export STAGE=${stage}
if [[ $STAGE = *"prod"* ]]; then
    rm /var/log/cloud-init.log
    rm /var/log/cloud-init-output.log
    rm /var/log/syslog
fi
