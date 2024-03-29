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

resource "aws_s3_bucket" "resources_portal_cert_bucket" {
  bucket = "resources-portal-cert-${var.user}-${var.stage}"
  acl = "private"
  force_destroy = var.stage == "prod" ? false : true

  lifecycle_rule {
    id = "auto-delete-after-30-days-${var.user}-${var.stage}"
    prefix = ""
    enabled = true
    abort_incomplete_multipart_upload_days = 1

    expiration {
      days = 30
    }
  }

  tags = merge(
    var.default_tags,
    {
      Name = "resources-portal-cert-${var.user}-${var.stage}"
      Environment = var.stage
    }
  )
}

resource "aws_s3_bucket_public_access_block" "resources_portal_cert_bucket" {
  bucket = aws_s3_bucket.resources_portal_cert_bucket.id

  block_public_acls   = true
  block_public_policy = true
}
