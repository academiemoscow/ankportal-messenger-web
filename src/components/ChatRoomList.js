import React from 'react';
import ChatRoomListElement from 'components/ChatRoomListElement';
import ChatRoomLog from 'components/ChatRoomLog';

import firebaseMessagesObserver from 'controllers/FirebaseMessagesObserver';

import Baron from 'react-baron/dist/es5';
import 'react-baron/src/styles.css';

import soundNewMessage from 'sounds/new_message.mp3';
import { DateNumber } from 'helpers/helpers';

export default class ChatRoomList extends React.Component {

	state = {
		roomLastMessages: {},
		selectedRoomId: null
	}

	newMessageSound = (() => {
		let audio = new Audio();
		audio.preload = 'auto';
		audio.src = soundNewMessage;
		return audio
	})()

	constructor(props) {
		super(props);
		this.firebaseDidRecieveNewMessage = this.firebaseDidRecieveNewMessage.bind(this);
		this.firebaseDidUpdateMessage = this.firebaseDidUpdateMessage.bind(this);
		this.returnHandlerSelectRoom = this.returnHandlerSelectRoom.bind(this);
	}

	componentDidMount() {
		this.didMountTimestamp = DateNumber.secondsSince1970();
		firebaseMessagesObserver.addObserver(this);
	}

	firebaseDidUpdateMessage(message) {
		this.forceUpdate();
	}

	firebaseDidRecieveNewMessage(message) {
		if ( message.timestamp >= this.didMountTimestamp ) {
			this.newMessageSound.play();
		}
		let chatRoomLastMessage = {};
		chatRoomLastMessage[message.chatRoomId] = message;
		this.setState({ 
			roomLastMessages: Object.assign(this.state.roomLastMessages, chatRoomLastMessage) 
		});
	}

	returnHandlerSelectRoom(elem) {
		let context = this;
		let state = { 
			selectedRoomId: null,
			expanded: false 
		}
		if ( elem !== undefined ) {
			state.selectedRoomId = elem.props.message.chatRoomId;	
		}
		return function() {
			context.setState(state);
		}
	}

	createRoomList = () => {
		let divList = [];
		let roomIdArray = Object.keys(this.state.roomLastMessages)
							.sort((roomId1, roomId2) => {
								const message1 = this.state.roomLastMessages[roomId1],
									  message2 = this.state.roomLastMessages[roomId2];
								return message2.timestamp - message1.timestamp;
							});

		for (let i = 0; i < roomIdArray.length; i++) {
			let message = this.state.roomLastMessages[roomIdArray[i]];
			divList.push(
				<ChatRoomListElement
					key				=	{ message.chatRoomId } 
					message			=	{ message } 
					unreadCount 	=   { firebaseMessagesObserver.unreadCountFor(message.chatRoomId) }
					selectedRoomId  =   { this.state.selectedRoomId }
					onClick			=	{ this.returnHandlerSelectRoom }
				/>
			)
		}

		return divList;
	}

	renderRoomLog = () => {
		return <ChatRoomLog roomId={ this.state.selectedRoomId } />
	}

	toggleRoomList = () => {
		this.setState({ expanded: !this.state.expanded });
	}

	getClassForRoomList = () => {
		if ( this.state.expanded ) {
			return "chat-room-list expanded col-sm-4 p-0"
		}
		return "chat-room-list col-sm-4 p-0"
	}

	render() {
		return (
			<div className = "row m-0 chat-room-list-container">
				<div 
					className={ this.getClassForRoomList() }
				>
					<div className="chat-room-list-expand">
						<button onClick={ this.toggleRoomList } className="cmn-toggle-switch cmn-toggle-switch__htx">
							<span>toggle menu</span>
						</button>
					</div>
					<Baron>
						<div>
							{ this.createRoomList() }
						</div>
					</Baron>
				</div>
				{ this.renderRoomLog() }
			</div>
		);
	}
}
