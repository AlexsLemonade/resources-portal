# This terraform file hosts the resources directly related to the EC2
# instance used by the API.

data "local_file" "api_nginx_config" {
  filename = "api-configuration/nginx_config.conf"
}

# This template file contains all the env variables needed by the API.
data "template_file" "api_environment" {
  template = "${file("api-configuration/environment.tpl")}"

  vars = {
    django_secret_key = var.django_secret_key
    database_host = aws_db_instance.postgres_db.address
    database_port = aws_db_instance.postgres_db.port
    database_user = aws_db_instance.postgres_db.username
    database_name = aws_db_instance.postgres_db.name
    database_password = var.database_password
    elasticsearch_host = aws_elasticsearch_domain.es.endpoint
  }

  depends_on = [
    aws_db_instance.postgres_db,
    aws_elasticsearch_domain.es
  ]
}

# This script smusher exists in order to be able to circumvent a
# limitation of AWS which is that you get one script and one script
# only to set up the instance when it boots up. Because there is only
# one script you cannot place additional files your script may need
# onto the instance. Therefore this script smusher templates the files
# the instance-user-data.sh script needs into it, so that once it
# makes its way onto the instance it can spit them back out onto the
# disk.
data "template_file" "api_server_script_smusher" {
  template = "${file("api-configuration/api-server-instance-user-data.tpl.sh")}"

  vars = {
    nginx_config = data.local_file.api_nginx_config.content
    api_environment = data.template_file.api_environment.rendered
    user = var.user
    stage = var.stage
    region = var.region
    dockerhub_repo = var.dockerhub_repo
    system_version = var.system_version
    log_group = aws_cloudwatch_log_group.resources_portal_log_group.name
    log_stream = aws_cloudwatch_log_stream.log_stream_api.name
  }

  depends_on = [
    data.template_file.api_environment,
    aws_db_instance.postgres_db,
    aws_security_group_rule.resources_portal_api_http,
    aws_security_group_rule.resources_portal_api_outbound
  ]

}

data "aws_ami" "ubuntu" {
  most_recent = true
  owners = ["aws-marketplace"]

  filter {
    name   = "name"
    # This is a HVM, EBS backed SSD Ubuntu LTS AMI with Docker version 17.12.0 on it in the US,
    # the stock Ubuntu cloud image in the EU.
    values = ["ubuntu-18-04-docker2"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

}

resource "aws_instance" "api_server_1" {
  ami = data.aws_ami.ubuntu.id
  instance_type = var.api_instance_type
  availability_zone = "${var.region}a"
  vpc_security_group_ids = [aws_security_group.resources_portal_api.id]
  iam_instance_profile = aws_iam_instance_profile.resources_portal_instance_profile.name
  subnet_id = aws_subnet.resources_portal_1a.id
  depends_on = [
    aws_db_instance.postgres_db,
    aws_security_group_rule.resources_portal_api_http,
    aws_security_group_rule.resources_portal_api_outbound
  ]
  user_data = data.template_file.api_server_script_smusher.rendered
  key_name = aws_key_pair.resources_portal.key_name

  tags = {
    Name = "Resources Portal API ${var.user}-${var.stage}"
  }

  # I think these are the defaults provided in terraform examples.
  # They should be removed or revisited.
  root_block_device = {
    volume_type = "gp2"
    volume_size = 100
  }
}

output "api_server_1_ip" {
  value = aws_instance.api_server_1.public_ip
}
