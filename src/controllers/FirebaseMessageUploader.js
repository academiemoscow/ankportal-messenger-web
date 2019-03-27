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

	static UploadTaskStatus = {
		COMPLETE 	: 3,
		ERROR   	: 1,
		PROCESSING 	: 2,
		NEW 		: 0
	}

	tasks = [];
	isBusy = false;

	constructor() {
		this.processingIntervalId = setInterval(this.processing.bind(this), 100);
	}

	addUpdateTask(ref, values) {
		let task = {
			status  : FirebaseMessageUploader.UploadTaskStatus.NEW,
			ref 	: ref, 
			values 	: values, 
			attempt : 0
		};
		this.tasks.push(task);
	}

	filterTask() {
		this.tasks = this.tasks.filter(task => 
			task.status !== FirebaseMessageUploader.UploadTaskStatus.COMPLETE &&
			task.attempt < 50
		)
	}

	processing() {
		if ( this.isBusy ) return;
		this.isBusy = true;

		this.filterTask();

		const tasks = this.tasks.filter(task => 
			task.status !== FirebaseMessageUploader.UploadTaskStatus.PROCESSING
		)

		tasks.forEach(task => {
			this.updateTask(task)
		})

		this.isBusy = false;
	}

	removeTask(task) {
		this.tasks = this.tasks.filter(t => t !== task);
	}

	updateTask(task) {
		const ref 	 = task.ref,
			  values = task.values;
		task.status = FirebaseMessageUploader.UploadTaskStatus.PROCESSING;
		task.attempt++;
		const updateTask = ref.update(values, function(error) {
			
			if ( error !== null ) {
				task.status = FirebaseMessageUploader.UploadTaskStatus.ERROR;
				this.updateTask(task);
				return
			}

			task.status = FirebaseMessageUploader.UploadTaskStatus.COMPLETE;

		}.bind(this));
		updateTask.catch(function() {
			task.status = FirebaseMessageUploader.UploadTaskStatus.ERROR;
			this.updateTask(task);
		}.bind(this))
	}

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