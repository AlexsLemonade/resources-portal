# This terraform file hosts the terraform variables used throughout
# the project.

data "aws_caller_identity" "current" {}

variable "default_tags" {
  default = {
    team = "engineering"
    project = "Resources Portal"
  }
  description = "Default resource tags"
  type = map(string)
}

variable "region" {
  default = "us-east-1"
}

variable "user" {
  default = "myusername"
}

variable "stage" {
  default = "dev"
}

variable "dockerhub_repo" {
  default = "resources_portal_staging"
}

variable "system_version" {
  default = "INVALID SYSTEM VERSION"
}

variable "django_secret_key" {
  # This will be overwritten by the password in GitHub actions.
  # It's kept there so it's secret.
  default = "THIS_IS_NOT_A_SECRET_DO_NOT_USE_IN_PROD"
}

variable "database_password" {
  # This will be overwritten by the password in GitHub actions.
  # It's kept there so it's secret.
  default = "rppostgrespassword"
}

variable "database_port" {
  default = "5432"
}

variable "api_instance_type" {
  default = "t2.large"
}

variable "database_instance_type" {
  default = "db.t3.micro"
}

variable "elasticsearch_instance_type" {
  default = "t2.small.elasticsearch"
}

variable "aws_ses_domain" {
  default = "staging.resources.alexslemonade.org."
}

variable "oauth_url" {
  default = "MISSING_VALUE"
}

variable "oauth_client_secret" {
  default = "MISSING_VALUE"
}

variable "oauth_client_id" {
  default = "MISSING_VALUE"
}

variable "sentry_dsn" {
  default = "MISSING_VALUE"
}

variable "sentry_env" {
  default = "MISSING_VALUE"
}

variable "ssh_public_key" {
  default = "MISSING_VALUE"
}

output "environment_variables" {
  value = [
    {name = "DATABASE_NAME"
      value = aws_db_instance.postgres_db.name},
    {name = "DATABASE_HOST"
      value = aws_db_instance.postgres_db.address},
    {name = "DATABASE_USER"
      value = aws_db_instance.postgres_db.username},
    {name = "DATABASE_PORT"
      value = aws_db_instance.postgres_db.port}
  ]
}
