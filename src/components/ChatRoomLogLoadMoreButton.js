import React from 'react';
import Spinner from 'components/Spinner';

export default class ChatRoomLogLoadMoreButton extends React.Component {

	state = {
		isLoading : false
	}

	clickHandler() {
		this.props.onClick(this);
	}

	getContent = () => {
		if ( this.state.isLoading ) {
			return <Spinner />
		}

		return <button type 	 = "button"
					   className = "btn btn-primary btn-sm shadow-sm"
					   onClick   = { this.clickHandler.bind(this) }
					   >Загрузить еще</button>
	}

	render() {
		if ( this.props.isHidden ) return <div></div>; 
		return (
				<div className = "chat-room-log-load-more">
					{ this.getContent() }
				</div>
			)
	}

}