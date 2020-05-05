import { materialsTestData } from '../helpers/testData'

const fakeSearchMaterialsResponse = {
  count: 17,
  facets: {
    category: {
      CELL_LINE: 2,
      DATASET: 4,
      MODEL_ORGANISM: 4,
      OTHER: 2,
      PDX: 1,
      PLASMID: 2,
      PROTOCOL: 2
    },
    'contact_user.email': {
      'pdoc@harvard.edu': 6,
      'pprof@havard.edu': 9,
      'secprof@harvard.edu': 2
    },
    'contact_user.published_name': {
      'Dr. Postsworth Doktor': 6,
      'Dr. Prim Proffer': 9,
      'Dr. Secundus Profarius': 2
    },
    has_pre_print: {
      '0': 4,
      '1': 13
    },
    has_publication: {
      '0': 2,
      '1': 15
    },
    organism: {
      'danio rerio': 9,
      'mus musculus': 4
    }
  },
  next: 'http://0.0.0.0:8000/search/materials?limit=10&offset=10',
  previous: null,
  results: [
    {
      additional_info: '',
      additional_metadata: {
        'Number of Availible Samples': '20',
        bacterial_resistance: 'Kanamycin',
        biosafety_level: '2',
        cloning_method: 'Unknown',
        copy_number: 'High',
        gene_insert_name: ['Danio rerio', 'Dani devrito'],
        growth_strain: 'Escherichia coli',
        growth_temp_celsius: '32.0',
        plasmid_backbone_name: 'pSB1A30',
        plasmid_name: 'pGP1871',
        plasmid_type: 'Encodes one insert',
        primary_vector_type: 'Bacterial Expression',
        purpose: 'Reduces melanoma growth rate',
        relevant_mutations: 'Skin regrowth sequence modified',
        sequence_maps: [
          {
            map_url: 'https://bucket-name.s3.region.amazonaws.com/keyname',
            sequence:
              'TCGCGCGTTTCGGTGATGACGGTGAAAACCTCTGACACATGCAGCTCCCGGAGACGGTCACAGCTTGTCT GTAAGCGGATGCCGGGAGCAGACAAGCCCGTCAGGGCGCGTCAGCGGGTGTTGGCGGGTGTCGGGGCTGG CTTAACTATGCGGCATCAGAGCAGATTGTACTGAGAGTGCACCATATGGTACCAAATTTATTGATGGATC AATTTAAAGAGTTTTAATCTGGGTGTTATGAGTTCCTTGGGCCTATTGTTTGCCTGAACCCTGTGGGGAC TGGCTCATCAGCAGAATTATTCATGGAGGAATTTGCTAGGTTTTACCTTGGCTCTCTAGCTTGGGACATT TTGTTTCTTCCTTAAATCCTTATTGCAACCGTCCAGCTACCAGGTAGGTATATTGCCTTGTAAGTGCTGG TACAGTTTGCCTTATTTATATTCCACTGCTTCTCAGGGATTAACATCTGCTCGTGCAGCTGAGATCCTGG CGCGAGATGGTCCCAACGCCCTCACTCCCCCTCCCACTACTCCTGAATGGATCAAGTTTTGTCGGCAGCT CTTTGGGGGGTTCTCAATGTTACTGTGGATTGGAGCGATTCTTTGTTTCTTGGCTTATAGCATCAGAGCT GCTACAGAAGAGGAACCTCAAAACGATGACGTGAGTTCTGTAATTCAGCATATCGATTTGTAGTACACAT CAGATATCTTCTCCGTCTTTGTCTCCCACTTCTTCTCAATTACCACTCATTACTTAATGGTTATGAACTC ATTACTTAATGGTTATGAACAGCTGTTGCCTTCAAGGCTCATCCATTCTTCCTTCGTTTCCATTTCCTCT CTCTACCACCCACGTTGTAGATGCTCTTACAAGTGGGATGCCCACCTGCATGTGCTGCTGTGAGCAGGCA GCTCTGCTCAGGCCCCGGCCGCCACCCACTGGATGGCAGAGCACAGCGATTCATGTTGGCACATCCACCT GTCCAGAAATGCTTGGTGGCCATTCTTCAAAATCCACAAGTTGGTTGAAAAACAATCTTTGTTTTATAAA GCAGGAGAAACTGATGCATCTAGAACCTTTCCAAACGTCCAGTTAGTGATCAAGTGTTGGTGTGCCTGAC TCCATTTCTGACCCTTCCTGTGTGGTCTTTAGAAGGGAATTCTGCATTAATGAATCGGCCAACGCGCGGG GAGAGGCGGTTTGCGTATTGGGCGCTCTTCCGCTTCCTCGCTCACTGACTCGCTGCGCTCGGTCGTTCGG CTGCGGCGAGCGGTATCAGCTCACTCAAAGGCGGTAATACGGTTATCCACAGAATCAGGGGATAACGCAG GAAAGAACATGTGAGCAAAAGGCCAGCAAAAGGCCAGGAACCGTAAAAAGGCCGCGTTGCTGGCGTTTTT CCATAGGCTCCGCCCCCCTGACGAGCATCACAAAAATCGACGCTCAAGTCAGAGGTGGCGAAACCCGACA GGACTATAAAGATACCAGGCGTTTCCCCCTGGAAGCTCCCTCGTGCGCTCTCCTGTTCCGACCCTGCCGC TTACCGGATACCTGTCCGCCTTTCTCCCTTCGGGAAGCGTGGCGCTTTCTCATAGCTCACGCTGTAGGTA TCTCAGTTCGGTGTAGGTCGTTCGCTCCAAGCTGGGCTGTGTGCACGAACCCCCCGTTCAGCCCGACCGC TGCGCCTTATCCGGTAACTATCGTCTTGAGTCCAACCCGGTAAGACACGACTTATCGCCACTGGCAGCAG CCACTGGTAACAGGATTAGCAGAGCGAGGTATGTAGGCGGTGCTACAGAGTTCTTGAAGTGGTGGCCTAA CTACGGCTACACTAGAAGAACAGTATTTGGTATCTGCGCTCTGCTGAAGCCAGTTACCTTCGGAAAAAGA GTTGGTAGCTCTTGATCCGGCAAACAAACCACCGCTGGTAGCGGTGGTTTTTTTGTTTGCAAGCAGCAGA TTACGCGCAGAAAAAAAGGATCTCAAGAAGATCCTTTGATCTTTTCTACGGGGTCTGACGCTCAGTGGAA CGAAAACTCACGTTAAGGGATTTTGGTCATGAGATTATCAAAAAGGATCTTCACCTAGATCCTTTTAAAT TAAAAATGAAGTTTTAAATCAATCTAAAGTATATATGAGTAAACTTGGTCTGACAGTTACCAATGCTTAA TCAGTGAGGCACCTATCTCAGCGATCTGTCTATTTCGTTCATCCATAGTTGCCTGACTCCCCGTCGTGTA GATAACTACGATACGGGAGGGCTTACCATCTGGCCCCAGTGCTGCAATGATACCGCGAGACCCACGCTCA CCGGCTCCAGATTTATCAGCAATAAACCAGCCAGCCGGAAGGGCCGAGCGCAGAAGTGGTCCTGCAACTT TATCCGCCTCCATCCAGTCTATTAATTGTTGCCGGGAAGCTAGAGTAAGTAGTTCGCCAGTTAATAGTTT GCGCAACGTTGTTGCCATTGCTACAGGCATCGTGGTGTCACGCTCGTCGTTTGGTATGGCTTCATTCAGC TCCGGTTCCCAACGATCAAGGCGAGTTACATGATCCCCCATGTTGTGCAAAAAAGCGGTTAGCTCCTTCG GTCCTCCGATCGTTGTCAGAAGTAAGTTGGCCGCAGTGTTATCACTCATGGTTATGGCAGCACTGCATAA TTCTCTTACTGTCATGCCATCCGTAAGATGCTTTTCTGTGACTGGTGAGTACTCAACCAAGTCATTCTGA GAATAGTGTATGCGGCGACCGAGTTGCTCTTGCCCGGCGTCAATACGGGATAATACCGCGCCACATAGCA GAACTTTAAAAGTGCTCATCATTGGAAAACGTTCTTCGGGGCGAAAACTCTCAAGGATCTTACCGCTGTT GAGATCCAGTTCGATGTAACCCACTCGTGCACCCAACTGATCTTCAGCATCTTTTACTTTCACCAGCGTT TCTGGGTGAGCAAAAACAGGAAGGCAAAATGCCGCAAAAAAGGGAATAAGGGCGACACGGAAATGTTGAA TACTCATACTCTTCCTTTTTCAATATTATTGAAGCATTTATCAGGGTTATTGTCTCATGAGCGGATACAT ATTTGAATGTATTTAGAAAAATAAACAAATAGGGGTTCCGCGCACATTTCCCCGAAAAGTGCCACCTGAC GTCTAAGAAACCATTATTATCATGACATTAACCTATAAAAATAGGCGTATCACGAGGCCCTTTCGTC'
          }
        ]
      },
      category: 'PLASMID',
      contact_email: 'pprof@harvard.edu',
      contact_name: 'Prim Proffer',
      contact_user: {
        email: 'pprof@havard.edu',
        first_name: 'Prim',
        last_name: 'Proffer',
        published_name: 'Dr. Prim Proffer'
      },
      created_at: '2020-05-05T19:58:28.605379+00:00',
      embargo_date: '2020-01-30',
      has_pre_print: 'False',
      has_publication: 'True',
      id: 1,
      mta_attachment: {
        created_at: '2020-05-05T19:58:28.561490+00:00',
        description: 'The MTA used by PrimaryLab.',
        download_url: 'https://s3.amazonaws.com/bucket-name/keyname',
        filename: 'PrimaryLabMTA.pdf',
        s3_bucket: 'bucket-name',
        s3_key: 'keyname',
        updated_at: '2020-05-05T19:58:28.561510+00:00'
      },
      needs_shipping_info: 'True',
      organism: ['Danio rerio', 'Mus musculus'],
      organization: {
        id: 1,
        name: 'PrimaryLab'
      },
      pre_print_doi: '',
      pre_print_title: '',
      publication_title: 'Expression Analysis of Zebrafish Melanoma',
      pubmed_id: '32223680',
      title: 'Melanoma Reduction Plasmid',
      updated_at: '2020-05-05T19:58:28.605413+00:00',
      url: ''
    },
    {
      additional_info: 'This paper was co-authored by Prim Proffer.',
      additional_metadata: {
        description:
          'A protocol to retrieve t-type alleles relibably and without damage.',
        protocol_name: 'Extraction of t-type alleles from zebrafish samples'
      },
      category: 'PROTOCOL',
      contact_email: 'pdoc@harvard.edu',
      contact_name: 'Postworth Docktor',
      contact_user: {
        email: 'pdoc@harvard.edu',
        first_name: 'Postsworth',
        last_name: 'Doktor',
        published_name: 'Dr. Postsworth Doktor'
      },
      created_at: '2020-05-05T19:58:29.371510+00:00',
      embargo_date: '2020-01-30',
      has_pre_print: 'False',
      has_publication: 'True',
      id: 2,
      mta_attachment: {
        created_at: '2020-05-05T19:58:28.561490+00:00',
        description: 'The MTA used by PrimaryLab.',
        download_url: 'https://s3.amazonaws.com/bucket-name/keyname',
        filename: 'PrimaryLabMTA.pdf',
        s3_bucket: 'bucket-name',
        s3_key: 'keyname',
        updated_at: '2020-05-05T19:58:28.561510+00:00'
      },
      needs_shipping_info: 'True',
      organism: [],
      organization: {
        id: 1,
        name: 'PrimaryLab'
      },
      pre_print_doi: '',
      pre_print_title: '',
      publication_title: 'Extraction of t-type alleles from zebrafish samples',
      pubmed_id: '32223680',
      title: 'Allele Extraction Protocol',
      updated_at: '2020-05-05T19:58:29.371534+00:00',
      url: ''
    },
    {
      additional_info: '',
      additional_metadata: {
        construct_details: 'The dominant gene is represented in this sample.',
        description:
          'Investigation of expression differences between skin and melanomas from a transgenic BRAFV600E zebrafish model of melanoma.',
        genetic_background: 'TTdDss',
        genotype: 'TTdDsS',
        number_availible_models: '20',
        strain_name: 'Domestica salvis',
        zygosity: 'Heterozygous'
      },
      category: 'MODEL_ORGANISM',
      contact_email: 'pdoc@harvard.edu',
      contact_name: 'Postworth Docktor',
      contact_user: {
        email: 'pdoc@harvard.edu',
        first_name: 'Postsworth',
        last_name: 'Doktor',
        published_name: 'Dr. Postsworth Doktor'
      },
      created_at: '2020-05-05T19:58:29.498882+00:00',
      embargo_date: '2020-01-30',
      has_pre_print: 'False',
      has_publication: 'True',
      id: 3,
      mta_attachment: {
        created_at: '2020-05-05T19:58:28.561490+00:00',
        description: 'The MTA used by PrimaryLab.',
        download_url: 'https://s3.amazonaws.com/bucket-name/keyname',
        filename: 'PrimaryLabMTA.pdf',
        s3_bucket: 'bucket-name',
        s3_key: 'keyname',
        updated_at: '2020-05-05T19:58:28.561510+00:00'
      },
      needs_shipping_info: 'True',
      organism: ['Danio rerio'],
      organization: {
        id: 1,
        name: 'PrimaryLab'
      },
      pre_print_doi: '',
      pre_print_title: '',
      publication_title: '',
      pubmed_id: '32223680',
      title: 'Zebrafish Model Organism',
      updated_at: '2020-05-05T19:58:29.498908+00:00',
      url: ''
    },
    {
      additional_info: 'This paper was co-authored by Prim Proffer.',
      additional_metadata: {
        construct_details: 'The dominant gene is represented in this sample.',
        description:
          'Investigation of expression differences between skin and melanomas from a house mouse.',
        genetic_background: 'TTdDss',
        genotype: 'TTdDsS',
        number_availible_models: '20',
        strain_name: 'Sylvaticus',
        zygosity: 'Heterozygous'
      },
      category: 'MODEL_ORGANISM',
      contact_email: 'pdoc@harvard.edu',
      contact_name: 'Postworth Docktor',
      contact_user: {
        email: 'pdoc@harvard.edu',
        first_name: 'Postsworth',
        last_name: 'Doktor',
        published_name: 'Dr. Postsworth Doktor'
      },
      created_at: '2020-05-05T19:58:29.605691+00:00',
      embargo_date: '2020-01-30',
      has_pre_print: 'True',
      has_publication: 'True',
      id: 4,
      mta_attachment: {
        created_at: '2020-05-05T19:58:28.561490+00:00',
        description: 'The MTA used by PrimaryLab.',
        download_url: 'https://s3.amazonaws.com/bucket-name/keyname',
        filename: 'PrimaryLabMTA.pdf',
        s3_bucket: 'bucket-name',
        s3_key: 'keyname',
        updated_at: '2020-05-05T19:58:28.561510+00:00'
      },
      needs_shipping_info: 'True',
      organism: ['Mus musculus'],
      organization: {
        id: 1,
        name: 'PrimaryLab'
      },
      pre_print_doi: '10.1109/5.771073',
      pre_print_title: 'Initial Research on Zebrafish Morphology',
      publication_title:
        'Investigation of expression differences between skin and melanomas from a transgenic BRAFV600E zebrafish model of melanoma',
      pubmed_id: '32223680',
      title: 'Mouse Model Organism',
      updated_at: '2020-05-05T19:58:29.605736+00:00',
      url: ''
    },
    {
      additional_info: 'This tablet was co-authored by Postworth Docktor.',
      additional_metadata: {
        description:
          'Given to me by an old man who said to Let my research go. He then parted my hair by raising his staff and left.',
        resource_type: 'Stone Tablet',
        title: 'The Ten Commandments'
      },
      category: 'OTHER',
      contact_email: 'pprof@harvard.edu',
      contact_name: 'Prim Proffer',
      contact_user: {
        email: 'pprof@havard.edu',
        first_name: 'Prim',
        last_name: 'Proffer',
        published_name: 'Dr. Prim Proffer'
      },
      created_at: '2020-05-05T19:58:29.832646+00:00',
      embargo_date: '2020-01-30',
      has_pre_print: 'True',
      has_publication: 'True',
      id: 5,
      mta_attachment: {
        created_at: '2020-05-05T19:58:28.561490+00:00',
        description: 'The MTA used by PrimaryLab.',
        download_url: 'https://s3.amazonaws.com/bucket-name/keyname',
        filename: 'PrimaryLabMTA.pdf',
        s3_bucket: 'bucket-name',
        s3_key: 'keyname',
        updated_at: '2020-05-05T19:58:28.561510+00:00'
      },
      needs_shipping_info: 'False',
      organism: [],
      organization: {
        id: 1,
        name: 'PrimaryLab'
      },
      pre_print_doi: '10.1109/5.771073',
      pre_print_title: 'The Six and a Half Commandments',
      publication_title: 'The Ten Commandments',
      pubmed_id: '32223680',
      title: 'Stone Tablet (Other)',
      updated_at: '2020-05-05T19:58:29.832670+00:00',
      url: ''
    },
    {
      additional_info: '',
      additional_metadata: {
        age: 'Four Months',
        biosafety_level: '3',
        cell_line_name: 'A549',
        cell_type: 'Microarray',
        cryopreservation: 'Liquid nitrogen',
        culture_conditions: 'Reproducing at a swift rate',
        disease: 'Affymetrix Zebrafish Genome Array',
        ethnicity: 'N/A',
        growth_medium: 'Ethanol',
        number_availible_cell_lines: '20',
        passage_number: '21430780',
        population_doubling_time: '20 Hours',
        sex: 'Male',
        storage_medium: 'Liquid nitrogen vapor phase',
        str_profile:
          'Amelogenin: X Y\nCSF1PO: 11\nD13S317: 8, 14\nD16S539: 9, 11\nD5S818: 11, 13\nD7S820: 10\nTH01: 6, 9.3\nTPOX: 9, 12\nvWA: 16, 17',
        subculturing: 'Methanol',
        tissue_histology: 'Brain Tumor'
      },
      category: 'CELL_LINE',
      contact_email: '',
      contact_name: '',
      contact_user: {
        email: 'secprof@harvard.edu',
        first_name: 'Secundus',
        last_name: 'Profarius',
        published_name: 'Dr. Secundus Profarius'
      },
      created_at: '2020-05-05T19:58:29.941255+00:00',
      embargo_date: '2020-01-30',
      has_pre_print: 'False',
      has_publication: 'True',
      id: 6,
      mta_attachment: {
        created_at: '2020-05-05T19:58:28.561490+00:00',
        description: 'The MTA used by PrimaryLab.',
        download_url: 'https://s3.amazonaws.com/bucket-name/keyname',
        filename: 'PrimaryLabMTA.pdf',
        s3_bucket: 'bucket-name',
        s3_key: 'keyname',
        updated_at: '2020-05-05T19:58:28.561510+00:00'
      },
      needs_shipping_info: 'False',
      organism: ['Danio rerio'],
      organization: {
        id: 4,
        name: 'SecondaryProfOrg'
      },
      pre_print_doi: '',
      pre_print_title: '',
      publication_title: '',
      pubmed_id: '32223680',
      title: 'Zebrafish Cell Line',
      updated_at: '2020-05-05T19:58:29.941279+00:00',
      url: ''
    },
    {
      additional_info: 'This paper was co-authored by Postworth Docktor.',
      additional_metadata: {
        description: 'Data collected from genetically modified zebrafish.',
        number_samples: '15',
        platform: 'Amazon s3 Database',
        study_id: 'phs000328.v2.p1',
        study_id_type: 'dbgap_study_accession',
        technology: 'R-readable array',
        title: 'Zebrafish Analyis'
      },
      category: 'DATASET',
      contact_email: 'pprof@harvard.edu',
      contact_name: 'Prim Proffer',
      contact_user: {
        email: 'pprof@havard.edu',
        first_name: 'Prim',
        last_name: 'Proffer',
        published_name: 'Dr. Prim Proffer'
      },
      created_at: '2020-05-05T19:58:30.019087+00:00',
      embargo_date: '2020-01-30',
      has_pre_print: 'True',
      has_publication: 'False',
      id: 7,
      mta_attachment: {
        created_at: '2020-05-05T19:58:28.561490+00:00',
        description: 'The MTA used by PrimaryLab.',
        download_url: 'https://s3.amazonaws.com/bucket-name/keyname',
        filename: 'PrimaryLabMTA.pdf',
        s3_bucket: 'bucket-name',
        s3_key: 'keyname',
        updated_at: '2020-05-05T19:58:28.561510+00:00'
      },
      needs_shipping_info: 'True',
      organism: ['Danio rerio'],
      organization: {
        id: 1,
        name: 'PrimaryLab'
      },
      pre_print_doi: '10.1109/5.771073',
      pre_print_title: 'Proposal for Data Collection from Zebrafish',
      publication_title: '',
      pubmed_id: '',
      title: 'Zebrafish Dataset',
      updated_at: '2020-05-05T19:58:30.019114+00:00',
      url: ''
    },
    {
      additional_info: 'This tablet was co-authored by Postworth Docktor.',
      additional_metadata: {
        age: '15',
        animal_health_status: 'Good',
        consent_to_share: 'False',
        current_treatment_drug: 'Anastrozole',
        current_treatment_protocol: '30 mg Anastrozole daily',
        diagnosis: 'Stage 4 Lymphoma',
        disease_stage: '1',
        engraftment_time: 'Four days',
        ethnicity: 'Hispanic',
        existing_model_explaination: 'Sublining to do further analysis',
        gender: 'Male',
        goverance_restriction: 'None',
        injection_type_and_site: 'Immediate, left thigh',
        is_from_untreated_patient: 'No',
        is_not_of_EVB_origin: 'Yes',
        is_passage_QA_performed: 'Yes',
        is_strain_immunized: 'Yes',
        lag_time: 'Three months',
        metastases_in_strain: 'Yes',
        model_organism: 'Danio rerio',
        model_strain_and_source: 'Strain 2, from Croatia',
        number_availible_models: '20',
        pdx_id: '81983924',
        pdx_model_availability: 'Availible',
        primary_tissue_of_origin: 'Lung',
        prior_treatment_protocol: '10 mg Anastrozole daily',
        response_to_prior_treatment: 'No response',
        response_to_standard_of_care: 'Positive',
        specific_markers: 'Circulating marker',
        specimen_tumor_tissue: 'Lung',
        submitter_patient_id: '18849839',
        submitter_tumor_id: '92739492',
        tissue_histology: 'Cancerous',
        treatment_for_engraftment: 'Sedation',
        treatment_passage: 'Daily glass of milk',
        treatment_response: 'Positive',
        tumor_characterization_technology: 'Centrifuge',
        tumor_grade: 'AJCC IV',
        tumor_omics: 'Sample #194982984, mouse',
        tumor_preparation: 'Removed and preserved',
        tumor_sample_type: 'Biopsy',
        tumor_type: 'Malignant',
        type_of_humanization: 'Chimeric',
        virology_status: 'Malignant tumor'
      },
      category: 'PDX',
      contact_email: 'pprof@harvard.edu',
      contact_name: 'Prim Proffer',
      contact_user: {
        email: 'pprof@havard.edu',
        first_name: 'Prim',
        last_name: 'Proffer',
        published_name: 'Dr. Prim Proffer'
      },
      created_at: '2020-05-05T19:58:30.140341+00:00',
      embargo_date: '2020-01-30',
      has_pre_print: 'True',
      has_publication: 'False',
      id: 8,
      mta_attachment: {},
      needs_shipping_info: 'True',
      organism: ['Danio rerio', 'Mus musculus'],
      organization: {
        id: 1,
        name: 'PrimaryLab'
      },
      pre_print_doi: '10.1109/5.771073',
      pre_print_title: 'Preliminary research on Grafting to Zebrafish',
      publication_title: 'Grafting to Zebrafish',
      pubmed_id: '',
      title: 'Zebrafish PDX',
      updated_at: '2020-05-05T19:58:30.140362+00:00',
      url: ''
    },
    {
      additional_info: 'This paper was co-authored by Postworth Docktor.',
      additional_metadata: {
        description: 'Data collected from genetically modified zebrafish.',
        number_samples: '15',
        platform: 'Amazon s3 Database',
        study_id: 'GSE24528',
        study_id_type: 'accession_id',
        technology: 'R-readable array',
        title: 'Imported Zebrafish Analyis'
      },
      category: 'DATASET',
      contact_email: '',
      contact_name: '',
      contact_user: {
        email: 'pprof@havard.edu',
        first_name: 'Prim',
        last_name: 'Proffer',
        published_name: 'Dr. Prim Proffer'
      },
      created_at: '2020-05-05T19:58:30.233981+00:00',
      embargo_date: '2020-01-30',
      has_pre_print: 'True',
      has_publication: 'True',
      id: 9,
      mta_attachment: {},
      needs_shipping_info: 'False',
      organism: ['Danio rerio'],
      organization: {
        id: 1,
        name: 'PrimaryLab'
      },
      pre_print_doi: '10.1109/5.771073',
      pre_print_title: 'Proposal for Data Collection from Zebrafish',
      publication_title: 'Data collected from genetically modified zebrafish',
      pubmed_id: '32223680',
      title: 'Imported GEO Dataset',
      updated_at: '2020-05-05T19:58:30.234004+00:00',
      url: 'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE31712'
    },
    {
      additional_info: 'This paper was co-authored by Postworth Docktor.',
      additional_metadata: {
        contact_name: 'Prim Proffer',
        description:
          'This dataset has interesting implications for future research.',
        embargo_date: '2020-01-30',
        number_samples: '15',
        title: 'GEO Zebrafish Analysis'
      },
      category: 'DATASET',
      contact_email: 'pprof@harvard.edu',
      contact_name: null,
      contact_user: {
        email: 'pprof@havard.edu',
        first_name: 'Prim',
        last_name: 'Proffer',
        published_name: 'Dr. Prim Proffer'
      },
      created_at: '2020-05-05T19:58:30.327255+00:00',
      embargo_date: '2020-01-30',
      has_pre_print: 'True',
      has_publication: 'True',
      id: 10,
      mta_attachment: {},
      needs_shipping_info: 'True',
      organism: [],
      organization: {
        id: 1,
        name: 'PrimaryLab'
      },
      pre_print_doi: '10.1109/5.771073',
      pre_print_title: 'Proposal for Data Collection from Zebrafish',
      publication_title: 'Data collected from genetically modified zebrafish',
      pubmed_id: '32223680',
      title: 'Imported SRA Dataset',
      updated_at: '2020-05-05T19:58:30.327279+00:00',
      url: 'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE37165'
    }
  ]
}

export const searchResources = async () => {
  // perform fetch from api
  console.log('faking materials api search endpoint (20ms)')
  const fakeAPICall = new Promise((resolve) =>
    setTimeout(() => resolve(fakeSearchMaterialsResponse), 20)
  )
  const response = await fakeAPICall

  return response
}

export default {
  searchResources
}
