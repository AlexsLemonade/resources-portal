# This terraform file hosts the resources directly related to security.


# This is the SSH key that can be used to ssh onto instances for
# debugging. Long term we may want to remove this entirely.
resource "aws_key_pair" "resources_portal" {
  key_name = "resources-portal-key-${var.user}-${var.stage}"
  public_key = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQCnFMhXKSVPQIb9Dy8gXMHOpqOsLzQQuRs23NDs5XQG5qQASSeCyWxJBGNXmEyxTGsZwMr5HoK8x7eClflbxXaKyKz8IRIb+plTyclXOCb5NYP2Ay7WgrGu0XznywvkivrEFG7xpgfPZ88yuv9VjWOGWgli6Ogjl5WdZd/OHL4FkYa56xtWiooKHWW3Yt9Xgh2joxOLtliPlhBb2oG2z8NRARvot2cLKXMmc/uhPHNR7eeuEyn6eQr+dDFWNcVyPPgFkc5XT1g9lSnjZx3jEW/XFJ5WxMlN1LrjVGC8WO5zBp5qv3z2IeYZXQXxEXYCvf+IUpsoUnS7NVaQNSt+1d2nXKQGwQmn0S60wPB6zYmDTon3pKl/QKrDXyuvHEV06UPyJ31JWFX11Oe6Xa2qHm+h11nXu7+xzauwYz+uzwomx55pzInU4Ta5FQJWPOrHBMreI5tf3scPkfUWwI8/05Qio4q4EL+WGQ8QjaBj6OCld7cNarT3OhWEhZBJWwcsL+QiqqMdbajnFCUCE3sxqEQuUcRMNuLwG7DHfFazOCAEDuYJH6L3RAkkYIZ/elAYzU5hamyuVVVL97i9Iyxxz9rMzFnGNe2eGrTXbdHE4kMCwmAntjpbb/gUW8LzuyVQ/oh1+WhW66inaF49YyDi0kCtnz+LqKKkQCFYZ4x7f4o7FQ=="
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
