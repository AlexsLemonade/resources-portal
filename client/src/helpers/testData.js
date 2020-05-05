// import test data from api folder

const materials = [
  {
    title: 'Melanoma Reduction Plasmid',
    category: 'PLASMID',
    id: '1',
    url: '',
    contact_user_id: '10000000-0f5a-4165-b518-b2386a753d6f',
    organization_id: '1',
    additional_metadata: {
      plasmid_name: 'pGP1871',
      plasmid_type: 'Encodes one insert',
      purpose: 'Reduces melanoma growth rate',
      'Number of Availible Samples': '20',
      biosafety_level: '2',
      gene_insert_name: ['Danio rerio', 'Dani devrito'],
      relevant_mutations: 'Skin regrowth sequence modified',
      plasmid_backbone_name: 'pSB1A30',
      primary_vector_type: 'Bacterial Expression',
      cloning_method: 'Unknown',
      sequence_maps: [
        {
          map_url: 'https://bucket-name.s3.region.amazonaws.com/keyname',
          sequence:
            'TCGCGCGTTTCGGTGATGACGGTGAAAACCTCTGACACATGCAGCTCCCGGAGACGGTCACAGCTTGTCT GTAAGCGGATGCCGGGAGCAGACAAGCCCGTCAGGGCGCGTCAGCGGGTGTTGGCGGGTGTCGGGGCTGG CTTAACTATGCGGCATCAGAGCAGATTGTACTGAGAGTGCACCATATGGTACCAAATTTATTGATGGATC AATTTAAAGAGTTTTAATCTGGGTGTTATGAGTTCCTTGGGCCTATTGTTTGCCTGAACCCTGTGGGGAC TGGCTCATCAGCAGAATTATTCATGGAGGAATTTGCTAGGTTTTACCTTGGCTCTCTAGCTTGGGACATT TTGTTTCTTCCTTAAATCCTTATTGCAACCGTCCAGCTACCAGGTAGGTATATTGCCTTGTAAGTGCTGG TACAGTTTGCCTTATTTATATTCCACTGCTTCTCAGGGATTAACATCTGCTCGTGCAGCTGAGATCCTGG CGCGAGATGGTCCCAACGCCCTCACTCCCCCTCCCACTACTCCTGAATGGATCAAGTTTTGTCGGCAGCT CTTTGGGGGGTTCTCAATGTTACTGTGGATTGGAGCGATTCTTTGTTTCTTGGCTTATAGCATCAGAGCT GCTACAGAAGAGGAACCTCAAAACGATGACGTGAGTTCTGTAATTCAGCATATCGATTTGTAGTACACAT CAGATATCTTCTCCGTCTTTGTCTCCCACTTCTTCTCAATTACCACTCATTACTTAATGGTTATGAACTC ATTACTTAATGGTTATGAACAGCTGTTGCCTTCAAGGCTCATCCATTCTTCCTTCGTTTCCATTTCCTCT CTCTACCACCCACGTTGTAGATGCTCTTACAAGTGGGATGCCCACCTGCATGTGCTGCTGTGAGCAGGCA GCTCTGCTCAGGCCCCGGCCGCCACCCACTGGATGGCAGAGCACAGCGATTCATGTTGGCACATCCACCT GTCCAGAAATGCTTGGTGGCCATTCTTCAAAATCCACAAGTTGGTTGAAAAACAATCTTTGTTTTATAAA GCAGGAGAAACTGATGCATCTAGAACCTTTCCAAACGTCCAGTTAGTGATCAAGTGTTGGTGTGCCTGAC TCCATTTCTGACCCTTCCTGTGTGGTCTTTAGAAGGGAATTCTGCATTAATGAATCGGCCAACGCGCGGG GAGAGGCGGTTTGCGTATTGGGCGCTCTTCCGCTTCCTCGCTCACTGACTCGCTGCGCTCGGTCGTTCGG CTGCGGCGAGCGGTATCAGCTCACTCAAAGGCGGTAATACGGTTATCCACAGAATCAGGGGATAACGCAG GAAAGAACATGTGAGCAAAAGGCCAGCAAAAGGCCAGGAACCGTAAAAAGGCCGCGTTGCTGGCGTTTTT CCATAGGCTCCGCCCCCCTGACGAGCATCACAAAAATCGACGCTCAAGTCAGAGGTGGCGAAACCCGACA GGACTATAAAGATACCAGGCGTTTCCCCCTGGAAGCTCCCTCGTGCGCTCTCCTGTTCCGACCCTGCCGC TTACCGGATACCTGTCCGCCTTTCTCCCTTCGGGAAGCGTGGCGCTTTCTCATAGCTCACGCTGTAGGTA TCTCAGTTCGGTGTAGGTCGTTCGCTCCAAGCTGGGCTGTGTGCACGAACCCCCCGTTCAGCCCGACCGC TGCGCCTTATCCGGTAACTATCGTCTTGAGTCCAACCCGGTAAGACACGACTTATCGCCACTGGCAGCAG CCACTGGTAACAGGATTAGCAGAGCGAGGTATGTAGGCGGTGCTACAGAGTTCTTGAAGTGGTGGCCTAA CTACGGCTACACTAGAAGAACAGTATTTGGTATCTGCGCTCTGCTGAAGCCAGTTACCTTCGGAAAAAGA GTTGGTAGCTCTTGATCCGGCAAACAAACCACCGCTGGTAGCGGTGGTTTTTTTGTTTGCAAGCAGCAGA TTACGCGCAGAAAAAAAGGATCTCAAGAAGATCCTTTGATCTTTTCTACGGGGTCTGACGCTCAGTGGAA CGAAAACTCACGTTAAGGGATTTTGGTCATGAGATTATCAAAAAGGATCTTCACCTAGATCCTTTTAAAT TAAAAATGAAGTTTTAAATCAATCTAAAGTATATATGAGTAAACTTGGTCTGACAGTTACCAATGCTTAA TCAGTGAGGCACCTATCTCAGCGATCTGTCTATTTCGTTCATCCATAGTTGCCTGACTCCCCGTCGTGTA GATAACTACGATACGGGAGGGCTTACCATCTGGCCCCAGTGCTGCAATGATACCGCGAGACCCACGCTCA CCGGCTCCAGATTTATCAGCAATAAACCAGCCAGCCGGAAGGGCCGAGCGCAGAAGTGGTCCTGCAACTT TATCCGCCTCCATCCAGTCTATTAATTGTTGCCGGGAAGCTAGAGTAAGTAGTTCGCCAGTTAATAGTTT GCGCAACGTTGTTGCCATTGCTACAGGCATCGTGGTGTCACGCTCGTCGTTTGGTATGGCTTCATTCAGC TCCGGTTCCCAACGATCAAGGCGAGTTACATGATCCCCCATGTTGTGCAAAAAAGCGGTTAGCTCCTTCG GTCCTCCGATCGTTGTCAGAAGTAAGTTGGCCGCAGTGTTATCACTCATGGTTATGGCAGCACTGCATAA TTCTCTTACTGTCATGCCATCCGTAAGATGCTTTTCTGTGACTGGTGAGTACTCAACCAAGTCATTCTGA GAATAGTGTATGCGGCGACCGAGTTGCTCTTGCCCGGCGTCAATACGGGATAATACCGCGCCACATAGCA GAACTTTAAAAGTGCTCATCATTGGAAAACGTTCTTCGGGGCGAAAACTCTCAAGGATCTTACCGCTGTT GAGATCCAGTTCGATGTAACCCACTCGTGCACCCAACTGATCTTCAGCATCTTTTACTTTCACCAGCGTT TCTGGGTGAGCAAAAACAGGAAGGCAAAATGCCGCAAAAAAGGGAATAAGGGCGACACGGAAATGTTGAA TACTCATACTCTTCCTTTTTCAATATTATTGAAGCATTTATCAGGGTTATTGTCTCATGAGCGGATACAT ATTTGAATGTATTTAGAAAAATAAACAAATAGGGGTTCCGCGCACATTTCCCCGAAAAGTGCCACCTGAC GTCTAAGAAACCATTATTATCATGACATTAACCTATAAAAATAGGCGTATCACGAGGCCCTTTCGTC'
        }
      ],
      bacterial_resistance: 'Kanamycin',
      copy_number: 'High',
      growth_temp_celsius: '32.0',
      growth_strain: 'Escherichia coli'
    },
    organism: ['Danio rerio', 'Mus musculus'],
    contact_name: 'Prim Proffer',
    contact_email: 'pprof@harvard.edu',
    publication_title: 'Expression Analysis of Zebrafish Melanoma',
    pre_print_doi: '',
    pre_print_title: '',
    citation:
      'Proffer, Prim. "Expression Analysis of Zebrafish Melanoma". March 15, 2020.',
    additional_info: '',
    created_at: '2020-01-30 16:12:25-07',
    mta_attachment_id: '1',
    needs_irb: false,
    needs_mta: true,
    needs_abstract: false,
    pubmed_id: '32223680',
    updated_at: '2020-01-30 16:12:25-07',
    imported: false,
    embargo_date: '2020-01-30',
    needs_shipping_info: true
  },
  {
    title: 'Allele Extraction Protocol',
    category: 'PROTOCOL',
    id: '2',
    url: '',
    contact_user_id: '20000000-a55d-42b7-b53e-056956e18b8c',
    organization_id: '1',
    additional_metadata: {
      protocol_name: 'Extraction of t-type alleles from zebrafish samples',
      description:
        'A protocol to retrieve t-type alleles relibably and without damage.'
    },
    contact_name: 'Postworth Docktor',
    contact_email: 'pdoc@harvard.edu',
    publication_title: 'Extraction of t-type alleles from zebrafish samples',
    pre_print_doi: '',
    pre_print_title: '',
    citation: '',
    additional_info: 'This paper was co-authored by Prim Proffer.',
    created_at: '2020-01-30 16:12:25-07',
    mta_attachment_id: '1',
    needs_irb: false,
    needs_mta: false,
    needs_abstract: true,
    pubmed_id: '32223680',
    updated_at: '2020-01-30 16:12:25-07',
    imported: false,
    embargo_date: '2020-01-30',
    needs_shipping_info: true
  },
  {
    title: 'Zebrafish Model Organism',
    category: 'MODEL_ORGANISM',
    id: '3',
    url: '',
    contact_user_id: '20000000-a55d-42b7-b53e-056956e18b8c',
    organization_id: '1',
    additional_metadata: {
      strain_name: 'Domestica salvis',
      description:
        'Investigation of expression differences between skin and melanomas from a transgenic BRAFV600E zebrafish model of melanoma.',
      genetic_background: 'TTdDss',
      genotype: 'TTdDsS',
      zygosity: 'Heterozygous',
      number_availible_models: '20',
      construct_details: 'The dominant gene is represented in this sample.'
    },
    organism: ['Danio rerio'],
    contact_name: 'Postworth Docktor',
    contact_email: 'pdoc@harvard.edu',
    publication_title: '',
    pre_print_doi: '',
    pre_print_title: '',
    citation: '',
    additional_info: '',
    created_at: '2020-01-30 16:12:25-07',
    mta_attachment_id: '1',
    needs_irb: true,
    needs_mta: true,
    needs_abstract: true,
    pubmed_id: '32223680',
    updated_at: '2020-01-30 16:12:25-07',
    imported: false,
    embargo_date: '2020-01-30',
    needs_shipping_info: true
  },
  {
    title: 'Mouse Model Organism',
    category: 'MODEL_ORGANISM',
    id: '4',
    url: '',
    contact_user_id: '20000000-a55d-42b7-b53e-056956e18b8c',
    organization_id: '1',
    additional_metadata: {
      strain_name: 'Sylvaticus',
      description:
        'Investigation of expression differences between skin and melanomas from a house mouse.',
      genetic_background: 'TTdDss',
      genotype: 'TTdDsS',
      zygosity: 'Heterozygous',
      number_availible_models: '20',
      construct_details: 'The dominant gene is represented in this sample.'
    },
    organism: ['Mus musculus'],
    created_at: '2020-01-30 16:12:25-07',
    mta_attachment_id: '1',
    needs_irb: false,
    needs_mta: true,
    needs_abstract: true,
    pubmed_id: '32223680',
    updated_at: '2020-01-30 16:12:25-07',
    imported: false,
    contact_name: 'Postworth Docktor',
    contact_email: 'pdoc@harvard.edu',
    publication_title:
      'Investigation of expression differences between skin and melanomas from a transgenic BRAFV600E zebrafish model of melanoma',
    pre_print_doi: '10.1109/5.771073',
    pre_print_title: 'Initial Research on Zebrafish Morphology',
    citation:
      'Docktor, Postworth. "Investigation of expression differences between skin and melanomas from a transgenic BRAFV600E zebrafish model of melanoma.". March 15, 2020.',
    additional_info: 'This paper was co-authored by Prim Proffer.',
    embargo_date: '2020-01-30',
    needs_shipping_info: true
  },
  {
    title: 'Stone Tablet (Other)',
    category: 'OTHER',
    id: '5',
    url: '',
    contact_user_id: '10000000-0f5a-4165-b518-b2386a753d6f',
    organization_id: '1',
    additional_metadata: {
      resource_type: 'Stone Tablet',
      title: 'The Ten Commandments',
      description:
        'Given to me by an old man who said to "Let my research go". He then parted my hair by raising his staff and left.'
    },
    contact_name: 'Prim Proffer',
    contact_email: 'pprof@harvard.edu',
    publication_title: 'The Ten Commandments',
    pre_print_doi: '10.1109/5.771073',
    pre_print_title: 'The Six and a Half Commandments',
    citation: 'Proffer, Prim. "The Old Testament". March 15, 2020.',
    additional_info: 'This tablet was co-authored by Postworth Docktor.',
    created_at: '2020-01-30 16:12:25-07',
    mta_attachment_id: '1',
    needs_irb: false,
    needs_mta: false,
    needs_abstract: false,
    pubmed_id: '32223680',
    updated_at: '2020-01-30 16:12:25-07',
    imported: false,
    embargo_date: '2020-01-30',
    needs_shipping_info: false
  },
  {
    title: 'Zebrafish Cell Line',
    category: 'CELL_LINE',
    id: '6',
    url: '',
    contact_user_id: '30000000-231f-4dc8-bbfa-02bccfb0372c',
    organization_id: '4',
    additional_metadata: {
      cell_line_name: 'A549',
      tissue_histology: 'Brain Tumor',
      cell_type: 'Microarray',
      disease: 'Affymetrix Zebrafish Genome Array',
      number_availible_cell_lines: '20',
      age: 'Four Months',
      sex: 'Male',
      ethnicity: 'N/A',
      biosafety_level: '3',
      population_doubling_time: '20 Hours',
      storage_medium: 'Liquid nitrogen vapor phase',
      growth_medium: 'Ethanol',
      subculturing: 'Methanol',
      cryopreservation: 'Liquid nitrogen',
      culture_conditions: 'Reproducing at a swift rate',
      str_profile:
        'Amelogenin: X Y\nCSF1PO: 11\nD13S317: 8, 14\nD16S539: 9, 11\nD5S818: 11, 13\nD7S820: 10\nTH01: 6, 9.3\nTPOX: 9, 12\nvWA: 16, 17',
      passage_number: '21430780'
    },
    organism: ['Danio rerio'],
    created_at: '2020-01-30 16:12:25-07',
    mta_attachment_id: '1',
    needs_irb: true,
    needs_mta: false,
    needs_abstract: true,
    pubmed_id: '32223680',
    updated_at: '2020-01-30 16:12:25-07',
    imported: false,
    contact_name: '',
    contact_email: '',
    publication_title: '',
    pre_print_doi: '',
    pre_print_title: '',
    citation: '',
    additional_info: '',
    embargo_date: '2020-01-30',
    needs_shipping_info: false
  },
  {
    title: 'Zebrafish Dataset',
    category: 'DATASET',
    id: '7',
    url: '',
    contact_user_id: '10000000-0f5a-4165-b518-b2386a753d6f',
    organization_id: '1',
    additional_metadata: {
      title: 'Zebrafish Analyis',
      study_id: 'phs000328.v2.p1',
      study_id_type: 'dbgap_study_accession',
      description: 'Data collected from genetically modified zebrafish.',
      number_samples: '15',
      technology: 'R-readable array',
      platform: 'Amazon s3 Database'
    },
    organism: ['Danio rerio'],
    created_at: '2020-01-30 16:12:25-07',
    mta_attachment_id: '1',
    needs_irb: false,
    needs_mta: true,
    needs_abstract: false,
    pubmed_id: '',
    updated_at: '2020-01-30 16:12:25-07',
    imported: false,
    contact_name: 'Prim Proffer',
    contact_email: 'pprof@harvard.edu',
    publication_title: '',
    pre_print_doi: '10.1109/5.771073',
    pre_print_title: 'Proposal for Data Collection from Zebrafish',
    citation: '',
    additional_info: 'This paper was co-authored by Postworth Docktor.',
    embargo_date: '2020-01-30',
    needs_shipping_info: true
  },
  {
    title: 'Zebrafish PDX',
    category: 'PDX',
    id: '8',
    url: '',
    contact_user_id: '10000000-0f5a-4165-b518-b2386a753d6f',
    organization_id: '1',
    additional_metadata: {
      submitter_patient_id: '18849839',
      gender: 'Male',
      age: '15',
      diagnosis: 'Stage 4 Lymphoma',
      consent_to_share: 'False',
      ethnicity: 'Hispanic',
      prior_treatment_protocol: '10 mg Anastrozole daily',
      current_treatment_drug: 'Anastrozole',
      current_treatment_protocol: '30 mg Anastrozole daily',
      response_to_prior_treatment: 'No response',
      virology_status: 'Malignant tumor',
      submitter_tumor_id: '92739492',
      primary_tissue_of_origin: 'Lung',
      tumor_type: 'Malignant',
      specimen_tumor_tissue: 'Lung',
      tissue_histology: 'Cancerous',
      tumor_grade: 'AJCC IV',
      disease_stage: '1',
      specific_markers: 'Circulating marker',
      is_from_untreated_patient: 'No',
      tumor_sample_type: 'Biopsy',
      existing_model_explaination: 'Sublining to do further analysis',
      pdx_id: '81983924',
      model_organism: 'Danio rerio',
      model_strain_and_source: 'Strain 2, from Croatia',
      is_strain_immunized: 'Yes',
      type_of_humanization: 'Chimeric',
      tumor_preparation: 'Removed and preserved',
      injection_type_and_site: 'Immediate, left thigh',
      treatment_for_engraftment: 'Sedation',
      engraftment_time: 'Four days',
      tumor_characterization_technology: 'Centrifuge',
      is_not_of_EVB_origin: 'Yes',
      is_passage_QA_performed: 'Yes',
      response_to_standard_of_care: 'Positive',
      animal_health_status: 'Good',
      treatment_passage: 'Daily glass of milk',
      treatment_response: 'Positive',
      tumor_omics: 'Sample #194982984, mouse',
      metastases_in_strain: 'Yes',
      lag_time: 'Three months',
      number_availible_models: '20',
      pdx_model_availability: 'Availible',
      goverance_restriction: 'None'
    },
    organism: ['Danio rerio', 'Mus musculus'],
    created_at: '2020-01-30 16:12:25-07',
    mta_attachment_id: null,
    needs_irb: true,
    needs_mta: false,
    needs_abstract: true,
    pubmed_id: '',
    updated_at: '2020-01-30 16:12:25-07',
    imported: false,
    contact_name: 'Prim Proffer',
    contact_email: 'pprof@harvard.edu',
    publication_title: 'Grafting to Zebrafish',
    pre_print_doi: '10.1109/5.771073',
    pre_print_title: 'Preliminary research on Grafting to Zebrafish',
    citation: 'Proffer, Prim. "Grafting to Zebrafish". March 15, 2020.',
    additional_info: 'This tablet was co-authored by Postworth Docktor.',
    embargo_date: '2020-01-30',
    needs_shipping_info: true
  },
  {
    title: 'Imported GEO Dataset',
    category: 'DATASET',
    id: '9',
    url: 'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE31712',
    contact_user_id: '10000000-0f5a-4165-b518-b2386a753d6f',
    organization_id: '1',
    additional_metadata: {
      title: 'Imported Zebrafish Analyis',
      study_id: 'GSE24528',
      study_id_type: 'accession_id',
      description: 'Data collected from genetically modified zebrafish.',
      number_samples: '15',
      technology: 'R-readable array',
      platform: 'Amazon s3 Database'
    },
    organism: ['Danio rerio'],
    created_at: '2020-01-30 16:12:25-07',
    pubmed_id: '32223680',
    updated_at: '2020-01-30 16:12:25-07',
    imported: true,
    contact_name: '',
    contact_email: '',
    publication_title: 'Data collected from genetically modified zebrafish',
    pre_print_doi: '10.1109/5.771073',
    pre_print_title: 'Proposal for Data Collection from Zebrafish',
    citation:
      'Proffer, Prim. "Data collected from genetically modified zebrafish". March 15, 2020.',
    additional_info: 'This paper was co-authored by Postworth Docktor.',
    embargo_date: '2020-01-30',
    import_source: 'GEO',
    needs_shipping_info: false
  },
  {
    title: 'Imported SRA Dataset',
    category: 'DATASET',
    id: '10',
    url: 'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE37165',
    contact_user_id: '10000000-0f5a-4165-b518-b2386a753d6f',
    organization_id: '1',
    additional_metadata: {
      embargo_date: '2020-01-30',
      title: 'GEO Zebrafish Analysis',
      description:
        'This dataset has interesting implications for future research.',
      number_samples: '15',
      contact_name: 'Prim Proffer'
    },
    created_at: '2020-01-30 16:12:25-07',
    pubmed_id: '32223680',
    updated_at: '2020-01-30 16:12:25-07',
    imported: true,
    contact_email: 'pprof@harvard.edu',
    publication_title: 'Data collected from genetically modified zebrafish',
    pre_print_doi: '10.1109/5.771073',
    pre_print_title: 'Proposal for Data Collection from Zebrafish',
    citation:
      'Proffer, Prim. "Data collected from genetically modified zebrafish". March 15, 2020.',
    additional_info: 'This paper was co-authored by Postworth Docktor.',
    embargo_date: '2020-01-30',
    import_source: 'SRA',
    needs_shipping_info: true
  },
  {
    title: 'Imported dbGaP Dataset',
    category: 'DATASET',
    id: '11',
    url:
      'https://www.ncbi.nlm.nih.gov/projects/gap/cgi-bin/study.cgi?study_id=phs000328.v2.p1',
    contact_user_id: '10000000-0f5a-4165-b518-b2386a753d6f',
    organization_id: '1',
    additional_metadata: {
      title: 'GEO Zebrafish Analysis',
      accession: 'phs000328.v2.p1',
      description:
        'This dataset has interesting implications for future research.',
      number_samples: '15'
    },
    created_at: '2020-01-30 16:12:25-07',
    pubmed_id: '32223680',
    updated_at: '2020-01-30 16:12:25-07',
    imported: true,
    contact_name: 'Prim Proffer',
    contact_email: 'pprof@harvard.edu',
    publication_title: 'Data collected from genetically modified zebrafish',
    pre_print_doi: '10.1109/5.771073',
    pre_print_title: 'Proposal for Data Collection from Zebrafish',
    citation:
      'Proffer, Prim. "Data collected from genetically modified zebrafish". March 15, 2020.',
    additional_info: 'This paper was co-authored by Postworth Docktor.',
    embargo_date: '2020-01-30',
    import_source: 'DBGAP',
    needs_shipping_info: true
  },
  {
    title: 'Imported Protocol',
    category: 'PROTOCOL',
    id: '12',
    url:
      'https://www.protocols.io/view/labyrinthulomycete-dna-extraction-protocol-n83dhyn',
    contact_user_id: '20000000-a55d-42b7-b53e-056956e18b8c',
    organization_id: '1',
    additional_metadata: {
      protocol_name: 'Extraction of t-type alleles from zebrafish samples',
      abstract:
        'A protocol to retrieve t-type alleles relibably and without damage.'
    },
    created_at: '2020-01-30 16:12:25-07',
    pubmed_id: '32223680',
    updated_at: '2020-01-30 16:12:25-07',
    imported: true,
    contact_name: 'Postworth Docktor',
    contact_email: 'pdoc@harvard.edu',
    publication_title: 'Extraction of t-type alleles from zebrafish samples',
    pre_print_doi: '10.1109/5.771073',
    pre_print_title: 'Initial Research on Zebrafish Extraction',
    citation:
      'Docktor, Postworth. "Initial Research on Zebrafish Extraction". March 15, 2020.',
    additional_info: 'This paper was co-authored by Prim Proffer.',
    embargo_date: '2020-01-30',
    import_source: 'PROTOCOLS_IO',
    needs_shipping_info: true
  },
  {
    title: 'Imported AddGene Melanoma Reduction Plasmid',
    category: 'PLASMID',
    id: '13',
    url: 'https://www.addgene.org/53246/',
    contact_user_id: '10000000-0f5a-4165-b518-b2386a753d6f',
    organization_id: '1',
    additional_metadata: {
      plasmid_name: 'pGP1871',
      description: 'Reduces melanoma growth rate',
      insert_delete_genes:
        'TCGCGCGTTTCGGTGATGACGGTGAAAACCTCTGACACATGCAGCTCCCGGAGACGGTCACAGCTTGTCT',
      relevant_mutations: 'Biofloresence',
      contact_name: 'Postworth Docktor'
    },
    organism: ['Danio rerio'],
    created_at: '2020-01-30 16:12:25-07',
    pubmed_id: '32223680',
    updated_at: '2020-01-30 16:12:25-07',
    imported: true,
    contact_email: 'pdoc@harvard.edu',
    publication_title: 'Imported Plasmid',
    pre_print_doi: '10.1109/5.771073',
    pre_print_title: 'Initial Research on Zebrafish Plasmids',
    citation:
      'Docktor, Postworth. "Initial Research on Zebrafish Plasmids". March 15, 2020.',
    additional_info: 'This paper was co-authored by Prim Proffer.',
    embargo_date: '2020-01-30',
    import_source: 'ADDGENE',
    needs_shipping_info: true
  },
  {
    title: 'Jackson Labs Imported Mouse Model Organism',
    category: 'MODEL_ORGANISM',
    id: '14',
    url: 'https://www.jax.org/strain/006933',
    contact_user_id: '20000000-a55d-42b7-b53e-056956e18b8c',
    organization_id: '1',
    additional_metadata: {
      strain_name: 'Domestica salvis',
      description:
        'Investigation of expression differences between skin and melanomas from a transgenic BRAFV600E zebrafish model of melanoma.'
    },
    organism: ['Danio rerio'],
    created_at: '2020-01-30 16:12:25-07',
    pubmed_id: '32223680',
    updated_at: '2020-01-30 16:12:25-07',
    imported: true,
    contact_name: 'Postworth Docktor',
    contact_email: 'pdoc@harvard.edu',
    publication_title:
      'Investigation of expression differences between skin and melanomas from a transgenic BRAFV600E zebrafish model of melanoma',
    pre_print_doi: '10.1109/5.771073',
    pre_print_title: 'Initial Research on Zebrafish Morphology',
    citation:
      'Docktor, Postworth. "Investigation of expression differences between skin and melanomas from a transgenic BRAFV600E zebrafish model of melanoma.". March 15, 2020.',
    additional_info: 'This paper was co-authored by Prim Proffer.',
    embargo_date: '2020-01-30',
    import_source: 'JACKSON_LABS',
    needs_shipping_info: true
  },
  {
    title: 'ATCC Imported Zebrafish Cell Line',
    category: 'CELL_LINE',
    id: '15',
    url: 'https://www.atcc.org/products/all/CCL-185.aspx#generalinformation',
    contact_user_id: '30000000-231f-4dc8-bbfa-02bccfb0372c',
    organization_id: '4',
    additional_metadata: {
      cell_line_name: 'A549',
      tissue: '15',
      cell_type: 'Microarray',
      disease: 'Affymetrix Zebrafish Genome Array',
      number_availible_cell_lines: '20',
      age: 'Four Months',
      sex: 'Male',
      ethnicity: 'N/A'
    },
    organism: ['Danio rerio'],
    created_at: '2020-01-30 16:12:25-07',
    pubmed_id: '32223680',
    updated_at: '2020-01-30 16:12:25-07',
    imported: true,
    contact_name: 'Secundus Profarius',
    contact_email: 'secprof@harvard.edu',
    publication_title: 'Cell Line from Zebrafish Sample',
    pre_print_doi: '10.1109/5.771073',
    pre_print_title: 'Preliminary Research',
    citation:
      'Proffer, Prim. "Cell Line from Zebrafish Sample". March 15, 2020.',
    additional_info: 'This paper was co-authored by Postworth Docktor.',
    embargo_date: '2020-01-30',
    import_source: 'ATCC',
    needs_shipping_info: true
  },
  {
    title: 'ZIRC Imported Zebrafish Model Organism',
    category: 'MODEL_ORGANISM',
    id: '16',
    url: 'http://zfin.org/ZDB-GENO-100413-1',
    contact_user_id: '20000000-a55d-42b7-b53e-056956e18b8c',
    organization_id: '1',
    additional_metadata: {
      strain_name: 'Sylvaticus',
      description:
        'Investigation of expression differences between skin and melanomas from a house mouse.',
      genetic_background: 'TTdDss',
      genotype: 'TTdDsS'
    },
    organism: ['Mus musculus'],
    created_at: '2020-01-30 16:12:25-07',
    pubmed_id: '32223680',
    updated_at: '2020-01-30 16:12:25-07',
    imported: true,
    contact_name: 'Postworth Docktor',
    contact_email: 'pdoc@harvard.edu',
    publication_title:
      'Investigation of expression differences between skin and melanomas from a transgenic BRAFV600E zebrafish model of melanoma',
    pre_print_doi: '10.1109/5.771073',
    pre_print_title: 'Initial Research on Zebrafish Morphology',
    citation:
      'Docktor, Postworth. "Investigation of expression differences between skin and melanomas from a transgenic BRAFV600E zebrafish model of melanoma.". March 15, 2020.',
    additional_info: 'This paper was co-authored by Prim Proffer.',
    embargo_date: '2020-01-30',
    import_source: 'ZIRC',
    needs_shipping_info: true
  },
  {
    title: 'Imported Stone Tablet (Other)',
    category: 'OTHER',
    id: '17',
    url: 'https://www.ncbi.nlm.nih.gov/pubmed/32223680',
    contact_user_id: '10000000-0f5a-4165-b518-b2386a753d6f',
    organization_id: '1',
    additional_metadata: {
      resource_type: 'Stone Tablet',
      title: 'The Ten Commandments',
      description:
        'Given to me by an old man who said to "Let my research go". He then parted my hair by raising his staff and left.'
    },
    created_at: '2020-01-30 16:12:25-07',
    pubmed_id: '32223680',
    updated_at: '2020-01-30 16:12:25-07',
    imported: true,
    contact_name: 'Prim Proffer',
    contact_email: 'pprof@harvard.edu',
    publication_title: 'The Ten Commandments',
    pre_print_doi: '10.1109/5.771073',
    pre_print_title: 'The Six and a Half Commandments',
    citation: 'Proffer, Prim. "The Old Testament". March 15, 2020.',
    additional_info: 'This tablet was co-authored by Postworth Docktor.',
    embargo_date: '2020-01-30',
    import_source: 'OTHER',
    needs_shipping_info: true
  }
]

export const materialsRequests = [
  {
    id: '1',
    created_at: '2020-01-30 14:12:25-07',
    updated_at: '2020-01-30 14:12:25-07',
    requester_signed_mta_attachment_id: '2',
    executed_mta_attachment_id: '3',
    irb_attachment_id: '4',
    is_active: false,
    status: 'closed',
    assigned_to_id: '20000000-a55d-42b7-b53e-056956e18b8c',
    material_id: '2',
    requester_id: '30000000-231f-4dc8-bbfa-02bccfb0372c'
  }
]

export const materialsShareEvents = [
  {
    id: '1',
    created_at: '2020-01-30 16:12:25-07',
    updated_at: '2020-01-30 16:12:25-07',
    event_type: 'shared',
    time: '2020-01-30 16:12:25-07',
    assigned_to_id: '20000000-a55d-42b7-b53e-056956e18b8c',
    created_by_id: '10000000-0f5a-4165-b518-b2386a753d6f',
    material_id: '2'
  }
]

export const materialsTestData = materials

export default {
  materialsTestData
}
