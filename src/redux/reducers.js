export const roomInput = (state = [], action) => {
  switch (action.type) {
    case 'ADD_ATTACHMENT':
      return {
        ...state,
        [action.roomId] : {
          ...state[action.roomId],
          attachments: !state[action.roomId] || !state[action.roomId].attachments ? action.attachments : 
                       state[action.roomId].attachments.concat(action.attachments)
        }
      }
    case 'REMOVE_ATTACHMENTS':
      return {
        ...state,
        [action.roomId] : {
          ...state[action.roomId],
          attachments: state[action.roomId].attachments
          .filter(function(attach) { 
            return action.attachments.indexOf(attach) === -1 
          })
        }
      }
    case 'SET_INPUT_TEXT':
      return {
        ...state,
        [action.roomId] : {
          ...state[action.roomId],
          roomInputText: action.text
        }
      }
    case 'SET_INPUTFIELD_HEIGHT':
      return {
        ...state,
        [action.roomId] : {
          ...state[action.roomId],
          roomInputHeight: action.inputHeight
        }
      }
    default:
      return state
  }
}

export const imageDownload = (state = [], action) => {
  switch (action.type) {
    case 'IMAGE_DID_LOADED':
      return {
        ...state,
        [action.pathToImage] : action.url
      }
    default:
      return state
  }
}