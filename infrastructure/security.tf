# This terraform file hosts the resources directly related to security.


# This is the SSH key that can be used to ssh onto instances for
# debugging. Long term we may want to remove this entirely.
resource "aws_key_pair" "resources_portal" {
  key_name = "resources-portal-key-${var.user}-${var.stage}"
  public_key = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDo94ZtFZGGjiiDUoR65ZY9nseRHJn7fT1hJqQGohoNn4Mo9yPJ4euVulv6zfmqGiU/kkMQ8iMBJm7c/Wcqm+IZtoSAk9y1sB09SxCohdUU3TznozdJ0Z+0bbWMKdHA6/yZE4DaUsi0fDFE1qW8uZlaYHu7TVCP+0/NM9O056DUSue1hcIxmATwUhjSXeH3pMVYyACJcCEiahSEBsGYV4jL/srldW3FtSU62b4/FX0tlR1k5zW2D+Pr30FyqheDCxYOpiNBuiDp2lw3e39lzDdYzU9XngBTwPlgzNd9a3rdDkSjGlpOyDYZJbbP4WIZbUL1APW60HHaE+9twKyJUDpOYJWd4pVJ08Nvxg8HrkZYBUA0j1VnlpytqMI0f8Q4BvDsRJjiz2RsYu2MoDauLj03bnfx/YE5r8c5d3jAYlGc/O1SmYn0V6G5wX2p34Dbb+WNdN47FBypOsykfO0MAcSJiXh+hnAusrC8a2uLXLtlGmf6CPauzEtjlY6bsUlQErmLPswQEkDOH9tS4sWOsX4NzSI4yh7TaL+JWl7Yaw7+3DKgaRP+WFmuexFkuKF4bakQ68KqvUa4n7CBcJ8vWvg648YcBRyLZL9At9DYvKK0874FcYKZu1qwV54n1Rz7I65T5UqLntlkzsPPqOmH/YOdPa11JUNQc4Vh8nRJnKObZQ=="
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
