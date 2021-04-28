resource "aws_s3_bucket" "resources_portal_bucket" {
  bucket = "resources-portal-${var.user}-${var.stage}"
  acl = "private"
  force_destroy = var.stage == "prod" ? false : true

  tags = merge(
    var.default_tags,
    {
      Name = "resources-portal-${var.user}-${var.stage}"
      Environment = var.stage
    }
  )
}
