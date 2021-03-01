import React from 'react'
import { Box, Paragraph, Text } from 'grommet'
import RadioButtonGroup from 'components/RadioButtonGroup'
import Button from 'components/Button'
import { Modal } from 'components/Modal'
import Icon from 'components/Icon'
import useTeamForm from 'hooks/useTeamForm'

export default ({ grant }) => {
  const options = [
    {
      label: 'Remove Grant Only',
      description:
        'Members of the team can no longer associate new resources with this grant but can continue to manage existing resources associated with this grant.',
      value: 'false'
    },
    {
      label: 'Remove Grants and all resources associated with it from the Team',
      description:
        "Members of the team can no longer add or manage resources associated with this grant. The resources will be moved to Grant holder's personal account and they will be responsible for managing them.",
      value: 'true'
    }
  ]

  const [showModal, setShowModal] = React.useState()
  const [showOptions, setShowOptions] = React.useState(true)
  const [transfer, setTransfer] = React.useState(options[0].value)

  const {
    removeGrant,
    team: { name, id: teamId, materials: resources },
    fetchTeam
  } = useTeamForm()

  const close = () => {
    setTransfer(options[0].value)
    setShowOptions(true)
    setShowModal(false)
  }

  const removeGrantAndRefresh = async () => {
    await removeGrant(teamId, grant.id, { transfer })
    await fetchTeam(teamId)
    close()
  }

  const grantResources = resources.filter((r) => grant.materials.includes(r.id))
  const resourcesCount = grantResources.length
  const hasGrantResources = resourcesCount > 0
  const hasManyResources = resourcesCount > 1

  return (
    <>
      <Button
        plain
        size="small"
        color="error"
        icon={<Icon name="Trashcan" color="error" size="small" />}
        label="Remove"
        onClick={() => setShowModal(true)}
      />
      <Modal
        showing={showModal}
        setShowing={setShowModal}
        critical
        title="Remove Grant"
      >
        {hasGrantResources &&
          (showOptions ? (
            <>
              <Box width="large">
                <Text margin={{ vertical: 'medium' }}>
                  {name} has {resourcesCount} resource{hasManyResources && 's'}{' '}
                  associated with {grant.title}.
                </Text>
                <RadioButtonGroup
                  value={transfer}
                  options={options}
                  onChange={({ target: { value: newValue } }) => {
                    setTransfer(newValue)
                  }}
                />
              </Box>
              <Box direction="row" justify="end" gap="medium">
                <Button label="Cancel" onClick={close} />
                <Button
                  critical
                  label="Remove Grant"
                  onClick={() => setShowOptions(false)}
                />
              </Box>
            </>
          ) : (
            <>
              <Box margin={{ vertical: 'medium' }}>
                <Paragraph>
                  Are you sure you want to remove{' '}
                  <Text weight="bold">{grant.title}</Text>
                  {transfer === 'true' && " and all it's resources"} from {name}
                  ?
                </Paragraph>
                <Paragraph>
                  {transfer === 'false' ? (
                    <Text weight="bold">
                      Members of the team can no longer be able to associate new
                      resources with this grant but can continue to manage
                      exisiting resources associated with this grant.
                    </Text>
                  ) : (
                    <Text weight="bold">
                      Members of the team can no longer manage resources
                      associated with this grant. The Grant Holder wil be
                      responsible for managing these resources.
                    </Text>
                  )}
                </Paragraph>
              </Box>
              <Box direction="row" justify="end" gap="medium">
                <Button label="Back" onClick={() => setShowOptions(true)} />
                <Button critical label="Yes" onClick={removeGrantAndRefresh} />
              </Box>
            </>
          ))}
        {!hasGrantResources && (
          <>
            <Box margin={{ vertical: 'medium' }}>
              <Paragraph>
                Are you sure you want to remove{' '}
                <Text weight="bold">{grant.title}</Text> from {name}?
              </Paragraph>
              <Paragraph>
                <Text weight="bold">
                  Members of the team will no longer be able to associate new
                  resources with this grant.
                </Text>
              </Paragraph>
            </Box>
            <Box direction="row" justify="end" gap="medium">
              <Button label="Back" onClick={close} />
              <Button
                critical
                label="Remove Grant"
                onClick={removeGrantAndRefresh}
              />
            </Box>
          </>
        )}
      </Modal>
    </>
  )
}
