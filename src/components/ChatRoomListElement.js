import React from 'react';
import { DateNumber } from 'helpers/helpers';

export default class ChatRoomListElement extends React.Component {

	getDivClasses = () => {
		let classes = "chat-room-list-element";
		if ( this.props.selectedRoomId === this.props.chatRoomId ) {
			classes += " selected";
		}
		return classes;
	}

	render() {
		let timestamp = DateNumber.since1970(this.props.timestamp);
		var options = {
			month: 'long',
			day: 'numeric',
			weekday: 'short',
			timezone: 'UTC',
			hour: 'numeric',
			minute: 'numeric'
		};
		let formattedTimestamp = timestamp.toLocaleString('ru', options);
		return(
			<div 
				className	= { this.getDivClasses() }
				onClick 	= { this.props.onClick(this) }
			>
				<p>Message text: { this.props.messageText }</p>
				<p>Timestamp: { formattedTimestamp }</p>
			</div>
		);
	}
}