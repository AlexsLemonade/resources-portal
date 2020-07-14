The test data can be imported with the following command:

```
rportal populate-db
```

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

The members of each organization have the relevant permissions for their status in the organization, as shown below:

                      |PrimaryProf |PostDoc     |SecondaryProf
----------------------|------------|----------- |--------------
PrimaryLab            |Owner Perms |Member Perms|None
PrimaryProfPersonalOrg|Owner Perms |None        |None
PostDocOrg            |None        |Owner Perms |None
SecondaryProfOrg      |None        |None        |Owner Perms

There are two grants:
- A grant for melanoma research, owned by PrimaryProf
- A grant for tumor growth research, co-owned by PrimaryProf and SecondaryProf

There are seventeen materials:
	Eight listed materials (four of which require an MTA):
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

	And nine imported materials:
	- an Imported Dataset
	- an Imported GEO/SRA Dataset
	- an Imported dbGaP Dataset
	- an Imported Protocol
	- an Imported AddGene Plasmid
	- an Jackson Labs Imported Model Organism
	- an ATCC Imported Cell Line
	- a ZIRC Imported Mouse Model Organism
	- an Imported Stone Tablet (Other)

The following notifcation settings are in place:
- PrimaryProf: all notifcations off for PrimaryLab, all notifcations on for PrimaryProfPersonalOrg
- PostDoc: all notifications on for PrimaryLab, all notifcations except reminders on for PostDocOrg
- SecondaryProf: all notifcations on for SecondaryProfOrg

The PrimProf's protocol was requested by SecondaryProf and transferred to him by PostDoc.

There are four orgainzation invitations:
- A pending request from PrimProf to join SecondaryProfOrg, managed by SecProf
- A accepted request for PostDoc to join PrimaryLab, managed by PrimProf
- A rejected request for SecProf to join PrimaryLab, managed by PrimProf
- A invalid request for SecProf to join PrimaryLab, managed by PostDoc. This would have become invalid because PostDoc lost permissions to invite/approve requests to join the organizations

There are five notifications:
- A notification to SecProf that PrimProf would like to join his organization
- A notification to PostDoc that his request to join PrimaryLab has been accepted
- A notification to Postdoc that SecProf has requested a protocol for transfer
- A notification to PostDoc that PrimProf has granted him permissions to approve requests
- A notification to SecProf that PostDoc has uploaded the MTA for the transfer
