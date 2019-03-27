import React from 'react';
import placeholder from 'images/avatar-placeholder.png';

import firebase from 'controllers/FirebaseInitialize';
import 'firebase/auth';
import firebaseStorage from 'controllers/FirebaseStorage';
import firebaseUserProvider from 'controllers/FirebaseUserProvider';

export default class ChatHeaderUserInfo extends React.Component {

	state = {
		profileImage: placeholder
	}
	
	updateProfileImageFromStorage = (user) => {
		if ( this.state.profileImage !== placeholder || 
			user === undefined ||
			user.profileImagePath === undefined ) return;
		let url = firebaseUserProvider.usersProfileImagesURL[user.profileImagePath];
		if ( url !== undefined ) {
			this.setState({ profileImage: url });
			return;	
		}
		firebaseStorage.getDownloadURL(user.profileImagePath, (url) => {
			this.setState({ profileImage: url });
		})
	}

	shouldComponentUpdate(nextProps, nextState) {
		this.updateProfileImageFromStorage(nextProps.user);
		return true;
	}

	componentDidMount() {
		this.updateProfileImageFromStorage(this.props.user);
	}

	render() {
		let user = (() => {
			let anonymous = {
				name 			: "Anonymous",
				profileImagePath: ""
			}
			if ( this.props.user === undefined ) {
				return anonymous;
			}
			return this.props.user;
		})();

		return <div className="chat-header-user-account-info col"> 
					<div className="profile-image">
						<img alt="avatar placeholder" src={ this.state.profileImage } />
					</div>
					<div className="profile-description ml-2">
						<p>{ user.name }</p>
						<p>{ user.description }</p>
					</div>
					<div className="profile-actions ml-2">
						<p><button className="btn btn-light btn-sm" onClick={ () => { firebase.auth().signOut() } }>Выйти</button></p>
					</div>
				</div>
	}

}