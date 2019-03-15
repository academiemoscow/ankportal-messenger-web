import { connect } from 'react-redux';
import React from 'react';
import firebase from 'controllers/FirebaseInitialize'; 
import 'firebase/auth';
import firebaseMessageUploader from 'controllers/FirebaseMessageUploader';
 
import Spinner from 'components/Spinner';

class ChatRoomLogMessage extends React.Component {

	componentDidUpdate() {
		this.updateMessageIsRead(this.props.message);
	}

	componentWillMount() {
		this.updateMessageIsRead(this.props.message);
	}

	updateMessageIsRead(message) {
		//message.status === 3 - message is read
		if ( message.messageStatus === 3 ||
			 message.fromId === firebase.auth().currentUser.uid ) return;

		const messageRef = firebaseMessageUploader.getMessageRefFor(message);
		messageRef.update({ messageStatus : 3 });
	}

	getClassesForMessageBallon = (message) => {
		if ( message.fromId === firebase.auth().currentUser.uid ) {
			return "offset-5 chat-message-outgoing";
		}
		return "col-7 chat-message-incoming";
	}

	openOriginalUrl = () => {
		if ( !this.props.imageUrl ) return;
		window.open(this.props.imageUrl, '_blank');
	}

	renderContent = () => {
		let message = this.props.message;
		if ( message.pathToImage === undefined ) {
			return message.text;
		}

		if ( this.props.imageUrl === undefined ) {
			return <Spinner />;
		}

		return <img src 	  = { this.props.imageUrl } 
					alt 	  = ""  
					width	  = "200" 
					className = "rounded-lg"
					onClick   = { this.openOriginalUrl }/>

	}

	render() {
		return (
			<div 
				className	= { this.getClassesForMessageBallon(this.props.message) }
				>
				<div className = "chat-room-log-message p-2 mt-2 mb-2">
					{ this.renderContent() }
				</div>
			</div>
		)
	}

}

const mapStateToProps = (state, ownProps) => ({
  imageUrl : state.imagesUrlState[ownProps.message.pathToImage]
})

export default connect(
	mapStateToProps
)(ChatRoomLogMessage);