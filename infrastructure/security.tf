# This terraform file hosts the resources directly related to security.


# This is the SSH key that can be used to ssh onto instances for
# debugging. Long term we may want to remove this entirely.
resource "aws_key_pair" "resources_portal" {
  key_name = "resources-portal-key-${var.user}-${var.stage}"
  public_key = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQCZbpHCZMuk4Bl96wcJw2u0W31JV2IhInU7Xelfd/BO++QcxyoR3zpA+JhPC0MVKrvWO95chxQzIP91pGvPhscAlxoSMxRufjvIElvTbSgPCWFTIk/xfAyYGNkV6uX5wgQ2HjonEsnuLB31eRNF9WKdmv7UtyAIapghSSQa0Qbqdrk70LYFdDG+ZRT0ZqTxhvzIuaDjexI9rQtR03EzVoUP43XCHxl0NZN0QljsLu7dqM19b50dmlWXT0dQE+fgZBFbTR4yXOZAWqCEXLbV5VxW6lEbqXjW9VEAwcYZX1p3jL9HqOY/6E5l7Rl/TuwqDaCNkQ6dvs5GFk/qmmoeyUj1jDEuG+Fe0um6Cf8Eh3L43c9+EzNyGt44pdZsNg+NnpjOliqx4ww7WFwmMEpfLeOZwBOD01tykBJtah9CFH2574wv//XzimsXHgOU+bgLRzOX9297G2x6fPW0OIhO/VZrB4Y950vtE+mYAUDyqeSKAoR0LD4ugf/DtlZaHfRHFIexqGrnJoHDKuzsxA3edASTf0cmu3KYvfj22OD3VORbxRrM5wYul1wdk0Z+wribR3Sp2JBtx7ShG5Hv3BUMMNW4nOUI5O+VAdwRyH76gki6RS2FBM6TRol6ugdEyOsP1t+3atSu3sKrWpz2jisKZsDqYpJka/FPlDaEscPHMkzmFw=="
}

##
# Database
##

resource "aws_security_group" "resources_portal_db" {
  name = "resources-portal_db-${var.user}-${var.stage}"
  description = "resources_portal_db-${var.user}-${var.stage}"
  vpc_id = aws_vpc.resources_portal_vpc.id

  tags = merge(
    var.default_tags,
    {
      Name = "resources-portal-db-${var.user}-${var.stage}"
    }
  )
}

resource "aws_security_group_rule" "resources_portal_db_outbound" {
  type = "egress"
  from_port = 0
  to_port = 65535
  protocol = "tcp"
  cidr_blocks = ["0.0.0.0/0"]
  security_group_id = aws_security_group.resources_portal_db.id
}

resource "aws_security_group_rule" "resources_portal_db_tcp" {
  type = "ingress"
  from_port = 5432
  to_port = 5432
  protocol = "tcp"
  source_security_group_id = aws_security_group.resources_portal_api.id
  security_group_id = aws_security_group.resources_portal_db.id
}

##
# API
##

resource "aws_security_group" "resources_portal_api" {
  name = "resources-portal-api-${var.user}-${var.stage}"
  description = "resources-portal-api-${var.user}-${var.stage}"
  vpc_id = aws_vpc.resources_portal_vpc.id

  tags = merge(
    var.default_tags,
    {
      Name = "resources-portal-api-${var.user}-${var.stage}"
    }
  )
}

resource "aws_security_group_rule" "resources_portal_api_ssh" {
  type = "ingress"
  from_port = 22
  to_port = 22
  protocol = "tcp"
  cidr_blocks = ["0.0.0.0/0"]
  security_group_id = aws_security_group.resources_portal_api.id
}

resource "aws_security_group_rule" "resources_portal_api_http" {
  type = "ingress"
  from_port = 80
  to_port = 80
  protocol = "tcp"
  cidr_blocks = ["0.0.0.0/0"]
  security_group_id = aws_security_group.resources_portal_api.id
}

resource "aws_security_group_rule" "resources_portal_api_https" {
  type = "ingress"
  from_port = 443
  to_port = 443
  protocol = "tcp"
  cidr_blocks = ["0.0.0.0/0"]
  security_group_id = aws_security_group.resources_portal_api.id
}

resource "aws_security_group_rule" "resources_portal_api_outbound" {
  type = "egress"
  from_port = 0
  to_port = 0
  protocol = "all"
  cidr_blocks = ["0.0.0.0/0"]
  ipv6_cidr_blocks = ["::/0"]
  security_group_id = aws_security_group.resources_portal_api.id
}

##
# ElasticSearch
##

resource "aws_security_group" "resources_portal_es" {
  name = "resources-portal-es-${var.user}-${var.stage}"
  description = "resources-portal-es-${var.user}-${var.stage}"
  vpc_id = aws_vpc.resources_portal_vpc.id

  tags = merge(
    var.default_tags,
    {
      Name = "resources-portal-es-${var.user}-${var.stage}"
    }
  )

  # Wide open, but inside inside the VPC
  ingress {
    from_port = 0
    to_port = 0
    protocol = "-1"
    security_groups = [aws_security_group.resources_portal_api.id]
  }
}
