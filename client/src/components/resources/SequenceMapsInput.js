import React from 'react'
import {
  Box,
  Button,
  FormField,
  Heading,
  Image,
  Stack,
  Text,
  TextArea
} from 'grommet'
import api, { host } from 'api'
import { useUser } from 'hooks/useUser'
import useResourceForm from 'hooks/useResourceForm'
import { useAlertsQueue } from 'hooks/useAlertsQueue'
import DropZone from 'components/DropZone'
import { Modal } from 'components/Modal'
import Icon from 'components/Icon'

// TODO: Most of this API logic should be put into an hook
// to encapulate state operations and failure
// Actually, this might be best as a generic AttachmentInput
// with a useAttachment hook

// This is the component in the modal that shows the photo
// and the input for the description
const SequenceMapInput = ({ sequenceMap, setSequenceMapSequence }) => {
  return (
    <Box>
      <Box direction="row" gap="large">
        <Box basis="1/4" height="158px">
          {sequenceMap.id && (
            <Image fit="cover" src={`${host}${sequenceMap.download_url}`} />
          )}
          {!sequenceMap.id && <Image fit="cover" src={sequenceMap.dataURL} />}
        </Box>
        <FormField basis="3/4" label="Sequence" help="FASTA format only">
          <TextArea
            fill
            value={sequenceMap.description}
            onChange={({ target: { value } }) => {
              setSequenceMapSequence(value)
            }}
          />
        </FormField>
      </Box>
      <Text textAlign="end" color="black-tint-80">
        {(sequenceMap.description || '').length}
      </Text>
    </Box>
  )
}

// This modal shows a list of sequenceMaps to upload
// or a single sequenceMap to edit

const SequenceMapsEditModal = ({
  onDone,
  editSequenceMap,
  setEditSequenceMap,
  newSequenceMaps = [],
  setNewSequenceMaps,
  modalMode,
  showing,
  setShowing
}) => {
  return (
    <Modal showing={showing} setShowing={setShowing}>
      <Box width="large" gap="medium">
        <Box border={{ side: 'bottom', color: 'black-tint-80', size: 'small' }}>
          <Heading serif level={4} weight="normal" margin="none">
            Associate Sequences
          </Heading>
        </Box>
        {modalMode === 'edit' && (
          <SequenceMapInput
            key={`edit_${editSequenceMap.id}`}
            sequenceMap={editSequenceMap}
            setSequenceMapSequence={(value) => {
              setEditSequenceMap({ ...editSequenceMap, description: value })
            }}
          />
        )}
        {modalMode === 'new' &&
          newSequenceMaps.map((sequenceMap, i) => (
            <SequenceMapInput
              key={`upload_${sequenceMap.file.path}`}
              sequenceMap={sequenceMap}
              setSequenceMapSequence={(value) => {
                /* disable for now there is a better way to do this */
                /* eslint-disable-next-line */
              newSequenceMaps[i].description = value
                setNewSequenceMaps([...newSequenceMaps])
              }}
            />
          ))}
        <Button primary label="Done" onClick={onDone} alignSelf="end" />
      </Box>
    </Modal>
  )
}

// sequenceMaps are attachments
// with:
// `filename`: Take from the file
// `file`: the File object from the input
// `dataURL`: the file converted to a data URL for previewing (only for non-uploaded)
// `description`: the text for the sequence
// console.log(attachment)

