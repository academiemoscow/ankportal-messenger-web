import { connect } from 'react-redux';
import { addAttachments,
		 removeAttachments,
		 setInputText,
		 setInputFieldHeight } from 'redux/actions';

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
		if ( e.key === '\n' ) {
			console.log("send...");
		}
		this.userIsTyping();
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

		if ( this.state.attachments.length === 0 ) {
			return onComplete(this.props.roomId);
		}

		uploadTask.onComplete = ((roomId, firebaseFiles) => {
			onComplete(roomId, firebaseFiles);
		});

		uploadTask.onProgress = ((roomId, progress) => {
			this.setState({ sendingProgress: progress });
		});

		uploadTask.onError = ((roomId, error) => {
			this.setState({
				sendingMessage	: false,
				sendingProgress : 0
			})
		});

		this.state.attachments.forEach(function(file) {

			uploadTask.addFile(
				file,
				this.getStorageRefForFile(uploadTask.roomId, file)
			)

		}.bind(this));
		firebaseUploader.runTask(uploadTask);
	}

	sendHandler = () => {
		if ( this.state.attachments.length === 0 && this.refs.inputTextArea.value === "" ) return;
		this.setState({ 
			sendingMessage : true,
			sendingProgress: 0 });

		this.uploadAttachments(function(roomId, firebaseFiles) {
			let text = this.refs.inputTextArea.value;
			let message = FirebaseMessage.textMessage(text, roomId);
			let ref = firebaseMessageUploader.getNewMessageRef(roomId);
			message.messageId = ref.key;
			ref.set(message, function() {
				this.setState({
					sendingMessage: false,
					attachments   : []
				});
			}.bind(this));
		}.bind(this));
	}

	getStorageRefForFile(roomId, file) {
		return `${ roomId }/${ (new Date()).valueOf() } ${ file.name }`; 
	}

	renderProgressBar = () => {
		if ( !this.state.sendingMessage ) return;
		return (
			<div className="progress">
				<div className="progress-bar bg-info" style={{ width: this.state.sendingProgress + '%' }}></div>
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
									placeholder = "Введите здесь сообщение..."
									ref 		= "inputTextArea"
									onChange 	= { this.onTextareaTyping }
									value       = { this.props.roomInputText }>
						</textarea>
					</div>
					<div className="input-group-append mt-auto">
						<button className	= "shadow btn btn-primary rounded-0 border-0" 
								type		= "button" 
								id 			= "button-addon2"
								onClick 	= { this.sendHandler }
								disabled 	= { this.state.sendingMessage ? "disabled" : "" }> 
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
  setInputFieldHeight: (height) => dispatch(setInputFieldHeight(ownProps.roomId, height))
})

const mapStateToProps = (state, ownProps) => ({
  attachments  	 : !state.roomInputState[ownProps.roomId] || !state.roomInputState[ownProps.roomId].attachments ? [] : state.roomInputState[ownProps.roomId].attachments,
  roomInputText  : !state.roomInputState[ownProps.roomId] || !state.roomInputState[ownProps.roomId].roomInputText ? "" : state.roomInputState[ownProps.roomId].roomInputText,
  roomInputHeight: !state.roomInputState[ownProps.roomId] || !state.roomInputState[ownProps.roomId].roomInputHeight ? 61 : state.roomInputState[ownProps.roomId].roomInputHeight
})

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(ChatRoomInput);