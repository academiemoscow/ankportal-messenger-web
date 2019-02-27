import React from 'react';
import Baron from 'react-baron/dist/es5';
import 'react-baron/src/styles.css';
import { DateNumber } from 'helpers/helpers';
import firebaseMessagesObserver from 'controllers/FirebaseMessagesObserver';
import firebase from 'controllers/FirebaseInitialize'; 
import 'firebase/auth';
import ChatRoomInput from 'components/ChatRoomInput';

class ChatRoomLog extends React.Component {

	state = {
		lastMessageTimeStamp: null
	}

	constructor(props) {
		super(props);
		this.firebaseDidRecieveNewMessage = this.firebaseDidRecieveNewMessage.bind(this);
	}

	componentDidMount() {
		firebaseMessagesObserver.addObserver(this);
	}

	componentDidUpdate() {
		this.baronRef.scrollToLast();	
	}

	firebaseDidRecieveNewMessage(message) {
		if ( message.chatRoomId !== this.state.roomId ) return;
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
				divList.push(
						<div 
							className	= { this.getClassesForMessageBallon(messages[i]) }
							key 		= {i}
							>
							<div className = "chat-room-log-message p-2 mt-2 mb-2">
								{ messages[i].text }
							</div>
						</div>
					)
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

	render() {
		return(
			<div className   = "col-sm-8 p-0 chat-room-log-container">
				<div className = "chat-room-messages">
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

export default ChatRoomLog;