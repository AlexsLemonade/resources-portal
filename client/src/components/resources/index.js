import React from 'react'

// import resources
import CellLine from './CellLine'
import Plasmid from './Plasmid'
import Protocol from './Protocol'
import Dataset from './Dataset'
import ModelOrganism from './ModelOrganism'
import Pdx from './Pdx'
import Other from './Other'

export const Mappings = {
  CELL_LINE: CellLine,
  PLASMID: Plasmid,
  PROTOCOL: Protocol,
  DATASET: Dataset,
  MODEL_ORGANISM: ModelOrganism,
  PDX: Pdx,
  OTHER: Other
}

function findResourceComponent(category) {
  if (Mappings[category]) {
    return Mappings[category]
  }

  throw new Error(
    `Resource category not defined for ${category}. Look into the /resources folder of the project.`
  )
}

const ResourceComponentGetter = (key) => ({ resource }) => {
  const ResourceComponent = findResourceComponent(resource.category)
  if (!ResourceComponent[key]) {
    throw new Error(
      `Resource ${resource.category} doesn't have ${key} defined.`
    )
  }
  const Resource = ResourceComponent[key]

  return <Resource resource={resource} />
}

export const SearchResult = ResourceComponentGetter('SearchResult')
export const ResourceDetails = ResourceComponentGetter('ResourceDetails')
