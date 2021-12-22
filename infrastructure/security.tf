# This terraform file hosts the resources directly related to security.


# This is the SSH key that can be used to ssh onto instances for
# debugging. Long term we may want to remove this entirely.
resource "aws_key_pair" "resources_portal" {
  key_name = "resources-portal-key-${var.user}-${var.stage}"
  public_key = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQCwLG06Xh+l4WYXSspdPeMAXDN5Mu3Ngs0hZruLwvsbeewMiZbGvIcE0Qw4pulmcOb3OcXig0eqG5nb7dUZPfpbqoJ4R+KzjRknIbMLNMng+UjmmXHEXmb4pT9ZVXUyq2QuS51Oba+VBA6cbZiIL8bYyFM5XTIemaM90NDMd7E4WotV2JUmUFQD29lFSb9PFnbnytq4VPuDqHcpTGBcAnxaMjSLlpWKEwDGustybMIUaaXglFyRjy8nVatuNpoJPHdxVRXak7m7TFQ7IR0+7ZQPv9/vf99NsKjqFcN8+EDVB8qrj5X1zvnvwD/O5g1CijYiEuSUMGAcpQSstOeh9FVyP/nX8QMls5gE5Vd+Xh6NZJve+hXstciz8j/WFdGuT3UknjKBLBaHwYqrSoYRMfuxi6grgAWMwHEGOhfM80xFj27OzS7hTB3tTRZuBzhS6rfCTAyLTn8x4/pRG7wQM7kz9vGFCHEbrr+FjhPfM82rVrA+7uCzObAHTPhxEvoovupbMpVu6o/8k3zXg3NweO6evqIzebsqEpts6dzSPFzSribxulJVbonq/5QCIFefH1Z3dqsQfFKGSCilo/w0/cdRB2UX+IccbGBbXLkySmM5Dxj23xxwW7X/0BufNv9+tPt9Y322wNG/4gHHm9O8QtP19svIG+esg7C5bafh3uOlkQ=="
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
