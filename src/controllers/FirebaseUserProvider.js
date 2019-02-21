import firebase from 'controllers/FirebaseInitialize';
import 'firebase/database';

export default class FirebaseUserProvider {

	constructor() {
		this.usersDatabaseRef = firebase.database().ref("users");
	}
	
	getUserById(userid, callback = (user) => {}) {
		if ( userid === undefined ) return;
		let userRef = this.usersDatabaseRef.child(userid);
		userRef.once('value', function(userSnapshot) {
			callback(userSnapshot.val());
		});
	}
}