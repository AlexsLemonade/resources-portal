resource "aws_elasticsearch_domain" "es" {
  domain_name = "rp-es-${var.user}-${var.stage}"
  elasticsearch_version = "6.8"

  cluster_config {
    instance_type = var.elasticsearch_instance_type
  }

  ebs_options {
      ebs_enabled = true
    # This depends on the instance type, else you'll get this error:
    #   * aws_elasticsearch_domain.es: LimitExceededException: Volume size must be between 10 and 35 for t2.medium.elasticsearch instance type and elasticsearch version 6.3
    volume_size = 10
  }

#   access_policies = <<CONFIG
# {
#   "Version": "2012-10-17",
#   "Statement": [
#     {
#       "Effect": "Allow",
#       "Principal": {
#         "AWS": "*"
#       },
#       "Action": "es:*",
#       "Resource": "arn:aws:es:us-east-1:${data.aws_caller_identity.current.account_id}:domain/rp-es-${var.user}-${var.stage}/*"
#     }
#   ]
# }
#   CONFIG

  snapshot_options {
      automated_snapshot_start_hour = 23
  }

  tags =  merge(
    var.default_tags,
    {
      Domain = "resources-portal-es-${var.user}-${var.stage}"
      Name = "resources-portal-es-${var.user}-${var.stage}"
    }
  )
}

resource "aws_elasticsearch_domain_policy" "main" {
  domain_name = aws_elasticsearch_domain.es.domain_name
  depends_on = [aws_iam_role.resources_portal_instance, aws_elasticsearch_domain.es]

  access_policies = <<POLICIES
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Action": "es:*",
            "Principal":  {
                "AWS": ["${aws_iam_role.resources_portal_instance.arn}"]
            },
            "Effect": "Allow",
            "Resource": "${aws_elasticsearch_domain.es.arn}/*"
        }
    ]
}
POLICIES
}


output "elasticsearch_endpoint" {
  value = aws_elasticsearch_domain.es.endpoint
}
