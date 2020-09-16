# Create-Account Endpoint

The create-account endpoint is used to invite ALSF grant holders to the Resources Portal.
This endpoint can accept the user's grant information and email.
The account created by this endpoint will populate its grants and email based off of the provided parameters.

## Basic URL:
`https://resources.alexslemonade.org/create-account`

## Specifying Grants:
The user's grants must be provided for this endpoint.
Grants require a title and a funder id to be added the the system.
The title is a descriptive name for the grant.
The funder id is an ID which can be used to identify the grant, typically the ALSF grant ID.

Grants are added to the invitation url in this format:
`grant_title=title1&grant_funder_id=12345`

Multiple grants can be added in this format:
`grant_title=title1&grant_funder_id=12345&grant_title=title2&grant_funder_id=6789`

A full URL with grants would be:
`https://resources.alexslemonade.org/create-account?grant_title=title1&grant_funder_id=12345&grant_title=title2&grant_funder_id=6789`

Note: Grants are required for this endpoint.
If they are not included, the user will be redirected to the home page.

## Specifying Email:
The user's email can optionally be provided on this endpoint.
If it is not provided, the email will be retrieved from the user's ORCID record or the user will be prompted to enter an email manually.

Email is added to the invitation url in this format:
`email=myemail@host.com`

A full URL with email would be:
`https://resources.alexslemonade.org/create-account?email=myemail@host.com`

## Combining Parameters:
A full URL with both email and grants would be:
`https://resources.alexslemonade.org/create-account?email=myemail@host.com&grant_title=title1&grant_funder_id=12345&grant_title=title2&grant_funder_id=6789`
