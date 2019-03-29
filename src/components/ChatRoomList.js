import { connect } from 'react-redux';
import { changeRoom } from 'redux/actions';

import React from 'react';
import ChatRoomListElement from 'components/ChatRoomListElement';
import ChatRoomLog from 'components/ChatRoomLog';

import firebaseMessagesObserver from 'controllers/FirebaseMessagesObserver';

import Baron from 'react-baron/dist/es5';
import 'react-baron/src/styles.css';

import soundNewMessage from 'sounds/new_message.mp3';
import { DateNumber } from 'helpers/helpers';

import Spinner from 'components/Spinner';

class ChatRoomList extends React.Component {

	state = {
		roomLastMessages: {},
		isLoading : true,
		listIsEmpty : false
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

	firebaseDatabaseIsEmpty() {
		this.setState({ 
			isLoading : false,
			listIsEmpty : true
		});
	}

	firebaseDidUpdateMessage(message) {
		this.forceUpdate();
	}

	firebaseDidRecieveNewMessage(message) {
		if ( message.timestamp >= this.didMountTimestamp && 
			 ( this.props.selectedRoomId !== message.chatRoomId || document.hidden ) ) {

			this.newMessageSound.load();
			this.newMessageSound.play();
		}
		let chatRoomLastMessage = {};
		chatRoomLastMessage[message.chatRoomId] = message;
		this.setState({ 
			roomLastMessages: Object.assign(this.state.roomLastMessages, chatRoomLastMessage),
			isLoading : false,
			listIsEmpty : false
		});
	}

	returnHandlerSelectRoom(elem) {
		let context = this;
		let state = { 
			expanded: false 
		}
		return function() {
			context.setState(state);
			if ( elem !== undefined ) {
				context.props.changeRoom(elem.props.message.chatRoomId)
			}
		}
	}

	getPlaceHolder = () => {
		return (
				<div className = "chat-room-list-placeholder-container shadow-sm">
					<div className="card" style={ { width: '18rem' } }>
					  <div className="card-body">
					    <p className="card-text">Сообщений нет</p>
					  </div>
					</div>
				</div>
				)
	}

	createRoomList = () => {
		if ( this.state.listIsEmpty ) return this.getPlaceHolder(); 
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
					selectedRoomId  =   { this.props.selectedRoomId }
					onClick			=	{ this.returnHandlerSelectRoom }
				/>
			)
		}

		return divList;
	}

	renderRoomLog = () => {
		return <ChatRoomLog roomId={ this.props.selectedRoomId } />
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
							{ !this.state.isLoading ? this.createRoomList() : <div className="spinner"><Spinner /></div> }
						</div>
					</Baron>
				</div>
				{ this.renderRoomLog() }
			</div>
		);
	}
}

const mapDispatchToProps = (dispatch, ownProps) => ({
  changeRoom: (roomId) => dispatch(changeRoom(roomId))
})

const mapStateToProps = (state, ownProps) => ({
  selectedRoomId  	 : state.chatState.currentRoomId ? state.chatState.currentRoomId : null
})

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(ChatRoomList);