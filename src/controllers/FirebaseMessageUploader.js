import firebase from 'controllers/FirebaseInitialize';
import 'firebase/database';
import 'firebase/auth';
import { DateNumber } from 'helpers/helpers';

export class FirebaseMessage {

	static getMessageFor(roomId) {
		return {
			fromId			: firebase.auth().currentUser.uid,
			timestamp		: DateNumber.secondsSince1970(),
			messageStatus 	: 1,
			chatRoomId 		: roomId
		}
	}

	static textMessage(text, roomId) {
		let message = FirebaseMessage.getMessageFor(roomId);
		message.text = text;
		return message;
	}
}

class FirebaseMessageUploader {

	getNewMessageRef(roomId) {
		let ref = firebase.database().ref(`messages/${roomId}`);
		return ref.push();
	}

	getMessageRefFor(message) {
		let ref = firebase.database().ref(`messages/${message.chatRoomId}/${message.messageId}`);
		return ref;
	}

}

export default new FirebaseMessageUploader();