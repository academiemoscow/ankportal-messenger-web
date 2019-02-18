import React from 'react';

import firebaseMessagesObserver from 'controllers/FirebaseMessagesObserver';

class ChatRoomLog extends React.Component {

	state = {
		lastMessageTimeStamp: null
	}

	constructor(props) {
		super(props);
		this.firebaseDidRecieveNewMessage = this.firebaseDidRecieveNewMessage.bind(this);
		firebaseMessagesObserver.addObserver(this);
	}

	firebaseDidRecieveNewMessage(message) {
		if ( message.chatRoomId !== this.state.roomId ) return;
		this.setState({ 
			lastMessageTimeStamp: message.timestamp 
		});
	}

	createRoomLog = () => {
		let divList = [];
		let messages = firebaseMessagesObserver.messages[this.props.roomId];

		if (typeof messages !== "undefined") {
			for(let i = 0; i < messages.length; i++) {
				divList.push(
						<div 
							className 	= "chat-room-log-message"
							key 		= {i}
							>
							{ messages[i].text }
						</div>
					)
			}	
		}
		return divList;
	}

	render() {
		return(
			<div className="chat-room-log">
				{ this.createRoomLog() }
			</div>
		);
	}
}

export default ChatRoomLog;