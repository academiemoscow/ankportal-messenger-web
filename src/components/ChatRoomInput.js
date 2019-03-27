import { connect } from 'react-redux';
import { addAttachments,
		 removeAttachments,
		 setInputText,
		 setInputFieldHeight,
		 setRoomState } from 'redux/actions';

import React from 'react';
import Baron from 'react-baron/dist/es5';
import { 
	FaFeather, 
	FaFileImage,
	FaTimes } from 'react-icons/fa';
 
import Bubbling from 'components/Bubbling';

import firebaseUploader from 'controllers/FirebaseUploader';
import { UploadTask } from 'controllers/UploadTask';
import { FirebaseMessage } from 'controllers/FirebaseMessageUploader';
import firebaseMessageUploader from 'controllers/FirebaseMessageUploader';
import firebaseUsers from 'controllers/FirebaseUserProvider';

class ChatRoomInput extends React.Component {

	state = {
		attachments 	: [],
		sendingMessage 	: false,
		sendingProgress	: 0,
		textareaValue   : ""
	}

	onTextareaTyping = (e) => {
		this.props.setInputText(e.target.value);
		let height = this.estimageTextAreaRowCount(e.target);
		this.props.setInputFieldHeight(Math.min(height > 61 ? height : 61, 300));
		this.userIsTyping();
	}

	onKeyPress = (e) => {
		if ( e.key === 'Enter' && !e.shiftKey ) {
			e.preventDefault();
			this.sendHandler();
		}
	}

	userIsTyping() {
		if ( this.userTypingTimeoutId !== undefined ) clearTimeout(this.userTypingTimeoutId);
		let userDatabaseRef = firebaseUsers.getReferenceForCurrentUid();
		userDatabaseRef.update({typingRoomId : this.props.roomId});
		this.userTypingTimeoutId = setTimeout(function() { 
			userDatabaseRef.update({typingRoomId : ""}); 
		}, 3000);
	}

	measureText(pText, pFontSize, pStyle) {
	    let lDiv = document.createElement('div');

	    document.getElementById('root').appendChild(lDiv);

	    if (pStyle != null) {
	        lDiv.style = pStyle;
	    }
	    lDiv.style.fontSize = "" + pFontSize + "px";
	    lDiv.className = "get-height-for-text-div";

	    lDiv.innerHTML = pText;
	    var lResult = {
	        width: lDiv.clientWidth,
	        height: lDiv.clientHeight
	    };
	    document.getElementById('root').removeChild(lDiv);

	    lDiv = null;

	    return lResult;
	}

	estimageTextAreaRowCount = (textarea) => {
		let textareaWidth = textarea.getBoundingClientRect().width;
		let textHeight = this.measureText(
			textarea.value, 
			'1rem', 
			'line-height: 25px; width: ' + textareaWidth + 'px; padding: .375rem .75rem;'
		).height;
		return textHeight;
	}

	attachFilesHandler = () => {
		this.refs.attachmentsHolder.click();
	}

	attachmentsChange = (e) => {
		let files = this.refs.attachmentsHolder.files;
		if ( files === undefined ) return;
		this.props.addAttachments(Object.values(files));
		this.refs.attachmentsHolder.value = "";
	}

	getAttachContainerClasses = () => {
		if ( this.props.attachments.length > 0 ) {
			return "attachments-container visible";
		}
		return "attachments-container";
	}

	getRemoveAttachFunction = (elem) => {
		return function() {
			this.props.removeAttachments([elem]);
		}
	}

	getClassForFile = (filename) => {
		if ( (/\.(gif|jpg|jpeg|tiff|png)$/i).test(filename) ) return "image-attachment";
		if ( (/\.(mov|mp4|avi|mkv|mpeg)$/i).test(filename) ) return "video-attachment";
		if ( (/\.(wav|mp3|flac|midi|amr)$/i).test(filename) ) return "audio-attachment";
		return "document-attachment";
	}

	getClassesForAttachment = (file) => {
		let classes = "attachments-group shadow rounded";
		return classes + " " + this.getClassForFile(file.name);
	}

	renderAttachments = () => {
		let attachmentViews = [];
		this.props.attachments.forEach(function(element, index) {
			let attachmentElement = (
				<div 
					key 		= {index} 
					className 	= "attachment-card ml-2 mt-2">
					<div 
						className 	= { this.getClassesForAttachment(element) }>
						<button 
							className	= "badge badge-primary border-0 btn rounded-circle"
							onClick 	= { this.getRemoveAttachFunction(element).bind(this) } ><FaTimes /></button>
					</div>
					<div className = "label">{ element.name }</div>
				</div>
			)
			attachmentViews.push(attachmentElement);
		}.bind(this));
		return attachmentViews;
	}

	uploadAttachments = (onComplete = () => {}) => {
		let uploadTask = new UploadTask(this.props.roomId);

		if ( this.props.attachments.length === 0 ) {
			return onComplete(this.props.roomId);
		}

		uploadTask.onComplete = ((roomId, firebaseFiles) => {
			onComplete(roomId, firebaseFiles);
		});

		uploadTask.onProgress = ((roomId, progress) => {
			this.props.setRoomState({ sendingProgress: progress });
		});

		uploadTask.onError = ((roomId, error) => {
			this.props.setRoomState({
				sendingMessage	: false,
				sendingProgress : 0
			})
		});

		this.props.attachments.forEach(function(file) {

			uploadTask.addFile(
				file,
				this.getStorageRefForFile(uploadTask.roomId, file)
			)

		}.bind(this));
		firebaseUploader.runTask(uploadTask);
	}

