export const readableNames = {
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
  ADD_GENE: 'Add Gene',
  PROTOCOLS_IO: 'protocols.io',
  JACKSON_LAB: 'Jax Lab',
  ZIRC_ZFIN: 'ZIRC/ZFIN'
  // OTHER is the same as material category
}

export const getReadable = (symbol) => {
  return readableNames[symbol]
}

export default getReadable
