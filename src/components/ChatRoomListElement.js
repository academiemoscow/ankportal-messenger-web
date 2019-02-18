import React from 'react';

export default class ChatRoomListElement extends React.Component {

	getDivClasses = () => {
		let classes = "chat-room-list-element";
		if ( this.props.selectedRoomId === this.props.chatRoomId ) {
			classes += " selected";
		}
		return classes;
	}

	render() {
		return(
			<div 
				className	= { this.getDivClasses() }
				onClick 	= { this.props.onClick(this) }
				>
				<p>Message text: { this.props.messageText }</p>
				<p>Timestamp: { this.props.timestamp }</p>
			</div>
		);
	}
}