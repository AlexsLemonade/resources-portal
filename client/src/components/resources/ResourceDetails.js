import React from 'react'
import { getReadable } from 'helpers/readableNames'
import { getResourceData } from 'helpers/getResourceData'
import { HeaderRow } from 'components/HeaderRow'
import DetailsTable from 'components/DetailsTable'
import configs from './configs'

export const ResourceDetails = ({ resource }) => {
  const { details } = configs[resource.category]
  return (
    <>
      {details.map((detail) => (
        <React.Fragment key={Object.keys(detail)[0]}>
          <HeaderRow label={getReadable(Object.keys(detail)[0])} />
          <DetailsTable
            data={Object.values(detail)[0].map((attribute) =>
              getResourceData(resource, attribute)
            )}
          />
        </React.Fragment>
      ))}
    </>
  )
}
