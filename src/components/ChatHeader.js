import React from 'react';
import firebaseStorage from 'controllers/FirebaseStorage';

import ChatHeaderUserInfo from 'components/ChatHeaderUserInfo';

export default class ChatHeader extends React.Component {
	render() {
		return (
			<div className="chat-header container-fluid">
				<div className="row align-items-center">
					<ChatHeaderUserInfo user={ this.props.user } />
				</div>
			</div>
			);
	}
}