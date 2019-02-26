import React from 'react';
import Icon from 'react-native-vector-icons/FontAwesome5';

export default class ChatRoomInput extends React.Component {
	render() {
		return (
			<div className="chat-room-input border-top shadow-lg">
				<div className="input-group">
					<div className="input-group-prepend">
						<button className 	= "btn btn-outline-secondary rounded-0 border-bottom-0 border-left-0 border-right border-top-0"
								type 		= "button" 
								id 			= "button-addon2">Button
						</button>
					</div>
					<textarea 	className   = "form-control border-0" 
								aria-label  = "With textarea" 
								placeholder = "Введите здесь сообщение...">
					</textarea>
					<div className="input-group-append">
						<button className	= "btn btn-outline-success rounded-0 border-bottom-0 border-left border-right-0 border-top-0" 
								type		= "button" 
								id 			= "button-addon2"><Icon name="rocket" size={30} color="#900" />
						</button>
					</div>
				</div>
			</div>
			);
	}
}