# This terraform file hosts the resources directly related to the
# postgres RDS instance.

resource "aws_db_parameter_group" "postgres12_parameters" {
  name = "resources-portal-postgres12-parameters-${var.user}-${var.stage}"
  description = "Postgres Parameters ${var.user} ${var.stage}"
  family = "postgres12"

  parameter {
    name = "deadlock_timeout"
    value = "60000" # 60000ms = 60s
  }

  parameter {
    name = "statement_timeout"
    value = "60000" # 60000ms = 60s
  }

  lifecycle {
    create_before_destroy = true
  }

  tags = var.default_tags
}

resource "aws_db_instance" "postgres_db" {
  identifier = "resources-portal-${var.user}-${var.stage}"
  allocated_storage = 100
  storage_type = "gp2"
  engine = "postgres"
  engine_version = "12.19"
  auto_minor_version_upgrade = false
  instance_class = var.database_instance_type
  name = "resources_portal"
  port = "5432"
  username = "rppostgresuser"
  password = var.database_password

  db_subnet_group_name = aws_db_subnet_group.resources_portal.name
  parameter_group_name = aws_db_parameter_group.postgres12_parameters.name

  # TF is broken, but we do want this protection in prod.
  # Related: https://github.com/hashicorp/terraform/issues/5417
  # Only the prod's bucket prefix is empty.
  skip_final_snapshot = var.stage == "prod" ? false : true
  final_snapshot_identifier = var.stage == "prod" ? "resources-portal-prod-snapshot" : "none"

  vpc_security_group_ids = [aws_security_group.resources_portal_db.id]
  multi_az = true
  publicly_accessible = true

  backup_retention_period  = var.stage == "prod" ? "7" : "0"

  tags = var.default_tags
}
