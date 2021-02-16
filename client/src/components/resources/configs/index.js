import cellLine from './cellLine'
import dataset from './dataset'
import modelOrganism from './modelOrganism'
import other from './other'
import pdx from './pdx'
import plasmid from './plasmid'
import protocol from './protocol'

export const formDefaults = [
  {
    contact_user: ['contact_user']
  },
  {
    publication_information: [
      'pubmed_id',
      'publication_title',
      'pre_print_doi',
      'pre_print_title',
      'citation'
    ]
  }
]

const configs = {
  CELL_LINE: cellLine,
  DATASET: dataset,
  MODEL_ORGANISM: modelOrganism,
  OTHER: other,
  PDX: pdx,
  PLASMID: plasmid,
  PROTOCOL: protocol
}

export const getDetails = (resource) => {
  const { listForm, importForm } = configs[resource.category]
  const form = resource.import_source ? importForm : listForm
  return typeof form === 'function' ? form(resource) : form
}

export default configs
