import firebase from 'controllers/FirebaseInitialize';
import 'firebase/database';
import 'firebase/auth';

import placeholder from 'images/avatar-placeholder.png';

import firebaseStorage from 'controllers/FirebaseStorage';

class FirebaseUserProvider {

	usersInRoom = {};
	chatUsers = {};
	usersProfileImagesURL = {};
	observers = {};

	constructor() {
		this.usersDatabaseRef = firebase.database().ref("users");
		this.roomUsersDatabaseRef = firebase.database().ref("room-user");
		this.observerUsersProfiles();
	}

	onUserChange(userObject, uid) {
		const observers = this.observers[uid];
		if ( observers )
			observers.forEach(observer => {
				observer.onUserChange(userObject, uid);
			})
	}

	addObserverFor(uid, observer) {
		if ( !uid ) return;
		const observers = this.observers[uid];
		if ( !observers ) 
			this.observers[uid] = [observer]
		else {
			if ( observers.indexOf(observer) === -1 )
				this.observers[uid] = this.observers[uid].concat(observer);
		}
	}

	getReferenceForUid(uid) {
		let ref = firebase.database().ref(`users/${uid}`);
		return ref;
	}

	getReferenceForCurrentUid() {
		return this.getReferenceForUid(firebase.auth().currentUser.uid);
	}

	updateUsersInRoom(uid, roomId) {
		let roomUsers = this.usersInRoom[roomId];
		if ( roomUsers ) {
			if ( roomUsers.indexOf(uid) !== -1 ) return;
			this.usersInRoom[roomId] = this.usersInRoom[roomId].concat(uid);
		} else {
			this.usersInRoom[roomId] = [uid];
		}
	}

	getProfileImageFor(uid) {
		const user = this.chatUsers[uid];
		if ( user ) {
			const url = this.usersProfileImagesURL[user.profileImagePath];
			if ( url )
				return url;
		}
		return placeholder;
	}

	getCompanionsInRoom(roomId) {
		let companions = [];
		let roomUsers = this.usersInRoom[roomId];
		if ( roomUsers ) {
			roomUsers.forEach(uid => {
				if ( uid !== firebase.auth().currentUser.uid )
					companions.push(Object.assign({}, this.chatUsers[uid], {uid: uid}));
			})
		}
		return companions;
	}

	updateChatUsers(chatUser, uid) {
		this.chatUsers = Object.assign({}, this.chatUsers, chatUser);
		if ( uid === firebase.auth().currentUser.uid ) {
			this.chatUsers[uid].isCurrent = true;
		}
		let profileImagePath = chatUser[uid].profileImagePath;
		if ( profileImagePath === undefined ) return;
		if ( this.usersProfileImagesURL[profileImagePath] !== undefined ) return;

		firebaseStorage.getDownloadURL(profileImagePath, function(url) {
			this.usersProfileImagesURL[profileImagePath] = url;
			this.onUserChange(chatUser, uid);
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

		this.roomUsersDatabaseRef.on('child_added', function(usersSnapshot) {
			let roomObject = usersSnapshot.val();
			Object.keys(roomObject).forEach(key => {
				this.updateUsersInRoom(key, usersSnapshot.key);
			})
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