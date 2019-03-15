import React from 'react';
import { connect } from 'react-redux';
import Baron from 'react-baron/dist/es5';
import 'react-baron/src/styles.css';
import { DateNumber } from 'helpers/helpers';
import firebaseMessagesObserver from 'controllers/FirebaseMessagesObserver';
import firebase from 'controllers/FirebaseInitialize'; 
import 'firebase/auth';
import ChatRoomInput from 'components/ChatRoomInput';
import ChatRoomLogMessage from 'components/ChatRoomLogMessage';

import eventDispatcher from 'controllers/EventDispatcher';

class ChatRoomLog extends React.Component {

	state = {
		lastMessageTimeStamp: null,
		headerMessage 		: null,
		headerMessageCls 	: ""
	}

	constructor(props) {
		super(props);
		eventDispatcher.subscribe(this);
		this.hasError = this.hasError.bind(this);
		this.firebaseDidRecieveNewMessage = this.firebaseDidRecieveNewMessage.bind(this);
	}

	hasError(error) {
		let headerMessage = {
			type	: "ERROR",
			cls   	: "error",
			h 		: "Ошибка #" + error.code,
			message : error.message
		}
		this.setState({ 
			headerMessage 	: headerMessage,
			headerMessageCls: "active"
		});
	}

	componentDidMount() {
		firebaseMessagesObserver.addObserver(this);
	}

	componentDidUpdate(prevProps) {
		this.baronRef.scrollToLast();	
	}

	firebaseDidRecieveNewMessage(message) {
		if ( message.chatRoomId !== this.props.roomId ) return;
		this.setState({ 
			lastMessageTimeStamp: message.timestamp 
		});
	}

	getClassesForMessageBallon = (message) => {
		if ( message.fromId === firebase.auth().currentUser.uid ) {
			return "offset-5 chat-message-outgoing";
		}
		return "col-7 chat-message-incoming";
	}

	createRoomLog = () => {
		let divList = [];
		let messages = firebaseMessagesObserver.messages[this.props.roomId];
		if (typeof messages !== "undefined") {
			for(let i = 0; i < messages.length; i++) {
				let dateLabel = (() => {
					if ( i === 0 ) return;
					let dateCurrentMessage 	= DateNumber.since1970(messages[i].timestamp),
						dateNextMessage 	= DateNumber.since1970(messages[i-1].timestamp);
					if ( dateCurrentMessage.toDateString() === dateNextMessage.toDateString() ) return;
					return (<div key={`date-label-for-${i}`} className="chat-room-log-d-label">{ dateCurrentMessage.toLocaleString() }</div>);
				})();
				if ( dateLabel !== undefined ) divList.push(dateLabel);
				divList.push(<ChatRoomLogMessage key={ i } message={ messages[i] } />)
			}	
		}
		return divList;
	}

	renderPlaceholder = () => {
		return <div className="placeholder">&nbsp;</div>;
	}

	renderRoomInput = () => {
		if ( this.props.roomId === null ) return;
		return <ChatRoomInput roomId={ this.props.roomId }/>
	}

	eraseHeaderMessage = () => {
		this.setState({ headerMessageCls: "" });
	}

	renderHeaderMessage = () => {
		if ( this.state.headerMessage !== null ) {
			return (
				<div className={ "header-message " + this.state.headerMessageCls + " " + this.state.headerMessage.cls }>
					<div 	className 	= "toast" 
							role 		= "alert" 
							aria-live 	= "assertive" 
							aria-atomic = "true">

						<div className="toast-header">
							<strong className="mr-auto">{ this.state.headerMessage.h }</strong>
							<button type 	     = "button" 
									onClick      = { this.eraseHeaderMessage } 
									className    = "ml-2 mb-1 close" 
									data-dismiss = "toast" 
									aria-label 	 = "Close">
								<span aria-hidden="true">&times;</span>
							</button>
						</div>
						<div className="toast-body">
							{ this.state.headerMessage.message }
						</div>
					</div>
				</div>
			)
		}
		return (
			<div className="header-message">
			</div>
		)
	}

	render() {
		return(
			<div className   = "col-sm-8 p-0 chat-room-log-container">
				{ this.renderHeaderMessage() }
				<div className = "chat-room-messages" style={ { marginBottom: -this.props.roomInputHeight } }>
					<Baron ref={(r) => this.baronRef = r}>
						<div className="chat-room-log p-2">
							{ this.props.roomId === null ? this.renderPlaceholder() : this.createRoomLog() }
						</div>
					</Baron>
				</div>
				{ this.renderRoomInput() }
			</div>
		);
	}
}

const mapStateToProps = (state, ownProps) => ({
  roomInputHeight: !state.roomInputState[ownProps.roomId] || !state.roomInputState[ownProps.roomId].roomInputHeight ? 61 : state.roomInputState[ownProps.roomId].roomInputHeight
})

export default connect(
	mapStateToProps
)(ChatRoomLog);