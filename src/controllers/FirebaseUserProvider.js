import firebase from 'controllers/FirebaseInitialize';
import 'firebase/database';

import firebaseStorage from 'controllers/FirebaseStorage';

class FirebaseUserProvider {

	chatUsers = {};
	usersProfileImagesURL = {};

	constructor() {
		this.usersDatabaseRef = firebase.database().ref("users");
		this.fillUsersAndImages();
	}

	fillUsersAndImages() {
		this.usersDatabaseRef.once('value', function(usersSnapshot) {
			this.chatUsers = usersSnapshot.val();
			Object.keys(this.chatUsers).forEach(function(userKey) {
				let profileImagePath = this.chatUsers[userKey].profileImagePath;
				if ( profileImagePath !== undefined ) {
					firebaseStorage.getDownloadURL(profileImagePath, function(url) {
						this.usersProfileImagesURL[profileImagePath] = url;
					}.bind(this))
				}
			}.bind(this))
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