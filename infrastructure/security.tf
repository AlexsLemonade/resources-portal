# This is the SSH key that can be used to ssh onto instances for
# debugging. Long term we may want to remove this entirely.
resource "aws_key_pair" "resources_portal" {
  key_name = "resources-portal-key-${var.user}-${var.stage}"
  public_key = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQCzvVDhV2dLR9nWEW/EhfH3YGil2apmgCQV3R2UbCodUilC1SOpTDOjao1aCfT6seHN1Zp+OFlaDb7Xzo2p6AoJ5jTDqAhlyuQiqv/DtoQ6QUwyfaivnTHNIWjX+HN2qX1DupJK878oxWrPV9n7WLnKKTSb0KVVpiJfqsTUNvTtViNw793GADUfHjOLmSQxYudUK0QzeCT5tDtW0nTNTiONRSyoaZqK4HvsQqgNQene4vj3d3UHP7ehGMxQZD6pgiLnNSoqfCzf3hPXJfBJAZuBKGREUxcGiHcmO7vsh/R7nBnZr0YHoKCeyD2ZCAieoiW1hJhyVEllvcKoGNtXPxR97JbP2/5ZHT7MEEM1DXNCHoiIXCTJ5GGiM8BuUx9J+W8YkumV6vPR+JqHEQMXl7doYCHPqTLKF3A8rj/7Wt0261BzdEx2kywU6hnkSDEjUoIAqYx2hmFBpV4XJdTgHT8j+7rf90HmV7Pr7oVoN4QiFU2QItEqaOJxrxf4abSjGMmJb8nYgXpXfI5X+N0TvTeIozLT3NxVJITkYXt6q4xdrcok9/E0mavDQfWnsPxV3TsB7RiDcyu0vtlNhxHBc9jh/NJkkHxVfRO1eJPOvQ1yR5Y4Mdwzjxuem4wQCFx9/3Zz85K0ols12R0rppZlOvgOeL7hd/L1Jve6pqZXx1k+zw=="
}

##
# Database
##

resource "aws_security_group" "resources_portal_db" {
  name = "resources-portal_db-${var.user}-${var.stage}"
  description = "resources_portal_db-${var.user}-${var.stage}"
  vpc_id = "${aws_vpc.resources_portal_vpc.id}"

  tags {
    Name = "resources-portal-db-${var.user}-${var.stage}"
  }
}

resource "aws_security_group_rule" "resources_portal_db_outbound" {
  type = "egress"
  from_port = 0
  to_port = 65535
  protocol = "tcp"
  cidr_blocks = ["0.0.0.0/0"]
  security_group_id = "${aws_security_group.resources_portal_db.id}"
}

resource "aws_security_group_rule" "resources_portal_db_pg_tcp" {
  type = "ingress"
  from_port = 0
  to_port = 65535
  protocol = "tcp"
  source_security_group_id = "${aws_security_group.resources_portal_pg.id}"
  security_group_id = "${aws_security_group.resources_portal_db.id}"
}

##
# PGBouncer
##

resource "aws_security_group" "resources_portal_pg" {
  name = "resources-portal-pg-${var.user}-${var.stage}"
  description = "resources_portal_pg-${var.user}-${var.stage}"
  vpc_id = "${aws_vpc.resources_portal_vpc.id}"

  tags {
    Name = "resources-portal-pg-${var.user}-${var.stage}"
  }
}

resource "aws_security_group_rule" "resources_portal_pg_ssh" {
  type = "ingress"
  from_port = 22
  to_port = 22
  protocol = "tcp"
  cidr_blocks = ["0.0.0.0/0"]
  security_group_id = "${aws_security_group.resources_portal_pg.id}"
}

resource "aws_security_group_rule" "resources_portal_pg_api_tcp" {
  type = "ingress"
  from_port = "${var.database_port}"
  to_port = "${var.database_port}"
  protocol = "tcp"
  source_security_group_id = "${aws_security_group.resources_portal_api.id}"
  security_group_id = "${aws_security_group.resources_portal_pg.id}"
}

resource "aws_security_group_rule" "resources_portal_pg_api_icmp" {
  type = "ingress"
  from_port = -1
  to_port = -1
  protocol = "icmp"
  source_security_group_id = "${aws_security_group.resources_portal_api.id}"
  security_group_id = "${aws_security_group.resources_portal_pg.id}"
}


resource "aws_security_group_rule" "resources_portal_pg_outbound" {
  type = "egress"
  from_port = 0
  to_port = 65535
  protocol = "all"
  cidr_blocks = ["0.0.0.0/0"]
  ipv6_cidr_blocks = ["::/0"]
  security_group_id = "${aws_security_group.resources_portal_pg.id}"
}

##
# API
##

resource "aws_security_group" "resources_portal_api" {
  name = "resources-portal-api-${var.user}-${var.stage}"
  description = "resources-portal-api-${var.user}-${var.stage}"
  vpc_id = "${aws_vpc.resources_portal_vpc.id}"

  tags {
    Name = "resources-portal-api-${var.user}-${var.stage}"
  }
}

# XXX: THIS DEFINITELY NEEDS TO BE REMOVED LONG TERM!!!!!!!!!!
resource "aws_security_group_rule" "resources_portal_api_ssh" {
  type = "ingress"
  from_port = 22
  to_port = 22
  protocol = "tcp"
  cidr_blocks = ["0.0.0.0/0"]
  security_group_id = "${aws_security_group.resources_portal_api.id}"
}

resource "aws_security_group_rule" "resources_portal_api_http" {
  type = "ingress"
  from_port = 80
  to_port = 80
  protocol = "tcp"
  cidr_blocks = ["0.0.0.0/0"]
  security_group_id = "${aws_security_group.resources_portal_api.id}"
}

resource "aws_security_group_rule" "resources_portal_api_https" {
  type = "ingress"
  from_port = 443
  to_port = 443
  protocol = "tcp"
  cidr_blocks = ["0.0.0.0/0"]
  security_group_id = "${aws_security_group.resources_portal_api.id}"
}

resource "aws_security_group_rule" "resources_portal_api_pg" {
  type = "ingress"
  from_port = "${var.database_port}"
  to_port = "${var.database_port}"
  protocol = "tcp"
  source_security_group_id = "${aws_security_group.resources_portal_pg.id}"
  security_group_id = "${aws_security_group.resources_portal_api.id}"
}

resource "aws_security_group_rule" "resources_portal_api_outbound" {
  type = "egress"
  from_port = 0
  to_port = 0
  protocol = "all"
  cidr_blocks = ["0.0.0.0/0"]
  ipv6_cidr_blocks = ["::/0"]
  security_group_id = "${aws_security_group.resources_portal_api.id}"
}