// onDone is either after uploading or saving changes
export default ({ inputValue = [], onDone }) => {
  const { addAlert } = useAlertsQueue()
  const [modalMode, setModalMode] = React.useState('')
  const [newSequenceMaps, setNewSequenceMaps] = React.useState([])
  const [editSequenceMap, setEditSequenceMap] = React.useState()
  const [showModal, setShowModal] = React.useState(false)
  const { token } = useUser()
  const { getAttribute } = useResourceForm()

  const onClickEditSequenceMap = (sequenceMap) => {
    setEditSequenceMap(sequenceMap)
    setModalMode('edit')
    setShowModal(true)
  }

  const onDelete = async (id) => {
    const deleteRequest = await api.attachments.delete(id, token)
    const { isOk, status } = deleteRequest
    if (isOk || status === 404) {
      const inputWithoutDeleted = inputValue.filter((map) => map.id !== id)
      onDone(inputWithoutDeleted)
    } else {
      addAlert('Error occurred while removing Sequence Map', 'error')
    }
  }

  const saveChanges = async () => {
    const newInputValue = []
    const ownedByOrg = getAttribute('organization')
    // didnt edit any existing maps
    // extend with new items
    if (modalMode === 'new') {
      const requests = newSequenceMaps.map((sequenceMap) =>
        api.attachments.create(
          {
            ...sequenceMap,
            owned_by_org: ownedByOrg
          },
          token
        )
      )

      // this filters out failed requests
      // TODO: recove them and reopen the modal
      // or optionally just alert failures
      const savedSequenceMaps = (await Promise.all(requests))
        .filter((req) => req.isOk)
        .map((req) => req.response)

      if (savedSequenceMaps.length !== newSequenceMaps.length) {
        addAlert('Error Uploading Sequence Map', 'error')
      }

      newInputValue.push(...inputValue, ...savedSequenceMaps)
    }

    if (modalMode === 'edit') {
      // we are only editing the desciption here
      // you can delete from outside the modal
      const { description } = editSequenceMap
      const request = await api.attachments.update(
        editSequenceMap.id,
        { description, owned_by_org: ownedByOrg },
        token
      )

      if (request.isOk) {
        const updatedMap = request.response
        const nonUpdates = inputValue.filter(
          (sequenceMap) => sequenceMap.id !== editSequenceMap.id
        )
        newInputValue.push(...nonUpdates, updatedMap)
      } else {
        // dont update anything just alert
        addAlert('Error Updating Sequence Map', 'error')
        newInputValue.push(...inputValue)
      }
    }

    onDone(newInputValue)
    setShowModal(false)
  }

  const onDrop = (newFiles) => {
    const loadedSequenceMaps = []

    // This loads all of the files to preview
    // in vanilla js you define the onload function
    // then do the thing that triggers it ( create the data url)
    // the last one to load opens the edit modal
    newFiles.forEach((newFile) => {
      const reader = new FileReader()
      reader.onload = () => {
        loadedSequenceMaps.push({
          file: newFile,
          dataURL: reader.result
        })
        if (loadedSequenceMaps.length === newFiles.length) {
          setNewSequenceMaps(loadedSequenceMaps)
          setModalMode('new')
          setShowModal(true)
        }
      }
      reader.readAsDataURL(newFile)
    })
  }

  return (
    <>
      {inputValue.length > 0 && (
        <Box direction="row" justify="start" gap="medium">
          {inputValue.map((sequenceMap) => (
            <Stack key={`click_to_edit_${sequenceMap.id}`} anchor="top-right">
              <Box width="120px" height="120px" pad="medium">
                <Box
                  onClick={() => {
                    onClickEditSequenceMap(sequenceMap)
                  }}
                >
                  <Image
                    fit="cover"
                    src={`${host}${sequenceMap.download_url}`}
                  />
                  <Text truncate>{sequenceMap.filename}</Text>
                </Box>
              </Box>
              <Box
                round
                background="black-tint-95"
                pad="xsmall"
                onClick={() => onDelete(sequenceMap.id)}
              >
                <Icon color="black" name="Cross" size="xsmall" />
              </Box>
            </Stack>
          ))}
        </Box>
      )}
      <DropZone fileTypes={['png', 'jpg']} onDrop={onDrop} />
      <SequenceMapsEditModal
        showing={showModal}
        setShowing={setShowModal}
        onDone={saveChanges}
        editSequenceMap={editSequenceMap}
        setEditSequenceMap={setEditSequenceMap}
        newSequenceMaps={newSequenceMaps}
        setNewSequenceMaps={setNewSequenceMaps}
        modalMode={modalMode}
      />
    </>
  )
}
