"""This is a configuration dict for all the different types of notifications.

This dict is used by the Notification model to create email text based
on a notification type. It's also used to determine who to create
notifications for and who to send them to.

The `subject`, `body`, and `plain_text_email` email keys will be
formatted with properties in Notfication.get_email_dict(). If a new
notification type needs additional properties, make sure to define
them in that method.

The `required_associations` lists fields of Notification which will be
needed for this type of notification. These will be validated by a
pre_save hook to make sure a Notification has all the associations
needed to format its messages.

CTA_link_field is the field that will be used to get the link to
provide in the Call To Action button in the email. It should be
included in `required_associations` and it must have a `frontend_url`
property which is the link to the resource's page in the frontend.

CTA is the text for the Call to Action button.

always_send will make the notification send regardless of user settings.

send_to_organization -- if True the notifier will create one
Notification instance per member of the organization.

send_to_primary_user -- if False the notifier will not create a
notification for the primary_user. Can be used in conjunction with
send_to_organziation to send messages to the rest of user's
organization but not the user themself.

send_to_associated_user -- If False will exclude the associated
user from associated_organization.members if send_to_organziation is
True.
"""
NOTIFICATIONS = {
    "MATERIAL_REQUEST_SHARER_ASSIGNED_NEW": {
        "subject": "You are assigned to a new request",
        "body": "You have been assigned to a new request for {material_category}, .",
        "CTA": "View Request",
        "CTA_link_field": "associated_material_request",
        "plain_text_email": (
            "{your_name},\nYou have been assigned to a new request for {material_category}, "
            " {material_name}.\n\nView request details ({request_url})"
        ),
        "required_associations": [
            "associated_user",
            "associated_material",
            "associated_material_request",
            "associated_organization",
        ],
    },
    "MATERIAL_REQUEST_SHARER_RECEIVED": {
        "subject": "{organization_name}: New Request for {material_category}",
        "body": "{organization_name} received a new request received for {material_category} {material_name}.",
        "CTA": "View Request",
        "CTA_link_field": "associated_material_request",
        "plain_text_email": (
            "{your_name},\n {organization_name} received a new request received for {material_category},"
            " {material_name}.\n\nView request details ({request_url})"
        ),
        "required_associations": [
            "associated_user",
            "associated_material",
            "associated_material_request",
            "associated_organization",
        ],
        "send_to_organization": True,
        "send_to_primary_user": False,
    },
    "MATERIAL_REQUEST_SHARER_ASSIGNED": {
        "subject": "{organization_name}: You are assigned to a request for {material_category}",
        "body": "You have been assigned to a request for {material_category}, {material_name} from {requester_name}.",
        "CTA": "View Request",
        "CTA_link_field": "associated_material_request",
        "plain_text_email": (
            "{your_name},\nYou have been assigned to a request for {material_category},"
            " {material_name} from {requester_name}.\n\nView request details ({request_url})"
        ),
        "required_associations": [
            "associated_user",
            "associated_material",
            "associated_material_request",
            "associated_organization",
        ],
    },
    "MATERIAL_REQUEST_SHARER_ASSIGNMENT": {
        "subject": "{other_name} assigned to request for {material_category}",
        "body": "{other_name} has been assigned to a request for {material_category}, {material_name} from {requester_name}",
        "CTA": "View Request",
        "CTA_link_field": "associated_material_request",
        "plain_text_email": (
            "{your_name},\n{other_name} has been assigned to a request for {material_category},"
            " {material_name} from {requester_name}.\n\nView request details ({request_url})"
        ),
        "required_associations": [
            "associated_user",
            "associated_material",
            "associated_material_request",
            "associated_organization",
        ],
        "send_to_organization": True,
        "send_to_primary_user": False,
    },
    "MATERIAL_REQUEST_SHARER_APPROVED": {
        "subject": "Request for {material_category} accepted",
        "body": (
            "{you_or_other_name_upper} accepted a request for {material_category}, {material_name} from {requester_name}."
            "Waiting for {requester_name} to provide the following information:<br>{required_info_html}"
        ),
        "CTA": "View Request",
        "CTA_link_field": "associated_material_request",
        "plain_text_email": (
            "{your_name},\n{you_or_other_name} accepted a request for {material_category}, {material_name} from {requester_name}."
            "\nWaiting for {requester_name} to provide the following information:\n{required_info_plain}:"
            "\n\nView request details ({request_url})"
        ),
        "required_associations": [
            "associated_user",
            "associated_material",
            "associated_material_request",
            "associated_organization",
        ],
        "send_to_organization": True,
    },
    "MATERIAL_REQUEST_SHARER_REJECTED": {
        "subject": "Request for {material_category} rejected",
        "body": (
            "{you_or_other_name_upper} rejected a request for {material_category},"
            " {material_name} for the below reason:<br>{rejection_reason}"
        ),
        "CTA": "View Request",
        "CTA_link_field": "associated_material_request",
        "plain_text_email": (
            "{your_name},\n{you_or_other_name} rejected a request for {material_category},"
            " {material_name} for the below reason:\n{rejection_reason}"
            "\n\nView request details ({request_url})"
        ),
        "required_associations": [
            "associated_user",
            "associated_material",
            "associated_material_request",
            "associated_organization",
        ],
        "send_to_organization": True,
    },
    "MATERIAL_REQUEST_SHARER_CANCELLED": {
        "subject": "Request for {material_category} cancelled",
        "body": "{requester_name} cancelled a request for {material_category}, {material_name}.",
        "CTA": "View Request",
        "CTA_link_field": "associated_material_request",
        "plain_text_email": (
            "{your_name},\n{requester_name} cancelled a request for {material_category},"
            " {material_name}\n\nView request details ({request_url})"
        ),
        "required_associations": [
            "associated_user",
            "associated_material",
            "associated_material_request",
            "associated_organization",
        ],
        "send_to_organization": True,
    },
    "MATERIAL_REQUEST_SHARER_RECEIVED_INFO": {
        "subject": "Action Required: Received additional information from {requester_name}",
        "body": "{requester_name} provided the following required items for a request for {material_category}, {material_name}:<br>{provided_info_html}",
        "CTA": "Review Items",
        "CTA_link_field": "associated_material_request",
        "plain_text_email": (
            "{your_name},\n{requester_name} provided the following required items for a request for"
            " {material_category}, {material_name}:\n{provided_info_plain}\n\nReview items ({request_url})."
        ),
        "required_associations": [
            "associated_user",
            "associated_material",
            "associated_material_request",
            "associated_organization",
        ],
        "send_to_organization": True,
    },
    "MATERIAL_REQUEST_SHARER_RECEIVED_MTA": {
        "subject": "Action Required: Request for {material_category}",
        "body": (
            "{requester_name} provided the following additional documents for a request for"
            " {material_category}{material_name}\n - MTA signed by {requester_name}"
            "\nPlease sign and upload the fully executed MTA."
        ),
        "CTA": "Upload Fully Executed MTA",
        "CTA_link_field": "associated_material_request",
        "plain_text_email": (
            "{your_name},\n{requester_name} provided the following additional documents"
            " for a request for {material_category}, {material_name}"
            "\n- MTA signed by {requester_name} \nPlease sign and upload the requester signed MTA."
            "\n\nUpload fully executed MTA. ({request_url})."
        ),
        "attachments": ["MATERIAL_REQUESTER_SIGNED_MTA"],
        "required_associations": [
            "associated_user",
            "associated_material",
            "associated_material_request",
            "associated_organization",
        ],
        "send_to_organization": True,
    },
    "MATERIAL_REQUEST_SHARER_EXECUTED_MTA": {
        "subject": "Uploaded executed MTA for request for {material_category}",
        "body": (
            "{you_or_other_name_upper} uploaded the fully executed MTA for a request for"
            " {material_category}, {material_name} from {requester_name}."
            "\nPlease make arrangements to send the {material_category} to {requester_name}."
        ),
        "CTA": "View Request",
        "CTA_link_field": "associated_material_request",
        "plain_text_email": (
            "{your_name},\n{you_or_other_name} uploaded the fully executed MTA"
            " for a request for {material_category}, {material_name} from {requester_name}."
            "\n\nView request details. ({request_url})."
        ),
        "required_associations": [
            "associated_user",
            "associated_material",
            "associated_material_request",
            "associated_organization",
        ],
        "send_to_organization": True,
    },
    "MATERIAL_REQUEST_SHARER_IN_FULFILLMENT": {
        "subject": "Request for {material_category} accepted",
        "body": (
            "{you_or_other_name_upper} accepted a request for {material_category}, {material_name} from {requester_name}."
        ),
        "CTA": "View Request",
        "CTA_link_field": "associated_material_request",
        "plain_text_email": (
            "{your_name},\n{you_or_other_name} accepted a request for {material_category}, {material_name} from {requester_name}."
            "Please make arrangements to send the {material_category} to {requester_name}."
            "\n\nView request details ({request_url})"
        ),
        "required_associations": [
            "associated_user",
            "associated_material",
            "associated_material_request",
            "associated_organization",
        ],
        "send_to_organization": True,
    },
    "MATERIAL_REQUEST_SHARER_FULFILLED": {
        "subject": "Fulfilled: Request for {material_category}",
        "body": (
            "{you_or_other_name_upper} marked a request for {material_category}, {material_name}"
            " from {requester_name} as Fulfilled."
        ),
        "CTA": "View Request",
        "CTA_link_field": "associated_material_request",
        "plain_text_email": (
            "{your_name},\n{you_or_other_name} marked a request for {material_category},"
            " {material_name} from {requester_name} as Fulfilled."
            "\n\nView request details. ({request_url})."
        ),
        "required_associations": [
            "associated_user",
            "associated_material",
            "associated_material_request",
            "associated_organization",
        ],
        "send_to_organization": True,
    },
    "MATERIAL_REQUEST_SHARER_VERIFIED": {
        "subject": "{requester_name} received {material_category}",
        "body": "{requester_name} confirmed receipt of {material_category}, {material_name}.",
        "CTA": "View Request",
        "CTA_link_field": "associated_material_request",
        "plain_text_email": "{your_name},\n{requester_name} confirmed receipt of {material_category}, {material_name}.",
        "required_associations": [
            "associated_user",
            "associated_material",
            "associated_material_request",
            "associated_organization",
        ],
        "send_to_organization": True,
    },
    "MATERIAL_REQUEST_ISSUE_SHARER_REPORTED": {
        "subject": "Issue reported: Request for {material_category}",
        "body": (
            "{requester_name} has reported an issue with a fulfilled request for"
            " {material_category}, {material_name}.\n{issue_description}"
        ),
        "CTA": "View Request",
        "CTA_link_field": "associated_material_request",
        "plain_text_email": (
            "{your_name},\n{requester_name} has reported an issue with a fulfilled request for"
            " {material_category}, {material_name}.\n{issue_description}"
            "\n\nView request details. ({request_url})."
        ),
        "required_associations": [
            "associated_user",
            "associated_material",
            "associated_material_request",
            "associated_material_request_issue",
            "associated_organization",
        ],
        "send_to_organization": True,
        "send_to_associated_user": False,
    },
    "MATERIAL_REQUEST_REQUESTER_ACCEPTED": {
        "subject": "Action required: Request for {material_category} accepted",
        "body": (
            "{organization_name} has accepted your request for {material_category}, {material_name} "
            "on the condition that you provide the following items:<br>{required_info_html}"
        ),
        "CTA": "Provide Additional Items",
        "CTA_link_field": "associated_material_request",
        "plain_text_email": (
            "{your_name},\n{organization_name} has accepted your request for {material_category}, {material_name} "
            "on the condition that you provide the following items:\n{required_info_plain}"
            "\n\nProvide Additional Items. ({request_url})."
        ),
        "attachments": ["MATERIAL_REQUESTER_SIGNED_MTA"],
        "required_associations": [
            "associated_user",
            "associated_material",
            "associated_material_request",
            "associated_organization",
        ],
    },
    "MATERIAL_REQUEST_REQUESTER_IN_FULFILLMENT": {
        "subject": "In fulfillment: Request for {material_category} accepted",
        "body": (
            "{organization_name} has accepted your request for {material_category},"
            " {material_name} and is working to fulfill your request."
        ),
        "CTA": "View Request",
        "CTA_link_field": "associated_material_request",
        "plain_text_email": (
            "{your_name},\n{organization_name} has accepted your request for {material_category},"
            " {material_name} and is working to fulfill your request."
            "\n\nView request details. ({request_url})."
        ),
        "required_associations": [
            "associated_user",
            "associated_material",
            "associated_material_request",
            "associated_organization",
        ],
    },
    "MATERIAL_REQUEST_REQUESTER_EXECUTED_MTA": {
        "subject": "Executed MTA uploaded for request for {material_category}",
        "body": (
            "{organization_name} has uploaded the fully executed MTA for your request for"
            " {material_category}, {material_name} and is working to fulfill your request."
        ),
        "CTA": "View Request",
        "CTA_link_field": "associated_material_request",
        "plain_text_email": (
            "{your_name},\n{organization_name} has uploaded the fully executed MTA for your"
            " request for {material_category}, {material_name} and is working to fulfill your request."
            "\n\nView request details. ({request_url})."
        ),
        "attachments": ["MATERIAL_EXECUTED_MTA"],
        "required_associations": [
            "associated_user",
            "associated_material",
            "associated_material_request",
            "associated_organization",
        ],
    },
    "MATERIAL_REQUEST_REQUESTER_FULFILLED": {
        "subject": "Fulfilled: Request for {material_category}",
        "body": (
            "{organization_name} marked your request for {material_category},"
            " {material_name} as fulfilled.\nPlease view fulfilment notes for details."
        ),
        "CTA": "View Fulfillment Notes",
        "CTA_link_field": "associated_material_request",
        "plain_text_email": (
            "{your_name},\n{organization_name} marked your request for {material_category},"
            " {material_name} as fulfilled.\nPlease view fulfilment notes for details. "
            "\n\nView fulfillment notes. ({request_url})."
        ),
        "required_associations": [
            "associated_user",
            "associated_material",
            "associated_material_request",
            "associated_organization",
        ],
    },
    "MATERIAL_REQUEST_REQUESTER_REJECTED": {
        "subject": "Request for {material_category} rejected",
        "body": (
            "{organization_name} rejected your request for {material_category}, {material_name} "
            "for the below reason:<br>{rejection_reason}"
        ),
        "CTA": "View Request",
        "CTA_link_field": "associated_material_request",
        "plain_text_email": (
            "{your_name},\n{organization_name} rejected your request for"
            " {material_category}, {material_name} for the below reason:\n{rejection_reason}"
            "\n\nView request details. ({request_url})."
        ),
        "required_associations": [
            "associated_user",
            "associated_material",
            "associated_material_request",
            "associated_organization",
        ],
    },
    "MATERIAL_REQUEST_REQUESTER_CANCELLED": {
        "subject": "Request for {material_category} cancelled",
        "body": "You cancelled your request for {material_category}, {material_name}.",
        "CTA": "View Request",
        "CTA_link_field": "associated_material_request",
        "plain_text_email": (
            "You cancelled your request for {material_category}, {material_name}."
            "\n\nView request details. ({request_url})."
        ),
        "required_associations": [
            "associated_user",
            "associated_material",
            "associated_material_request",
            "associated_organization",
        ],
    },
    "MATERIAL_REQUEST_REQUESTER_ESCALATED": {
        "subject": "Request for {material_category} escalated",
        "body": (
            "Request for {material_category}, {material_name} has been"
            " escalated to the grants team.<br>"
            "ALSF Grants team is looking into this and will be in touch with you soon.<br>"
            "Below is the message they received from you for your records.<br><br>{message}"
        ),
        "plain_text_email": (
            "{your_name},\n Request for {material_category}, {material_name} has been escalated"
            " to the grants team.\n"
            "ALSF Grants team is looking into this and will be in touch with you soon.\n"
            "Below is the message they received from you for your records.\n\n{message}"
        ),
        "required_associations": [
            "associated_user",
            "associated_material",
            "associated_material_request",
            "associated_organization",
        ],
    },
    "MATERIAL_ADDED": {
        "subject": "{organization_name}: New {material_category} added",
        "body": (
            "{other_name} added a new {material_category}, {material_name} to {organization_name}."
        ),
        "CTA": "View Resource",
        "CTA_link_field": "associated_material",
        "plain_text_email": (
            "{your_name},\n{other_name} added a new {material_category}, {material_name} to {organization_name}."
            "\n\nView resource. ({material_url})."
        ),
        "required_associations": [
            "associated_user",
            "associated_material",
            "associated_organization",
        ],
        "send_to_organization": True,
    },
    "MATERIAL_ARCHIVED": {
        "subject": "{organization_name}: {material_category} archived",
        "body": (
            "{other_name} archived {material_category}, {material_name} from {organization_name}."
        ),
        "CTA": "View Archived Resource",
        "CTA_link_field": "associated_material",
        "plain_text_email": (
            "{your_name},\n{other_name} archived {material_category}, {material_name} from {organization_name}."
            "\n\nView archived resource. ({material_url})."
        ),
        "required_associations": [
            "associated_user",
            "associated_material",
            "associated_organization",
        ],
        "send_to_organization": True,
    },
    "MATERIAL_DELETED": {
        "subject": "{organization_name}:{material_category} deleted",
        "body": (
            "{other_name} deleted {material_category}, {material_name} from {organization_name}."
        ),
        # TODO: Remove this CTA and make the button something that is
        # only added if this field is present.
        "CTA": "YOU CAN'T DO ANYTHING ABOUT IT!",
        "CTA_link_field": "associated_material",
        "plain_text_email": (
            "{your_name},\n{other_name} deleted {material_category},"
            " {material_name} from {organization_name}."
        ),
        "required_associations": [
            "associated_user",
            "associated_material",
            "associated_organization",
        ],
        "send_to_organization": True,
    },
    "ORGANIZATION_NEW_MEMBER": {
        "subject": "{organization_name}: New member added",
        "body": "{other_name} was added to {organization_name}.",
        "CTA": "View Members",
        "CTA_link_field": "associated_organization",
        "plain_text_email": (
            "{your_name},\n{other_name} was added to {organization_name}."
            "\n\nView members. ({organization_url})."
        ),
        "required_associations": ["associated_user", "associated_organization",],
        "send_to_organization": True,
        "send_to_primary_user": False,
    },
    "ORGANIZATION_BECAME_OWNER": {
        "subject": "{organization_name}: You have been made owner",
        "body": (
            "{other_name} has made you the owner of {organization_name}."
            "\nYou can now add new team members and remove members and resources."
        ),
        "CTA": "Manage Team",
        "CTA_link_field": "associated_organization",
        "plain_text_email": (
            "{your_name},\n{other_name} was added to {organization_name}."
            "\n\nManage team. ({organization_url})."
        ),
        "required_associations": ["associated_user", "associated_organization",],
        "always_send": True,
    },
    "ORGANIZATION_NEW_OWNER": {
        "subject": "{organization_name}: New owner",
        "body": "{other_name} is now the owner of {organization_name}.",
        "CTA": "View Team",
        "CTA_link_field": "associated_organization",
        "plain_text_email": (
            "{your_name},\n{other_name} is now the owner of {organization_name}."
            "\n\nView team. ({organization_url})."
        ),
        "required_associations": ["associated_user", "associated_organization",],
        "send_to_organization": True,
        "send_to_associated_user": False,
    },
    "ORGANIZATION_MEMBER_LEFT": {
        "subject": "{organization_name}: Member left team",
        "body": "{other_name} left {organization_name}.",
        "CTA": "None?",
        "CTA_link_field": "associated_organization",
        "plain_text_email": "{your_name},\n{other_name} left {organization_name}",
        "required_associations": ["associated_user", "associated_organization",],
        "send_to_organization": True,
    },
    "ORGANIZATION_NEW_GRANT": {
        "subject": "{organization_name}: New grant linked",
        "body": (
            "{other_name} linked a new grant {grant_name} with {organization_name}."
            "\nTeam members can now add resources associated with the grant."
        ),
        "CTA": "View Team Grants",
        "CTA_link_field": "associated_organization",
        "plain_text_email": (
            "{your_name},{other_name} linked a new grant {grant_name} with {organization_name}. "
            "\nTeam members can now add resources associated with the grant."
            "\n\nView team grants. ({organization_url})."
        ),
        "required_associations": ["associated_user", "associated_organization",],
        "send_to_organization": True,
    },
    "ORGANIZATION_INVITE": {
        "subject": "You have been added to {organization_name}",
        "body": "{organization_owner} has added you to their team, {organization_name}.",
        "CTA": "View Team",
        "CTA_link_field": "associated_organization",
        "plain_text_email": (
            "{your_name},{organization_owner} has added you to their team, {organization_name}."
            "\n\nView team. ({organization_url})."
        ),
        "required_associations": ["associated_user", "associated_organization",],
        "always_send": True,
    },
    "REPORT_TO_GRANTS_TEAM": {
        "subject": "Issue reported to Grants team",
        "body": (
            "Your issue has been reported to the ALSF Grants Team.<br>"
            "They are looking into this and will be in touch with you soon.<br>"
            "Below is the message they received from you for your records.<br><br>{message}"
        ),
        "plain_text_email": (
            "{your_name},\n Your issue has been reported to the ALSF Grants Team.\n"
            "They are looking into this and will be in touch with you soon.\n"
            "Below is the message they received from you for your records.\n\n{message}"
        ),
        "required_associations": ["associated_user"],
    },
}
