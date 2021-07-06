# This terraform file hosts the resources directly related to security.


# This is the SSH key that can be used to ssh onto instances for
# debugging. Long term we may want to remove this entirely.
resource "aws_key_pair" "resources_portal" {
  key_name = "resources-portal-key-${var.user}-${var.stage}"
  public_key = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQC5s63W33FwB5GysB3CdION2DYqmEVbUECLghsPyXhpTHYSY9XbbTFIttCRELpc3FoVqbtR4ELLw/kCw8Nz9sZ+p4ukuMEJoudhMGYRRoV4stdBLi5qhIZtOnVkEWZyIyhtTDmdm4X3HjQZ3UkG36GMPBWRyMH9yaOiyuJHmJ7d1lrHgepNC5cBQfE4zJM4136tzBqIJGaN7DuhwwTXNp7D2trEL6xzk9/P8g4FOf8sny19+NPSZKZWCj64Vibn4JxCmqbxB1vmkig0XNteV7CHlay6vdzrIjSuaLX7CgL2qdPRPOAclCgb9ZvtxhTIHv5nqDFZJ4PlZY2Ep/xNNboaaWIezWeqtRYg3MAcNNGlR4BXkeao24K9KW19MjjtTzsoEJ47oHckpivwCM/R7bObnoNRW6lb4AWA9w2ycvUZrRS/HBm31aSxQZNiUCVas+nzreSKEqtq5WmeI5L36yyg3WzYs/Xcdebo7iIJ6p2LKHObp8ZU5E4FRXweJBYgrfysz7FkYVddD9GF69dfaX22HCN/17Z5xaJO2LLDjeocIuor2L+ru31oa2rG3l+l7mM1Slc8wFWT6b6Wczjf85QQFP8ZCQy4d6xWPFW/61V/97Fughd9UrCdVw7jlCIcZPP7Uj//KFeVBVMq3Cwqy6I0bxkS9cVqWpPuujQm2dmRbw=="
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
