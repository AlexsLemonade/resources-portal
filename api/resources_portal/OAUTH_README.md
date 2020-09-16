# Three-legged ORCID OAUTH Integration

The primary method to sign in to the Resources Portal is through ORCID's OAUTH functionality.
 Within this flow, users will use two tokens to authenticate with ORCID.

## 1. Authentication Code
The first call made in the OAUTH flow is to ORCID's authentication endpoint.
This call redirects the user to ORCID's sign-in page.
The user will enter their credentials and grant "Trusted Party" access to ALSF.
ORCID will then redirect back to the Resources Portal website with an authentication code.

Call format:
``` https://orcid.org/oauth/authorize?
client_id=APP-123456789
&response_type=code
&scope=/authenticate
&redirect_uri=https://resources.alexslemonade.org/
 ```

This code has only one purpose- to be exchanged for the user's ORCID, access token, and refresh token.
It is very short-lived (a minute or two), and can only be used once.
Once we have this code, we submit it along with the redirect_uri to the /orcid-credentials endpoint, which performs the exchange.
Note the the redirect_uri submitted must match the redirect_uri in the first call.

This exchange consumes a few additional variables, provided in the project's settings:
1. The ORCID client ID
2. The ORCID client secret

## 2. Access Token

Once we have exchanged the code for the access token, we are able to request records from ORCID.
This is done as part of the /login or /create-user endpoints.
The `/login` endpoint will simply submit the access_token to ORCID to authenticate.
The `/create-user` endpoint will submit requests to ORCID to retreive the user's name and email.
These requests are done through a python-ORCID wrapper, found [here](https://github.com/ORCID/python-orcid).

# Email Visibility
As part of our account creation, we attempt to access the user's email from their ORCID record. There are three possible visibilities for their email:
1. Public
2. Trusted Parties
3. Private

If the user's email is set to Public or Trusted Parties, we can access it.
If it's Private, we cannot.

## Sandbox vs Production
ORCID supports a sandbox environment for testing and staging.
The only differences between Sandbox and Prod are seperate databases and the fact that Sandbox only support email addresses from [mailinator.com](mailinator.com), a website which allows you to access public email addresses.

## Testing Accounts

We have two established sandbox accounts which can be used for testing.

Account 1:
|----------|-----------------------------|
| Email:   | rportaltest@mailinator.com  |
| Password | PASSWORD1                   |

This account has its email preferences set to "Trusted Parties".

Account 2:
|----------|-----------------------------|
| Email:   | rportaltest2@mailinator.com |
| Password | PASSWORD1                   |


This account has its email preferences set to "Private".

## Creating Accounts

More accounts can be created very easily if needed.
To create a sandbox account, go to [sandbox.orcid.org/signin](https://sandbox.orcid.org/signin) and click "Register Now".
Fill out the form, entering an email ending in "@mailinator.com".
Next, go to [mailinator.com](mailinator.com) and search for the email address you entered in the "Enter Public Mailinator Inbox" search bar.
You should have an email confirmation from ORCID in this mailbox.
Open it and verify your email.

To change the visiblity of the email on your ORCID account, you need to manually set your preferences.
The default setting is "Private".
Sign in to your ORCID account and find the "email" box at the lower-right corner of your record.
Click the "edit" button on email, and you'll see options to edit your email visibility.
