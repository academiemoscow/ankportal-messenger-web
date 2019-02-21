import firebase from 'controllers/FirebaseInitialize';
import 'firebase/database';


class FirebaseMessagesObserver {

	observers = [];

	messages = {};

	addObserver(observer) {
		this.observers.push(observer);
		this.sendAllMessagesToObserver(observer);
	}

	constructor() {
		this.messageRef = firebase.database().ref("messages");
		this.observeForNewMessages();
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
		let args = [];
		for(let i = 1; i < arguments.length; i++) {
			args.push(arguments[i]);
		}
		this.observers.forEach(function(element) {
			if (typeof element[messageToObservers] === "function") {
				element[messageToObservers](...args);
			}
		})
	}

	observeForNewMessages() {
		this.messageRef.on('child_added', function(roomSnapshot) {
			if (typeof this.messages[roomSnapshot.key] === "undefined") {
				this.messages[roomSnapshot.key] = [];
			}

			firebase.database().ref(`messages/${roomSnapshot.key}`)
				.on('child_added', function(roomMessagesSnapshot) {

					let roomMessage = roomMessagesSnapshot.toJSON();
					this.messages[roomMessage.chatRoomId].push(roomMessage);
					this.tellObservers("firebaseDidRecieveNewMessage", roomMessage);

				}, this);
		}, this);
	}

}

export default new FirebaseMessagesObserver()