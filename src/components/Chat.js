import React from 'react';
import ChatRoomList from './ChatRoomList';

class Chat extends React.Component {
  render() {
    return (
      <div className="chat-container">
        <ChatRoomList/>
      </div>
    );
  }
}

export default Chat;