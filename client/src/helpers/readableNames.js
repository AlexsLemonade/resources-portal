export const readableNames = {
  ALL: 'All',
  // material categories
  CELL_LINE: 'Cell Line',
  PLASMID: 'Plasmid',
  PROTOCOL: 'Protocol',
  DATASET: 'Dataset',
  MODEL_ORGANISM: 'Model Organism',
  PDX: 'PDX Model',
  OTHER: 'Other',

  // import sources
  GEO: 'GEO',
  SRA: 'SRA',
  DBGAP: 'dbGaP',
  ATCC: 'ATCC',
  ADDGENE: 'Add Gene',
  PROTOCOLS_IO: 'protocols.io',
  JACKSON_LABS: 'Jax Lab',
  ZIRC: 'ZIRC'
  // OTHER is the same as material category
}

export const getReadable = (symbol) => {
  return readableNames[symbol]
}

export const getToken = (readable) => {
  const readableNameMatch = Object.entries(readableNames).find((pair) =>
    pair.includes(readable)
  )

  return readableNameMatch ? readableNameMatch[0] : undefined
}

export default getReadable
