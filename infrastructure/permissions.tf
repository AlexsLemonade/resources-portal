# The configuration contained in this file specifies AWS IAM roles and
# permissions.

data "aws_caller_identity" "current" {}

resource "aws_iam_role" "resources_portal_instance" {
  name = "resources-portal-instance-${var.user}-${var.stage}"

  # Policy text found at:
  # http://docs.aws.amazon.com/AmazonECS/latest/developerguide/instance_IAM_role.html
  assume_role_policy = <<EOF
{
  "Version": "2008-10-17",
  "Statement": [
    {
      "Sid": "",
      "Effect": "Allow",
      "Principal": {
        "Service": ["ec2.amazonaws.com"]
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
}

resource "aws_iam_instance_profile" "resources_portal_instance_profile" {
  name  = "resources-portal-instance-profile-${var.user}-${var.stage}"
  role = "${aws_iam_role.resources_portal_instance.name}"
}

resource "aws_iam_policy" "cloudwatch_policy" {
  name = "resources-portal-cloudwatch-policy-${var.user}-${var.stage}"
  description = "Allows Cloudwatch Permissions."


  # Policy text found at:
  # http://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/iam-identity-based-access-control-cwl.html

  # Log streams are created dynamically by Nomad, so we give permission to the entire group
  policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents",
                "logs:DescribeLogStreams",
                "cloudwatch:GetMetricStatistics",
                "cloudwatch:ListMetrics",
                "cloudwatch:PutMetricAlarm",
                "cloudwatch:PutMetricData",
                "cloudwatch:SetAlarmState"
            ],
            "Resource": [
              "arn:aws:logs:${var.region}:${data.aws_caller_identity.current.account_id}:log-group:${aws_cloudwatch_log_group.resources_portal_log_group.name}:*"
            ]
        }
    ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "cloudwatch" {
  role = "${aws_iam_role.resources_portal_instance.name}"
  policy_arn = "${aws_iam_policy.cloudwatch_policy.arn}"
}
