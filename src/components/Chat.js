import React from 'react';
import ChatRoomList from 'components/ChatRoomList';
import ChatHeader from 'components/ChatHeader';

import firebase from 'controllers/FirebaseInitialize';
import FirebaseLoginUI from 'controllers/FirebaseLoginUI'; 
import 'firebase/auth';

import firebaseUserProvider from 'controllers/FirebaseUserProvider';
import firebasePushMessaging from 'controllers/FirebasePushMessaging';

import logo from 'images/LogoANK.png';
import 'spinlogo.css';

class Chat extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			isLoggedIn: !!firebase.auth().currentUser
			// isLoggedIn: true
		}

		this.onAuthStateChange = this.onAuthStateChange.bind(this);
	}

	componentDidMount() {
		this.unregisterAuthObserver = firebase.auth().onAuthStateChanged(
			this.onAuthStateChange
		);
	}

	componentWillUnmount() {
		this.unregisterAuthObserver();
	}

	onAuthStateChange(user) {
		this.setState({ 
			isLoggedIn: !!user,
			currentUser: undefined
		 });
		if (!user) return;
		firebaseUserProvider.getUserById(user.uid, (user) => { 
			this.setState({ currentUser: user });
			firebaseUserProvider.observerUsersProfiles();
			firebasePushMessaging.requestPermission();
		});
	}

	render() {
		if ( !this.state.isLoggedIn ) {
			return (
				<FirebaseLoginUI/>
			);	
		}

		if ( !this.state.currentUser ) {
			return (
				<div className="preloader-screen">
					<div>
						<img alt="ank logo" src={ logo }/>
					</div>
				</div>
			);	
		}

		return (
			<div className="chat-container">
				<ChatHeader user={ this.state.currentUser }/>
				<ChatRoomList />
			</div>
		);
	}
}

export default Chat;