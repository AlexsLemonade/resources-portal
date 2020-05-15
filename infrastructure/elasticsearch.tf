data "aws_caller_identity" "current" {}
resource "aws_elasticsearch_domain" "es" {
  domain_name = "es-${var.user}-${var.stage}"
  elasticsearch_version = "6.3"

  cluster_config {
    instance_type = "${var.elasticsearch_instance_type}"
  }

  vpc_options {
      subnet_ids = [
          "${aws_subnet.resources_portal_1a.id}"
      ]
      security_group_ids = [
          "${aws_security_group.resources_portal_es.id}"
      ]
  }

  ebs_options {
      ebs_enabled = true
    # This depends on the instance type, else you'll get this error:
    #   * aws_elasticsearch_domain.es: LimitExceededException: Volume size must be between 10 and 35 for t2.medium.elasticsearch instance type and elasticsearch version 6.3
    volume_size = 10
  }

  access_policies = <<CONFIG
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "*"
      },
      "Action": "es:*",
      "Resource": "arn:aws:es:us-east-1:${data.aws_caller_identity.current.account_id}:domain/es-${var.user}-${var.stage}/*"
    }
  ]
}
  CONFIG

  snapshot_options {
      automated_snapshot_start_hour = 23
  }

  tags {
      Domain = "es-${var.user}-${var.stage}"
      Name = "es-${var.user}-${var.stage}"
  }
}

output "elasticsearch_endpoint" {
  value = "${aws_elasticsearch_domain.es.endpoint}"
}
