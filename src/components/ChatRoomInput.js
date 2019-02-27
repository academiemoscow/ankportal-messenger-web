import React from 'react';
import Baron from 'react-baron/dist/es5';
import { 
	FaFeather, 
	FaFileImage,
	FaTimes } from 'react-icons/fa';
 
import Bubbling from 'components/Bubbling';

import firebaseUploader from 'controllers/FirebaseUploader';
import { UploadTask } from 'controllers/UploadTask';

export default class ChatRoomInput extends React.Component {

	state = {
		attachments 	: [],
		sendingMessage 	: false
	}

	onTextareaTyping = (e) => {
		if ( e.key === '\n' ) {
			console.log("send...");
		}
	}

	attachFilesHandler = () => {
		this.refs.attachmentsHolder.click();
	}

	attachmentsChange = (e) => {
		let files = this.refs.attachmentsHolder.files;
		if ( files === undefined ) return;
		this.setState({ attachments: this.state.attachments.concat(Object.values(files)) });
	}

	getAttachContainerClasses = () => {
		if ( this.state.attachments.length > 0 ) {
			return "attachments-container visible";
		}
		return "attachments-container";
	}

	getRemoveAttachFunction = (elem) => {
		return function() {
			this.setState({
				attachments: this.state.attachments.filter(function(attach) { return attach !== elem })
			});
		}
	}

	getClassForFile = (filename) => {
		if ( (/\.(gif|jpg|jpeg|tiff|png)$/i).test(filename) ) return "image-attachment";
		if ( (/\.(mov|mp4|avi|mkv|mpeg)$/i).test(filename) ) return "video-attachment";
		if ( (/\.(wav|mp3|flac|midi|amr)$/i).test(filename) ) return "audio-attachment";
		return "document-attachment";
	}

	getClassesForAttachment = (file) => {
		let classes = "attachments-group shadow rounded ml-3 mt-3";
		let fileClass = this.getClassForFile(file.name);
		return fileClass + " " + classes;
	}

	renderAttachments = () => {
		let attachmentViews = [];
		this.state.attachments.forEach(function(element, index) {
			let attachmentElement = (

				<div key={index} className = { this.getClassesForAttachment(element) }>
					<button 
						className	= "badge badge-primary border-0 btn rounded-circle"
						onClick 	= { this.getRemoveAttachFunction(element).bind(this) } ><FaTimes /></button>
					<div className = "label">{ element.name }</div>
				</div>
			)
			attachmentViews.push(attachmentElement);
		}.bind(this));
		return attachmentViews;
	}

	sendHandler = () => {
		if ( this.state.attachments.length === 0 && this.refs.inputTextArea.value === "" ) return;
		this.setState({ sendingMessage: true });
		let uploadTask = new UploadTask();
		this.state.attachments.forEach(function(file) {

			uploadTask.addFile(
				file,
				this.getStorageRefForFile(file),
				function(firebaseFiles) {
					this.setState({
						sendingMessage: false,
						attachments   : []
					});
					console.log(firebaseFiles);
				}.bind(this)
				)

		}.bind(this));
		firebaseUploader.runTask(uploadTask);
	}

	getStorageRefForFile(file) {
		return this.props.roomId + '/images/' + (new Date()).valueOf() + file.name; 
	}

	render() {
		return (
			<div className="chat-room-input border-top">
				<div className={ this.getAttachContainerClasses() }>
					<input 	type	 = "file" 
							id 		 = "file" 
							ref 	 = "attachmentsHolder"
							onChange = { this.attachmentsChange.bind(this) }
							multiple />
					<Baron>
						{ this.renderAttachments() }
					</Baron>
				</div>
				<div className="input-group">
					<div className="input-group-prepend">
						<button className 	= "shadow btn btn-dark rounded-0 border-bottom-0 border-left-0 border-right border-top-0"
								type 		= "button" 
								id 			= "button-addon2"
								onClick 	= { this.attachFilesHandler }> <FaFileImage size="1.5em" />
						</button>
					</div>
					<textarea 	className   = "form-control border-0" 
								aria-label  = "With textarea" 
								placeholder = "Введите здесь сообщение..."
								ref 		= "inputTextArea"
								onKeyPress	= { this.onTextareaTyping }>
					</textarea>
					<div className="input-group-append">
						<button className	= "shadow btn btn-success rounded-0 border-bottom-0 border-left border-right-0 border-top-0" 
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