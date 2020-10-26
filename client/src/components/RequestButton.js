import React from 'react'
import { Button } from 'grommet'
import Link from 'next/link'
import CreateAccountLoginButton from 'components/CreateAccountLoginButton'
import { useUser } from 'hooks/useUser'
import { getReadable } from 'helpers/readableNames'

export const RequestButton = ({ resource }) => {
  const { isLoggedIn } = useUser()

  const requestLink = resource.imported
    ? resource.url
    : `/resources/${resource.id}/request`

  if (!isLoggedIn)
    return <CreateAccountLoginButton title="Sign in to Request" plainButton />

  return resource.imported ? (
    <Button
      as="a"
      href={requestLink}
      target="_blank"
      label={`Request on ${
        getReadable(resource.import_source) || 'Source Site'
      }`}
      margin={{ bottom: 'small' }}
      primary
    />
  ) : (
    <Link href={requestLink}>
      <Button as="a" href={requestLink} label="Request" primary />
    </Link>
  )
}

export default RequestButton
