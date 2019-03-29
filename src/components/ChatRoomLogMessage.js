import { connect } from 'react-redux';
import React from 'react';
import firebase from 'controllers/FirebaseInitialize'; 
import 'firebase/auth';
import firebaseMessageUploader from 'controllers/FirebaseMessageUploader';
 
import { DateNumber } from 'helpers/helpers';
import Spinner from 'components/Spinner';

import eventDispatcher from 'controllers/EventDispatcher';

import { IoIosFlash,
		 IoIosCheckmark,
		 IoIosDoneAll,
		 IoIosSettings } from 'react-icons/io';

class ChatRoomLogMessage extends React.Component {

	componentDidUpdate() {
		this.updateMessageIsRead(this.props.message);
	}

	componentWillMount() {
		this.updateMessageIsRead(this.props.message);
	}

	updateMessageIsRead(message) {
		if ( message.messageStatus === 3 ||
			 message.fromId === firebase.auth().currentUser.uid ) return;
		const messageRef = firebaseMessageUploader.getMessageRefFor(message);
		firebaseMessageUploader.addUpdateTask(messageRef, { messageStatus : 3 });
	}

	getClassesForMessageBallon = (message) => {

		let classes = "";

		if ( message.fromId === firebase.auth().currentUser.uid ) {
			classes = "offset-5 chat-message-outgoing";
		} else {
			classes = "col-7 chat-message-incoming";
		}

		if ( this.isImage() )
			classes += " line-height-1";

		return classes;
	}

	openOriginalUrl = () => {
		if ( !this.props.imageUrl ) return;
		window.open(this.props.imageUrl, '_blank');
	}

	clickImgHandler = () => {
		this.props.onClick(this);
	}

	retnderMessageGlyph = () => {
		if ( this.props.message.fromId !== "greetings_message" ) return;

		return <div className = "messages-status-glyph">
					<IoIosSettings />
				</div>
	}

	renderContent = () => {
		let message = this.props.message;
		if ( message.pathToImage === undefined ) {
			return message.text;
		}

		if ( this.props.imageUrl === undefined ) {
			return <Spinner />;
		}

		const imageDiv = <div>
							 <div className = "message-image-filter rounded-lg"></div>
							 <div className = "message-image rounded-lg"
								  style 	= { { backgroundImage : `url("${this.props.imageUrl}")` } }
								  onClick   = { this.clickImgHandler }></div>
						 </div>;

		return imageDiv;

	}

	isImage = () => {
		return this.props.message.pathToImage !== undefined;
	}

	copyToClipboard = (text) => {
		const systemMessage = {
			title    : "Системное сообщение",
			message  : <div><IoIosFlash size="1.5em" style = { {color : '#007bff'} }/> Текст скопирован в буфер обмена</div>,
			cls 	 : "toast-dark",
			lifetime : 3000
 		}

 		if ( !navigator.clipboard ) return;

		navigator.clipboard
			.writeText(text)
			.then(function() {
				eventDispatcher.dispatch("hasMessage", systemMessage);
			});
	}

	openUrl = (url) => {
		const systemMessage = {
			title    : "Ссылка",
			message  : <div>{url}<br/><a href={ url } target="_blank" rel="noopener noreferrer">Открыть ссылку в новом окне</a></div>,
			cls 	 : "bg-white-no-opacity"
 		}
 		eventDispatcher.dispatch("hasMessage", systemMessage);
	}

	clickHandler = () => {
		const message = this.props.message;
		if ( message.pathToImage ) return;

		const url = this.getUrl(message.text);

		if ( url ) return this.openUrl(url);

		this.copyToClipboard(message.text)
	}

	getIconForMessageStatus = () => {
		if ( this.props.message.messageStatus === 3 ) 
			return <IoIosDoneAll size="1.5em"/>
		else 
			return <IoIosCheckmark size="1.5em"/>
	}

	renderMessageStatus = () => {
		if ( this.props.message.fromId !== firebase.auth().currentUser.uid )
			return;

		return <div className="message-status-icon">
					{ this.getIconForMessageStatus() }
				</div>
	}

	resolveDate = (date) => {

		const options = {
			hour: 'numeric',
			minute: 'numeric'
		};
		const formattedTimestamp = date.toLocaleString('ru', options);

		return formattedTimestamp;
	}

	renderTimestamp = () => {
		const message = this.props.message;
		const timestamp = this.resolveDate(DateNumber.since1970(message.timestamp));
		return <div className="message-status-timestamp">
					{ timestamp }
				</div>
	}

	getUrl = (text) => {
		const urlRegExp = /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[/?#]\S*)?$/i;
    	const url = text.match(urlRegExp);
    	if ( url === null ) return;
    	return url[0];
	}

	render() {
		return (
			<div 
				className	= { this.getClassesForMessageBallon(this.props.message) }
				>
				<div className = { "chat-room-log-message p-2 " + this.props.marginClass }
					 onClick   = { this.clickHandler }>
					{ this.retnderMessageGlyph() }
					{ this.renderContent() }
					<div className = "message-status-container">
						{ this.renderMessageStatus() }
						{ this.renderTimestamp() }
					</div>
				</div>
			</div>
		)
	}

}

ChatRoomLogMessage.defaultProps = {
	marginClass: "mt-2"
};

const mapStateToProps = (state, ownProps) => ({
  imageUrl : state.imagesUrlState[ownProps.message.pathToImage]
})

export default connect(
	mapStateToProps
)(ChatRoomLogMessage);