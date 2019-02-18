import firebase from 'controllers/FirebaseInitialize';
import 'firebase/database';

class FirebaseMessagesObserver {

	observers = [];

	messages = {};

	addObserver(observer) {
		this.observers.push(observer);
	}

	constructor() {
		this.messageRef = firebase.database().ref("messages");
		this.observeForNewMessages();
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