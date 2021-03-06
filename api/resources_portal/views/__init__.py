from resources_portal.views.address import AddressViewSet
from resources_portal.views.attachment import (
    AttachmentViewSet,
    attachment_copy_view,
    local_file_view,
)
from resources_portal.views.document_views import (
    MaterialDocumentView,
    OrganizationDocumentView,
    UserDocumentView,
)
from resources_portal.views.email_invitation import email_invitation_view
from resources_portal.views.fulfillment_note import FulfillmentNoteViewSet
from resources_portal.views.grant import GrantViewSet
from resources_portal.views.grant_material import GrantMaterialViewSet
from resources_portal.views.import_materials import ImportViewSet
from resources_portal.views.login import LoginViewSet
from resources_portal.views.material import MaterialViewSet
from resources_portal.views.material_request import MaterialRequestViewSet
from resources_portal.views.material_request_issue import MaterialRequestIssueViewSet
from resources_portal.views.notification import NotificationViewSet
from resources_portal.views.orcid_credentials import ORCIDCredentialsViewSet
from resources_portal.views.organization import OrganizationViewSet
from resources_portal.views.organization_grant import OrganizationGrantViewSet
from resources_portal.views.organization_invitations import OrganizationInvitationViewSet
from resources_portal.views.organization_material import OrganizationMaterialViewSet
from resources_portal.views.organization_member import OrganizationMemberViewSet
from resources_portal.views.organization_user_setting import OrganizationUserSettingViewSet
from resources_portal.views.report_issue import report_issue_view
from resources_portal.views.shipping_requirement import ShippingRequirementViewSet
from resources_portal.views.user import UserViewSet
from resources_portal.views.user_organizations import UserOrganizationViewSet
