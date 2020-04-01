The test data describes the following situation:

There are three users:
- PrimaryProf
- PostDoc
- SecondaryProf

There are fours organizations which have these users as members:
- PrimaryLab, owned by PrimaryProf
- PrimaryProfPersonalOrg, owned by PrimaryProf with PostDoc as a member
- PostDocOrg, owned by PostDoc
- SecondaryProfOrg, owned by SecondaryProf

There are two grants:
- A grant for melanoma research, given to PrimaryProf
- A grant for tumor growth research, given to SecondaryProf

There are eight materials:
	Four contributed by PrimaryProf:
	- A Plasmid
	- A Protocol
	- A Model Organism (zebrafish)
	- A Model Organism (mouse)

	Four contributed by SecondaryProf:
    - A Stone Tablet (using the "other" template)
	- A Cell Line
	- A Dataset
	- A PDX

There are the following permission groups:
- Admin
- User

The users are in the following groups:
- PrimaryProf: Admin
- SecondaryProf: Admin
- PostDoc: User

The following notifcation settings are in place:
- PrimaryProf: all notifcations off for PrimaryLab, all notifcations on for PrimaryProfPersonalOrg
- PostDoc: all notifications on for PrimaryLab, all notifcations except reminders on for PostDocOrg
- SecondaryProf: all notifcations on for SecondaryProfOrg

The protocol was requested by SecondaryProf and transferred to him by PostDoc.


