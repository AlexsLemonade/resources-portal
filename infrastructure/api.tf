# This terraform file hosts the resources directly related to the EC2
# instance used by the API.

data "local_file" "api_nginx_config" {
  filename = "api-configuration/nginx_config.conf"
}

data "aws_ami" "ubuntu" {
  most_recent = true
  owners = ["099720109477"]

  filter {
    name   = "name"
    # This is a HVM, EBS backed SSD Ubuntu LTS AMI
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22*amd64-server*"]
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
    aws_elasticsearch_domain.es,
    aws_security_group_rule.resources_portal_api_http,
    aws_security_group_rule.resources_portal_api_outbound,
    aws_key_pair.resources_portal
  ]

  user_data = templatefile(
    "api-configuration/api-server-instance-user-data.tpl.sh",
    {
      nginx_config = data.local_file.api_nginx_config.content
      resources_portal_cert_bucket = aws_s3_bucket.resources_portal_cert_bucket.id
      api_environment = templatefile(
        "api-configuration/environment.tpl",
        {
          django_secret_key = var.django_secret_key
          database_host = aws_db_instance.postgres_db.address
          database_port = aws_db_instance.postgres_db.port
          database_user = aws_db_instance.postgres_db.username
          database_name = aws_db_instance.postgres_db.name
          database_password = var.database_password
          elasticsearch_host = aws_elasticsearch_domain.es.endpoint
          aws_region  = var.region
          aws_ses_domain = var.aws_ses_domain
          aws_s3_bucket_name = aws_s3_bucket.resources_portal_bucket.id
          oauth_url = var.oauth_url
          oauth_client_id = var.oauth_client_id
          oauth_client_secret = var.oauth_client_secret
          sentry_dsn = var.sentry_dsn
          sentry_env = var.sentry_env
        })
      start_api_with_migrations = templatefile(
        "api-configuration/start_api_with_migrations.tpl.sh",
        {
          region = var.region
          dockerhub_repo = var.dockerhub_repo
          log_group = aws_cloudwatch_log_group.resources_portal_log_group.name
          log_stream = aws_cloudwatch_log_stream.log_stream_api.name
        })
      user = var.user
      stage = var.stage
      region = var.region
      log_group = aws_cloudwatch_log_group.resources_portal_log_group.name
    })
  key_name = aws_key_pair.resources_portal.key_name

  tags =  merge(
    var.default_tags,
    {
      Name = "Resources Portal API ${var.user}-${var.stage}"
    }
  )

  # I think these are the defaults provided in terraform examples.
  # They should be removed or revisited.
  root_block_device {
    volume_type = "gp2"
    volume_size = 100
  }
}

output "api_server_1_ip" {
  value = aws_instance.api_server_1.public_ip
}
