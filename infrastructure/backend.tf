terraform {
  backend "s3" {
    # Terraform will prompt the user for the other keys.
    region = "us-east-1"
    bucket = "resources-portal-tfstate-${var.stage}"
    key = "terraform-${var.user}.tfstate"
    encrypt = true
  }
}
