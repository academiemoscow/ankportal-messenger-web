export const addAttachments = (roomId, attachments) => ({
  type: 'ADD_ATTACHMENT',
  roomId,
  attachments
})

export const removeAttachments = (roomId, attachments) => ({
  type: 'REMOVE_ATTACHMENTS',
  roomId,
  attachments
})

export const setInputText = (roomId, text) => ({
  type: 'SET_INPUT_TEXT',
  roomId,
  text
})

export const setInputFieldHeight = (roomId, inputHeight) => ({
  type: 'SET_INPUTFIELD_HEIGHT',
  roomId,
  inputHeight
})

export const imageUrlDidLoaded = (pathToImage, url) => ({
  type: 'IMAGE_DID_LOADED',
  pathToImage,
  url
})