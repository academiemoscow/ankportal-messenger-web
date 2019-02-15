import firebase from 'controllers/FirebaseInitialize';
import 'firebase/auth';

import logger from 'helpers/Logger';
import 'helpers/helpers';

class FirebaseLoginManager {

	isLoggedIn = false;
	observers = [];

	addObserver(observer) {
		this.observers.push(observer);
	}

	login(firebaseUser) {
		(function(context) {
			firebase.auth()
				.signInWithEmailAndPassword(firebaseUser.email, firebaseUser.password)
				.catch(function(error) {
	  				logger.error(error);
				})
				.then(function(firebaseUser) {
					if (typeof firebaseUser === "undefined") return;
					logger.action(firebaseUser);
					context.observers.forEach(function(element) {
						callIfDefined(element.firebaseUserDidLoggedIn)();
					})
				});
		})(this);
	}
}

export default new FirebaseLoginManager()