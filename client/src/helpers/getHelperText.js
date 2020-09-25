// attribute name to markdown string
export const helperTexts = {
  bio_safety_level: `Does the unmodified plasmid DNA, either in purified form or when introduced into bacterial or mammalian cells, require handling at Biosafety Level 2 (or higher)?`,
  citation: `How do you want researchers to cite this resource?`,
  contact_user: `This person is responsible for responding to inquiries about resource details, shipping and handling, etc.`,
  organisms: `Provide scientific names of organisms`,
  pre_print_doi: `Example: [bioRxiv](http://link) DOI`,
  purpose: `What does this plasmid do?`,
  relevant_mutations: `Mention any mutations in the gene/insert`,
  sequence_maps: `Upload the full sequence and partial sequence maps. You can generate sequence maps [here](http://link).`,
  str_profile: `You obtain an STR profile for your cell line [here](http://link).`
}

export default (attribute) => {
  return helperTexts[attribute]
}
