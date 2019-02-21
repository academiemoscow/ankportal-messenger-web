import React from 'react';

import firebase from 'controllers/FirebaseInitialize';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import 'firebase/auth';

export default class FirebaseLoginUI extends React.Component {

	uiConfig = {
		signInFlow: 'popup',
		signInOptions: [
			firebase.auth.EmailAuthProvider.PROVIDER_ID
		],
    	'credentialHelper': 'none',
		callbacks: {
			signInSuccessWithAuthResult: () => false
		}
	};

	componentDidMount() {
		this.unregisterAuthObserver = firebase.auth().onAuthStateChanged(
			(user) => this.props.onAuthStateChange(user)
		);
	}

	componentWillUnmount() {
		this.unregisterAuthObserver();
	}

	render() {
		return(
				<StyledFirebaseAuth 
					uiConfig	 =	{ this.uiConfig } 
					firebaseAuth =	{ firebase.auth() }
					/>
			)
	}
}