	sendMessage = (roomId, messageProps, onComplete = () => {}) => {
		const ref = firebaseMessageUploader.getNewMessageRef(roomId);
		const defaultMessage = FirebaseMessage.getMessageFor(roomId);
		const message = {
			...defaultMessage,
			...messageProps,
			messageId : ref.key
		}
		firebaseMessageUploader.addUpdateTask(ref, message);
	}

	sendHandler = () => {
		if ( this.props.attachments.length === 0 && this.refs.inputTextArea.value === "" ) return;
		this.props.setRoomState({ 
			sendingMessage : true,
			sendingProgress: 0 });

		this.uploadAttachments(function(roomId, firebaseFiles) {

            if ( firebaseFiles ) {
				firebaseFiles.forEach(file => {
					this.sendMessage(roomId, {
						pathToImage: file.storageRefPath
					})
				})
            }

			const messageText = this.refs.inputTextArea.value;

			this.props.setRoomState({
				sendingMessage  : false,
				attachments     : [],
				roomInputText   : '',
				roomInputHeight : 61
			});

			if ( !messageText || messageText === '' ) return;
			this.sendMessage(roomId, {
					text: messageText
			})
		}.bind(this));
	}

	getStorageRefForFile(roomId, file) {
		return `${ roomId }/${ (new Date()).valueOf() } ${ file.name }`; 
	}

	renderProgressBar = () => {
		if ( !this.props.sendingMessage ) return;
		return (
			<div className="progress">
				<div className="progress-bar bg-info" style={{ width: this.props.sendingProgress + '%' }}></div>
			</div>
		)
	}

	deleteAllAttachmentsBtn = () => {
		this.props.removeAttachments(this.props.attachments);
	}

	render() {
		const inputHeight = this.props.roomInputHeight
		return (
			<div className="chat-room-input border-top">
				{ this.renderProgressBar() }
				<div className={ this.getAttachContainerClasses() }>
					<input 	type	 = "file" 
							id 		 = "file" 
							accept   = "image/*"
							ref 	 = "attachmentsHolder"
							onChange = { this.attachmentsChange.bind(this) }
							multiple />
					<button className	= "btn btn-primary close-btn rounded-0" 
							onClick 	= { this.deleteAllAttachmentsBtn }><FaTimes /></button>
					<Baron>
						{ this.renderAttachments() }
					</Baron>
				</div>
				<div 	className 	= "input-group bg-gradient" 
						style 		= { { height: inputHeight } }
						ref 		= "inputGroup">
					<div className="input-group-prepend mt-auto">
						<button className 	= "shadow btn btn-dark rounded-0 border-0"
								type 		= "button" 
								id 			= "button-addon2"
								onClick 	= { this.attachFilesHandler }> <FaFileImage size="1.5em" />
						</button>
					</div>
					<div className   = "form-control border-0 p-0 area-container bg-gradient">
						<textarea 	className   = "form-control border-0" 
									style       = { { overflow: inputHeight < 300 ? "hidden" : "auto" } }
									aria-label  = "With textarea" 
									placeholder = "Сообщение..."
									ref 		= "inputTextArea"
									onChange 	= { this.onTextareaTyping }
									onKeyPress  = { this.onKeyPress }
									value       = { this.props.roomInputText }>
						</textarea>
					</div>
					<div className="input-group-append mt-auto">
						<button className	= "shadow btn btn-primary rounded-0 border-0" 
								type		= "button" 
								id 			= "button-addon2"
								onClick 	= { this.sendHandler }
								disabled 	= { this.props.sendingMessage ? "disabled" : "" }> 
								{ this.state.sendingMessage ? <Bubbling /> : <FaFeather size="1.5em" /> }
						</button>
					</div>
				</div>
			</div>
			);
	}
}

const mapDispatchToProps = (dispatch, ownProps) => ({
  addAttachments: (attachments) => dispatch(addAttachments(ownProps.roomId, attachments)),
  removeAttachments: (attachments) => dispatch(removeAttachments(ownProps.roomId, attachments)),
  setInputText: (text) => dispatch(setInputText(ownProps.roomId, text)),
  setInputFieldHeight: (height) => dispatch(setInputFieldHeight(ownProps.roomId, height)),
  setRoomState: (roomState) => dispatch(setRoomState(ownProps.roomId, roomState))
})

const mapStateToProps = (state, ownProps) => ({
  attachments  	 : !state.roomInputState[ownProps.roomId] || !state.roomInputState[ownProps.roomId].attachments ? [] : state.roomInputState[ownProps.roomId].attachments,
  roomInputText  : !state.roomInputState[ownProps.roomId] || !state.roomInputState[ownProps.roomId].roomInputText ? "" : state.roomInputState[ownProps.roomId].roomInputText,
  roomInputHeight: !state.roomInputState[ownProps.roomId] || !state.roomInputState[ownProps.roomId].roomInputHeight ? 61 : state.roomInputState[ownProps.roomId].roomInputHeight,
  sendingMessage: !state.roomInputState[ownProps.roomId] || !state.roomInputState[ownProps.roomId].sendingMessage ? false : state.roomInputState[ownProps.roomId].sendingMessage,
  sendingProgress: !state.roomInputState[ownProps.roomId] || !state.roomInputState[ownProps.roomId].sendingProgress ? 0 : state.roomInputState[ownProps.roomId].sendingProgress
})

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(ChatRoomInput);