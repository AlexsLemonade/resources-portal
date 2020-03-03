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

variable "database_user" {
  default = "rppostgresuser"
}

variable "database_password" {
  # This will be overwritten by the password in terraform.tfvars.
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
  default = "t2.micro"
}

output "environment_variables" {
  value = [
    {name = "DATABASE_NAME"
      value = "${aws_db_instance.postgres_db.name}"},
    {name = "DATABASE_HOST"
      value = "${aws_db_instance.postgres_db.address}"},
    {name = "DATABASE_USER"
      value = "${var.database_user}"},
    {name = "DATABASE_PASSWORD"
      value = "${var.database_password}"},
    {name = "DATABASE_PORT"
      value = "${var.database_port}"}
  ]
}
