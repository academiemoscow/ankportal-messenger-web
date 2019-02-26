import firebase from 'controllers/FirebaseInitialize';
import 'firebase/storage';

import firebaseUserProvider from 'controllers/FirebaseUserProvider';

class FirebaseStorage {

	constructor() {
		this.storageRef = firebase.storage().ref();
	}

	getDownloadURL(childRef, callback = (url) => {}) {
		this.storageRef
			.child(childRef)
			.getDownloadURL()
			.then(function(url) {
				callback(url);
			})
	}
}

export default new FirebaseStorage();