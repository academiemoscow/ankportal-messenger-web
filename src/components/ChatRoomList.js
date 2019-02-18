import React from 'react';
import ChatRoomListElement from 'components/ChatRoomListElement';
import ChatRoomLog from 'components/ChatRoomLog';

import firebaseMessagesObserver from 'controllers/FirebaseMessagesObserver';

export default class ChatRoomList extends React.Component {

	state = {
		roomLastMessages: {},
		selectedRoomId: null
	}

	constructor(props) {
		super(props);
		this.firebaseDidRecieveNewMessage = this.firebaseDidRecieveNewMessage.bind(this);
		this.returnHandlerSelectRoom = this.returnHandlerSelectRoom.bind(this);
		firebaseMessagesObserver.addObserver(this);
	}

	firebaseDidRecieveNewMessage(message) {
		let chatRoomLastMessage = {};
		chatRoomLastMessage[message.chatRoomId] = message;
		this.setState({ 
			roomLastMessages: Object.assign(this.state.roomLastMessages, chatRoomLastMessage) 
		});
	}

	returnHandlerSelectRoom(elem) {
		let context = this;
		return function() {
			context.setState({ selectedRoomId: elem.props.chatRoomId });
		}
	}

	createRoomList = () => {
		let divList = [];
		let roomIdArray = Object.keys(this.state.roomLastMessages);

		for (let i = 0; i < roomIdArray.length; i++) {
			let message = this.state.roomLastMessages[roomIdArray[i]];
			divList.push(
				<ChatRoomListElement
					key				=	{ message.chatRoomId } 
					messageText		=	{ message.text } 
					timestamp		=	{ message.timestamp }
					chatRoomId 		=	{ message.chatRoomId }
					selectedRoomId 	=	{ this.state.selectedRoomId }
					onClick			=	{ this.returnHandlerSelectRoom }
				/>
			)
		}

		return divList;
	}

	renderRoomLog = () => {
		if ( this.state.selectedRoomId !== null ) {
			return <ChatRoomLog roomId={ this.state.selectedRoomId } />
		} 
		return
	}

	render() {
		return (
			<div>
				<div 
					className="chat-room-list"
					>
					{ this.createRoomList() }
				</div>
				{ this.renderRoomLog() }
			</div>
		);
	}
}
