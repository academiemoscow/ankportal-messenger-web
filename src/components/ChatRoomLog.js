import React from 'react';

class ChatRoomLog extends React.Component {

	state = {
		roomId: ""
	}

	render() {
		return(
			<div className="chat-room-element">
				<div className="chat-room-element-id">{ this.props.roomId }</div>
			</div>
		);
	}
}

export default ChatRoomLog;