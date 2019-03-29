import firebase from 'controllers/FirebaseInitialize';
import firebaseStorage from 'controllers/FirebaseStorage';
import 'firebase/database';
import 'firebase/auth';

import { imageUrlDidLoaded } from 'redux/actions';
import firebaseMessageUploader from 'controllers/FirebaseMessageUploader';

class FirebaseMessagesObserver {

	store = {};
	observers = [];
	messages = {};
	roomLoadedComplete = {};

	loadingPortion = 10;

	unreadCountFor = (roomId) => {
		if ( this.messages[roomId] === undefined ) return 0;
		const currentUserId = firebase.auth().currentUser.uid;
		return this.messages[roomId]
				.filter( message => message.fromId !== currentUserId && 
						 			message.messageStatus !== 3 &&
						 			message.fromId !== "greetings_message" &&
						 			message.fromId !== message.text
				).length;
	}

	addObserver(observer) {
		if ( this.observers.indexOf(observer) === -1 ) {
			this.observers.push(observer);
			this.sendAllMessagesToObserver(observer);
			if ( this.observers.length === 1 ) {
				this.observeForNewMessages();
			}
		}
	}

	addCurrentUserToRoom(roomId) {
		let ref = firebase.database().ref(`room-user/${roomId}/${firebase.auth().currentUser.uid}`);
		firebaseMessageUploader.addUpdateTask(ref, {userId: firebase.auth().currentUser.uid});	
	}

	constructor() {
		this.messageRef = firebase.database().ref("messages");
	}

	sendAllMessagesToObserver(observer) {
		if (typeof observer["firebaseDidRecieveNewMessage"] !== "function") return;
		let roomIdArray = Object.keys(this.messages);
		for(let i = 0; i < roomIdArray.length; i++) {
			this.messages[roomIdArray[i]].forEach(function(message) {
				observer.firebaseDidRecieveNewMessage(message);	
			})
		}
	}

	tellObservers(messageToObservers) {
		const args = Object.values(arguments).slice(1);
		this.observers.forEach(function(element) {
			if (typeof element[messageToObservers] === "function") {
				element[messageToObservers](...args);
			}
		})
	}

	updateMessageHandler(roomMessagesSnapshot) {
		const roomMessage = roomMessagesSnapshot.toJSON();
		if ( roomMessage.text === roomMessage.fromId ) return;

		this.messages[roomMessage.chatRoomId] = 
			this.messages[roomMessage.chatRoomId]
			.map( message => message.messageId === roomMessage.messageId ? roomMessage : message );
			
		this.tellObservers("firebaseDidUpdateMessage", roomMessage);
	}

	newMessageHandler(roomMessagesSnapshot) {
		const roomMessage = roomMessagesSnapshot.toJSON();
		if ( roomMessage.text === roomMessage.fromId ) return;

		this.messages[roomMessage.chatRoomId].push(roomMessage);
		this.tellObservers("firebaseDidRecieveNewMessage", roomMessage);

		if ( roomMessage.pathToImage === undefined ) return;
		const downloadTask = {
			url 		: roomMessage.pathToImage,
			onComplete  : (url) => {
				this.store.dispatch(imageUrlDidLoaded(roomMessage.pathToImage, url))
			}
		} 
		firebaseStorage.addReference(downloadTask);
	}

	loadPreviousFor(roomId, callback = () => {}) {
		const roomRef = firebase.database().ref(`messages/${roomId}`);
		roomRef.orderByChild('timestamp')
			   .endAt(this.messages[roomId][0].timestamp)
			   .limitToLast(this.loadingPortion)
			   .once('value', function(messagesSnapshot) {

			   		const messages = Object.values(messagesSnapshot.toJSON());
			   		const filtered = messages.slice(0, messages.length - 1)
			   								 .filter(m => m.text !== m.fromId);

			   		this.messages[roomId] = filtered.concat(this.messages[roomId]);
			   		if ( messages.length < this.loadingPortion )
			   			this.roomLoadedComplete[roomId] = true;

			   		callback(filtered.length);

			   }.bind(this))
	}

	observeForNewMessages() {
		this.messageRef.once('value', function(roomSnapshotValue) {
			if (roomSnapshotValue.toJSON() === null)
				this.tellObservers("firebaseDatabaseIsEmpty");
		}, this);

		this.messageRef.on('child_added', function(roomSnapshot) {
			if (typeof this.messages[roomSnapshot.key] === "undefined") {
				this.messages[roomSnapshot.key] = [];
				this.roomLoadedComplete[roomSnapshot.key] = false;
				this.addCurrentUserToRoom(roomSnapshot.key);
			}
			const roomRef = firebase.database().ref(`messages/${roomSnapshot.key}`);
			roomRef.limitToLast(this.loadingPortion).on('child_added', function(roomMessagesSnapshot) {
				this.newMessageHandler(roomMessagesSnapshot)	
			}, this);

			roomRef.on('child_changed', function(roomMessagesSnapshot) {
				this.updateMessageHandler(roomMessagesSnapshot)	
			}, this);
		}, this);
	}

}

export default new FirebaseMessagesObserver()