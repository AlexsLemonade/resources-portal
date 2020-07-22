import React from 'react'
import { getReadable } from '../../helpers/readableNames'
import { getResourceValue } from '../../helpers/getResourceValue'
import { HeaderRow } from '../HeaderRow'
import DetailsTable from '../DetailsTable'
import configs from './configs'

export const ResourceDetails = ({ resource }) => {
  const { details } = configs[resource.category]
  return (
    <>
      {details.map((detail) => (
        <React.Fragment key={Object.keys(detail)[0]}>
          <HeaderRow label={Object.keys(detail)[0]} />
          <DetailsTable
            data={Object.values(detail)[0].map((attribute) => ({
              label: getReadable(attribute),
              // this needs to be a function to allow for custom attributes
              value: getResourceValue(resource, attribute)
            }))}
          />
        </React.Fragment>
      ))}
    </>
  )
}
