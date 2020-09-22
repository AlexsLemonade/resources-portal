"""This is a configuration dict for all the different types of frontend notifications.

It works similarly to
resources_portal.models.email_notifications_config.EMAIL_NOTIFICATIONS. See
the docstring in that file for how it works.
"""

FRONTEND_NOTIFICATIONS = {
    "MATERIAL_REQUEST_SHARER_ASSIGNED_NEW": {
        "body": "You have been assigned to a new [request](request) for [material_name]().",
    },
    "MATERIAL_REQUEST_SHARER_RECEIVED": {
        "body": "[organization_name]() received a new [request](request) received for [material_name]().",
    },
    "MATERIAL_REQUEST_SHARER_ASSIGNED": {
        "body": "You have been assigned to a request for [material_name]() from {requester_name}.",
    },
    "MATERIAL_REQUEST_SHARER_ASSIGNMENT": {
        "body": "{other_name} has been assigned to a request for [material_name]() from {requester_name}",
    },
    "MATERIAL_REQUEST_SHARER_APPROVED": {
        "body": (
            "{you_or_other_name_upper} accepted a [request](request) for [material_name]() from {requester_name}."
            "Waiting for {requester_name} to provide the following information: {required_info_plain}"
        ),
    },
    "MATERIAL_REQUEST_SHARER_REJECTED": {
        "body": (
            "{you_or_other_name_upper} rejected a request for"
            " [material_name]() for the below reason: {rejection_reason}."
        ),
    },
    "MATERIAL_REQUEST_SHARER_CANCELLED": {
        "body": "{requester_name} cancelled a request for [material_name]().",
    },
    "MATERIAL_REQUEST_SHARER_RECEIVED_INFO": {
        "body": "{requester_name} provided the following required items for a request for [material_name](): {provided_info_plain}",
    },
    "MATERIAL_REQUEST_SHARER_RECEIVED_MTA": {
        "body": (
            "{requester_name} provided the following additional documents for a [request](request) for"
            " [material_name]()\n - MTA signed by {requester_name}."
            "\nPlease sign and upload the fully executed MTA."
        ),
    },
    "MATERIAL_REQUEST_SHARER_EXECUTED_MTA": {
        "body": (
            "{you_or_other_name_upper} uploaded the fully executed MTA for a request for"
            " [material_name]() from {requester_name}."
            "\nPlease make arrangements to send the {material_category} to {requester_name}."
        ),
    },
    "MATERIAL_REQUEST_SHARER_IN_FULFILLMENT": {
        "body": (
            "{you_or_other_name_upper} accepted a request for [material_name]() from {requester_name}."
        ),
    },
    "MATERIAL_REQUEST_SHARER_FULFILLED": {
        "body": (
            "{you_or_other_name_upper} marked a request for [material_name]()"
            " from {requester_name} as Fulfilled."
        ),
    },
    "MATERIAL_REQUEST_SHARER_VERIFIED": {
        "body": "{requester_name} confirmed receipt of [material_name]().",
    },
    "MATERIAL_REQUEST_ISSUE_SHARER_REPORTED": {
        "body": (
            "{requester_name} has reported an issue with a fulfilled request for"
            " [material_name]().\n{issue_description}"
        )
    },
    "MATERIAL_REQUEST_REQUESTER_ACCEPTED": {
        "body": (
            "[organization_name]() has accepted your request for [material_name]() "
            "on the condition that you provide the following items: {required_info_plain}"
        )
    },
    "MATERIAL_REQUEST_REQUESTER_IN_FULFILLMENT": {
        "body": (
            "[organization_name]() has accepted your request for"
            " [material_name]() and is working to fulfill your request."
        )
    },
    "MATERIAL_REQUEST_REQUESTER_EXECUTED_MTA": {
        "body": (
            "[organization_name]() has uploaded the fully executed MTA for your request for"
            " [material_name]() and is working to fulfill your request."
        ),
    },
    "MATERIAL_REQUEST_REQUESTER_FULFILLED": {
        "body": (
            "[organization_name]() marked your request for"
            " [material_name]() as fulfilled.\nPlease view fulfilment notes for details."
        )
    },
    "MATERIAL_REQUEST_REQUESTER_REJECTED": {
        "body": (
            "[organization_name]() rejected your request for [material_name]() "
            "for the below reason:\n{rejection_reason}"
        )
    },
    "MATERIAL_REQUEST_REQUESTER_CANCELLED": {
        "body": "You cancelled your request for [material_name]().",
    },
    "MATERIAL_REQUEST_REQUESTER_ESCALATED": {
        "body": (
            "Request for {material_category}, [material_name]() has been"
            " escalated to the grants team.\n"
            "ALSF Grants team is looking into this and will be in touch with you soon.\n"
            "Below is the message they received from you for your records.\n{message}"
        )
    },
    "MATERIAL_ADDED": {
        "body": ("{other_name} added a new [material_name]() to [organization_name]()."),
    },
    "MATERIAL_ARCHIVED": {
        "body": ("{other_name} archived [material_name]() from [organization_name]().")
    },
    "MATERIAL_DELETED": {
        "body": ("{other_name} deleted [material_name]() from [organization_name]()."),
    },
    "ORGANIZATION_NEW_MEMBER": {"body": "{other_name} was added to [organization_name]().",},
    "ORGANIZATION_BECAME_OWNER": {
        "body": (
            "{other_name} has made you the owner of [organization_name]()."
            "\nYou can now add new team members and remove members and resources."
        ),
    },
    "ORGANIZATION_NEW_OWNER": {"body": "{other_name} is now the owner of [organization_name]().",},
    "ORGANIZATION_MEMBER_LEFT": {"body": "{other_name} left [organization_name]().",},
    "ORGANIZATION_NEW_GRANT": {
        "body": (
            "{other_name} linked a new grant {grant_name} with [organization_name]()."
            "\nTeam members can now add resources associated with the grant."
        )
    },
    "ORGANIZATION_INVITE": {
        "body": "{organization_owner} has added you to their team, [organization_name]().",
    },
    "REPORT_TO_GRANTS_TEAM": {
        "body": (
            "Your issue has been reported to the ALSF Grants Team.\n"
            "They are looking into this and will be in touch with you soon.\n"
            "Below is the message they received from you for your records.\n\n{message}"
        ),
    },
}
