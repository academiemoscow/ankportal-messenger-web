import React from 'react';
import ChatRoomList from 'components/ChatRoomList';
import ChatHeader from 'components/ChatHeader';

import firebase from 'controllers/FirebaseInitialize';
import FirebaseLoginUI from 'controllers/FirebaseLoginUI'; 
import 'firebase/auth';

import FirebaseUserProvider from 'controllers/FirebaseUserProvider';

class Chat extends React.Component {

	constructor() {
		super();
		this.state = {
			isLoggedIn: !!firebase.auth().currentUser
			// isLoggedIn: true
		}

		this.firUserProvider = new FirebaseUserProvider();
	}

	onAuthStateChange(user) {
		this.setState({ isLoggedIn: !!user });
		if (!user) return;
		this.firUserProvider.getUserById(user.uid, (user) => { 
			this.setState({ currentUser: user });
		});
	}

	render() {
		if ( !this.state.isLoggedIn ) {
			return (
				<FirebaseLoginUI onAuthStateChange={ this.onAuthStateChange.bind(this) }/>
			);	
		}

		// if ( !this.state.currentUser ) {
		// 	return (
		// 		<div />
		// 	);	
		// }

		return (
			<div className="chat-container">
				<ChatHeader user={ this.state.currentUser }/>
				<ChatRoomList />
			</div>
		);
	}
}

export default Chat;