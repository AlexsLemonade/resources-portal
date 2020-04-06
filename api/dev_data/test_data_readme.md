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
- A grant for melanoma research, owned by PrimaryProf
- A grant for tumor growth research, co-owned by PrimaryProf and SecondaryProf

There are seventeen materials:
	Eight listed materials:
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

The Protocol was requested by SecondaryProf and transferred to him by PostDoc.
