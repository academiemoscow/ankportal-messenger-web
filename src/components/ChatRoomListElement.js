import React from 'react';
import { DateNumber } from 'helpers/helpers';
import firebaseUserProvider from 'controllers/FirebaseUserProvider';

import { FaFileImage } from 'react-icons/fa';

import placeholder from 'images/avatar-placeholder.png';

export default class ChatRoomListElement extends React.Component {

	companions = []
	avatarUrl = placeholder;

	constructor(props) {
		super(props);
		this.updateCompanions();
		this.subscribeForUserChange();
	}

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

	subscribeForUserChange = () => {
		this.companions.forEach(user => {
			firebaseUserProvider.addObserverFor(user.uid, this);
		})
	}

	onUserChange(userObject, uid) {
		this.updateCompanions();
		this.forceUpdate();
	}

	updateCompanions = () => {
		this.companions = firebaseUserProvider.getCompanionsInRoom(this.props.message.chatRoomId);
		this.avatarUrl = firebaseUserProvider.getProfileImageFor(this.companions[0].uid);
	}

	renderAvatar = () => {
		return (<div className = "profile-avatar rounded-circle"
					style 	  = { { backgroundImage : `url(${this.avatarUrl})` } }></div>
				)
	}

	render() {
		const companion = this.companions[0];
		const timestamp = DateNumber.since1970(this.props.message.timestamp);
		const options = {
			month: 'long',
			day: 'numeric',
			weekday: 'short',
			timezone: 'UTC',
			hour: 'numeric',
			minute: 'numeric'
		};
		const formattedTimestamp = timestamp.toLocaleString('ru', options);
		const content = (() => {
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
				{ this.renderAvatar() }
				<p className = "title">{ companion ? companion.name : "Имя отсуствует" }</p>
				{ content }
				{ this.renderUnreadBadge() }
				<p>{ formattedTimestamp }</p>
			</div>
		);
	}
}