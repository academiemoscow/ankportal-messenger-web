import firebase from 'controllers/FirebaseInitialize';
import 'firebase/database';
import 'firebase/auth';

import firebaseStorage from 'controllers/FirebaseStorage';

class FirebaseUserProvider {

	chatUsers = {};
	usersProfileImagesURL = {};

	constructor() {
		this.usersDatabaseRef = firebase.database().ref("users");
		this.observerUsersProfiles();
	}

	onUserChange(userObject, uid) {
	}

	getReferenceForUid(uid) {
		let ref = firebase.database().ref(`users/${uid}`);
		return ref;
	}

	getReferenceForCurrentUid() {
		return this.getReferenceForUid(firebase.auth().currentUser.uid);
	}

	updateChatUsers(chatUser, uid) {
		this.chatUsers = Object.assign({}, this.chatUsers, chatUser);
		let profileImagePath = chatUser[uid].profileImagePath;
		if ( profileImagePath === undefined ) return;
		if ( this.usersProfileImagesURL[profileImagePath] !== undefined ) return;

		firebaseStorage.getDownloadURL(profileImagePath, function(url) {
			this.usersProfileImagesURL[profileImagePath] = url;
		}.bind(this))
	}

	observerUsersProfiles() {
		this.usersDatabaseRef.on('child_added', function(usersSnapshot) {
			let usersObject = usersSnapshot.val();
			this.updateChatUsers({
				[usersSnapshot.key] : usersObject
			}, usersSnapshot.key)
		}.bind(this));

		this.usersDatabaseRef.on('child_changed', function(usersSnapshot) {
			let usersObject = usersSnapshot.val();
			this.updateChatUsers({
				[usersSnapshot.key] : usersObject
			}, usersSnapshot.key)
			this.onUserChange(usersObject, usersSnapshot.key);
		}.bind(this));
	}
	
	getUserById(userid, callback = (user) => {}) {
		if ( userid === undefined ) return;
		if ( this.chatUsers[userid] !== undefined ) {
			return callback(this.chatUsers[userid]);
		}
		let userRef = this.usersDatabaseRef.child(userid);
		userRef.once('value', function(userSnapshot) {
			callback(userSnapshot.val());
		});
	}
}

export default new FirebaseUserProvider();