import firebase from 'controllers/FirebaseInitialize';
import 'firebase/messaging';

import firebaseUserProvider from 'controllers/FirebaseUserProvider';
import firebaseMessageUploader from 'controllers/FirebaseMessageUploader';
import { changeRoom } from 'redux/actions';

class FirebasePushMessaging {

	store = {};

	constructor() {
		this.isSupported = firebase.messaging.isSupported();
		if ( !this.isSupported ) return;
		this.messaging = firebase.messaging();
		this.messaging.usePublicVapidKey("BOMiYGpVr9TcZcFgutpsFqrFeOxT0fwjjA8RP8SAT-64xlDnvEjjcxUQopRbfqiw8GA3EkJYjGXV2oTp2l2XYCs");
		this.permissionGranted = this.permissionGranted.bind(this);
		this.onTokenRefresh = this.onTokenRefresh.bind(this);
		this.onMessage = this.onMessage.bind(this);
		this.messaging.onTokenRefresh(this.onTokenRefresh);
		this.messaging.onMessage(this.onMessage);
	}

	onTokenRefresh() {
		this.getToken();
	}

	requestPermission() {
		if ( !this.isSupported ) return;
		this.messaging.requestPermission().then(
			this.permissionGranted
		).catch(function(err) {
		  console.log('Unable to get permission to notify.', err, this);
		});
	}

	onMessage(payload) {
		//Если есть свойство notification, значит чат был на экране, когда пришел push
		if (payload.data && 
			payload.data.eventType === 'new_message' &&
			!payload.notification ) {
			this.store.dispatch(changeRoom(payload.data.chatRoomId));
		}
	}

	updateUserToken(token) {
		const currentUserRef = firebaseUserProvider.getReferenceForCurrentUid();
		firebaseMessageUploader.addUpdateTask(
			currentUserRef, 
			{ 
				fcmTokenWeb : token,
				clickAction : document.location.href 
			});
	}

	getToken() {
		this.messaging.getToken().then(function(currentToken) {
		  if (currentToken) {
		    this.updateUserToken(currentToken);
		  } else {
		    this.updateUIForPushPermissionRequired();
		  }
		}.bind(this)).catch(function(err) {
		  console.log('An error occurred while retrieving token. ', err);
		});
	}

	permissionGranted() {
		this.getToken();
	}
}

export default new FirebasePushMessaging();