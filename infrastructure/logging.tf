# This is the group. All of the streams belong to this.
resource "aws_cloudwatch_log_group" "resources_portal_log_group" {
  name = "resources-portal-log-group-${var.user}-${var.stage}"

  tags {
    Name = "resources-portal-log-group-${var.user}-${var.stage}"
  }
}

##
# Streams
##

resource "aws_cloudwatch_log_stream" "log_stream_api" {
  name           = "log-stream-api-${var.user}-${var.stage}"
  log_group_name = "${aws_cloudwatch_log_group.resources_portal_log_group.name}"
}

resource "aws_cloudwatch_log_stream" "log_stream_api_nginx_access" {
  name           = "log-stream-api-nginx-access-${var.user}-${var.stage}"
  log_group_name = "${aws_cloudwatch_log_group.resources_portal_log_group.name}"
}

resource "aws_cloudwatch_log_stream" "log_stream_api_nginx_error" {
  name           = "log-stream-api-nginx-error-${var.user}-${var.stage}"
  log_group_name = "${aws_cloudwatch_log_group.resources_portal_log_group.name}"
}
