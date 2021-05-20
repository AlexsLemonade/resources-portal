// attribute name to markdown string
export const helperTexts = {
  biosafety_level: `Does the unmodified plasmid DNA, either in purified form or when introduced into bacterial or mammalian cells, require handling at Biosafety Level 2 (or higher)? Biosafety classification is based on [U.S. Public Health Service Guidelines](https://www.cdc.gov/labs/BMBL.html), it is the responsibility of the customer to ensure that their facilities comply with biosafety regulations for their own country.`,
  citation: `How do you want researchers to cite this resource?`,
  contact_user: `This person is responsible for responding to inquiries about resource details, shipping and handling, etc.`,
  organisms: `Provide scientific names of organisms`,
  pre_print_doi: `Example: [bioRxiv](https://www.biorxiv.org/) DOI`,
  purpose: `What does this plasmid do?`,
  relevant_mutations: `Mention any mutations in the gene/insert`,
  sequence_maps: `Upload the full sequence and partial sequence maps. You can generate sequence maps [here](http://wishart.biology.ualberta.ca/PlasMapper/).`,
  str_profile: `You obtain an STR profile for your cell line [here](https://www.atcc.org/en/Services/Testing_Services.aspx).`,
  url: 'Urls must start with **http**. (ex: https://alexslemonade.org)'
}

export default (attribute) => {
  return helperTexts[attribute]
}
