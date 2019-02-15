import React from 'react';

export default class ChatRoomListElement extends React.Component {
	render() {
		return(
			<div className="chat-room-list-element">
				<p>Message text: { this.props.messageText }</p>
				<p>Timestamp: { this.props.timestamp }</p>
			</div>
		);
	}
}