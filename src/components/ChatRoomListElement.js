import React from 'react';
import { DateNumber } from 'helpers/helpers';
import firebaseUserProvider from 'controllers/FirebaseUserProvider';

import { FaFileImage } from 'react-icons/fa';

export default class ChatRoomListElement extends React.Component {

	getDivClasses = () => {
		let classes = "chat-room-list-element";
		if ( this.props.selectedRoomId === this.props.message.chatRoomId ) {
			classes += " selected";
		}
		return classes;
	}

	renderUnreadBadge = () => {
		const unreadCount = this.props.unreadCount;
		if ( unreadCount === undefined || unreadCount === 0 ) return;
		return (
			<div className="room-unread-count-container">
				<span className="badge badge-pill badge-dark">{ unreadCount }</span>
			</div>
		)
	}

	render() {
		let user = firebaseUserProvider.chatUsers[this.props.message.fromId];
		let timestamp = DateNumber.since1970(this.props.message.timestamp);
		var options = {
			month: 'long',
			day: 'numeric',
			weekday: 'short',
			timezone: 'UTC',
			hour: 'numeric',
			minute: 'numeric'
		};
		let formattedTimestamp = timestamp.toLocaleString('ru', options);
		let content = (() => {
			if ( this.props.message.text ) {
				let text = this.props.message.text;
				return <p>{ text.length > 50 ? text.slice(0, 49).concat("...") : text }</p>;
			}
			return <p><FaFileImage /> Изображение</p>
		})();

		return(
			<div 
				className	= { this.getDivClasses() }
				onClick 	= { this.props.onClick(this) }
			>
				<p>{ user ? user.name : "Имя отсуствует" }</p>
				{ content }
				{ this.renderUnreadBadge() }
				<p>{ formattedTimestamp }</p>
			</div>
		);
	}
}