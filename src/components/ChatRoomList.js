import React from 'react';
import ChatRoomListElement from 'components/ChatRoomListElement';

import firebaseMessagesObserver from 'controllers/FirebaseMessagesObserver';

export default class ChatRoomList extends React.Component {

	state = {
		roomLastMessages: {}
	}

	constructor(props) {
		super(props);
		this.firebaseDidRecieveNewMessage = this.firebaseDidRecieveNewMessage.bind(this);
		firebaseMessagesObserver.addObserver(this);
	}

	firebaseDidRecieveNewMessage(message) {
		let chatRoomLastMessage = {};
		chatRoomLastMessage[message.chatRoomId] = message;
		this.setState({ 
			roomLastMessages: Object.assign(this.state.roomLastMessages, chatRoomLastMessage) 
		});
	}

	createRoomList = () => {
		let divList = [];
		let roomIdArray = Object.keys(this.state.roomLastMessages);

		for (let i = 0; i < roomIdArray.length; i++) {
			let message = this.state.roomLastMessages[roomIdArray[i]]
			divList.push(
				<ChatRoomListElement
					key			=	{ message.chatRoomId } 
					messageText	=	{ message.text } 
					timestamp	=	{ message.timestamp }
				/>
			)
		}

		return divList;
	}

	render() {
		return (
			<div className="chat-room-list">
				{ this.createRoomList() }
			</div>
		);
	}
}
