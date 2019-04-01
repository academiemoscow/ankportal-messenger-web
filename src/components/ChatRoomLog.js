import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import Baron from 'react-baron';
// import Baron from 'react-baron/dist/es5';
import 'react-baron/src/styles.css';
import { DateNumber } from 'helpers/helpers';
import firebaseMessagesObserver from 'controllers/FirebaseMessagesObserver';
import firebase from 'controllers/FirebaseInitialize'; 
import 'firebase/auth';
import ChatRoomInput from 'components/ChatRoomInput';
import ChatRoomLogMessage from 'components/ChatRoomLogMessage';
import ChatRoomLogLoadMoreButton from 'components/ChatRoomLogLoadMoreButton';

import eventDispatcher from 'controllers/EventDispatcher';
import ImgsViewer from 'react-images-viewer';

class ChatRoomLog extends React.Component {

	imgs = [];
	imgsIndex = [];

	state = {
		lastMessageTimeStamp: null,
		headerMessages      : [],
		imageUrlViewIndex	: null,
		messagesCount 		: 0
	}

	constructor(props) {
		super(props);
		eventDispatcher.subscribe(this);
		this.hasError = this.hasError.bind(this);
		this.firebaseDidRecieveNewMessage = this.firebaseDidRecieveNewMessage.bind(this);
		this.firebaseDidUpdateMessage = this.firebaseDidUpdateMessage.bind(this);
	}

	hasError(error) {
		let headerMessage = {
			type	: "ERROR",
			cls   	: "error",
			h 		: "Ошибка # " + error.code,
			message : error.message
		}
		this.setState({ 
			headerMessages 	: this.state.headerMessages.concat(headerMessage)
		});

		this.handleMessageLifetime(error, headerMessage);
	}

	handleMessageLifetime(message, headerMessage) {
		clearTimeout(this.headerMessageTimeoutId);

		if ( message.lifetime )
			headerMessage.headerMessageTimeoutId = setTimeout(
				this.eraseHeaderMessage(headerMessage).bind(this),
				message.lifetime
			)
	}

	hasMessage(message) {
		let headerMessage = {
			type	: "MESSAGE",
			cls   	: message.cls ? message.cls : "info-block",
			h 		: message.title ? message.title : "Сообщение",
			message : message.message
		}
		this.setState({ 
			headerMessages 	: this.state.headerMessages.concat(headerMessage)
		});

		this.handleMessageLifetime(message, headerMessage);
	}

	eraseHeaderMessage = (message) => {
		return function() {
			this.setState({ headerMessages: this.state.headerMessages.filter(m => m !== message) });
		}
	}

	componentDidMount() {
		firebaseMessagesObserver.addObserver(this);
	}

	componentDidUpdate(prevProps, prevState) {
		this.updateCacheImages();
		this.updateMessageCount(); 

		if ( prevProps.roomId !== this.props.roomId ||
			 prevState.lastMessageTimeStamp !== this.state.lastMessageTimeStamp ) 
			this.baronRef.scrollToLast();
	}

	firebaseDidUpdateMessage(message) {
		if ( message.chatRoomId !== this.props.roomId ) return;
		this.forceUpdate();
	}

	updateMessageCount = () => {
    	const messages = firebaseMessagesObserver.messages[this.props.roomId];
    	if ( !messages ) return;

    	if ( messages.length !== this.state.messagesCount ) 
    		this.setState({ messagesCount : messages.length });
	}

	firebaseDidRecieveNewMessage(message) {
		if ( message.chatRoomId !== this.props.roomId ) return;

		this.setState({ 
			lastMessageTimeStamp: message.timestamp,
			messagesCount       : this.state.messagesCount + 1
		});
	}

	removeClass = (element, className) => {
		if ( !element ) return this;
 		element.className = element.className.replace(' ' + className, '');
 		return this;
	}

	addClass = (element, className) => {
		if ( !element ) return this;
		if ( element.className.indexOf(className) === -1)
 			element.className += ' ' + className;
 		return this;
	} 

	turnOffDateCurrentContainer = () => {
		this.removeClass(this.currentDateContainer, 'visible');
	}

	turnOnDateCurrentContainer = () => {
		this.addClass(this.currentDateContainer, 'visible');

		if ( this.currentDateOffTimeout ) 
			clearTimeout(this.currentDateOffTimeout);

		this.currentDateOffTimeout = setTimeout(this.turnOffDateCurrentContainer.bind(this), 1500);
	}

	setStyle = (element, style) => {
		if ( !element ) return;
		Object.assign(element.style, style);
	}

	clearStyle = (element) => {
		if ( !element ) return;
		element.removeAttribute('style');
	}

	setCurrentDateLabel = (dateLabel) => {
		if ( this.currentDateContainer === dateLabel ) return;
		this.removeClass(this.currentDateContainer, 'current-date')
			.removeClass(this.currentDateContainer, 'visible');
		this.currentDateContainer  = dateLabel;
		this.addClass(this.currentDateContainer, 'current-date');	
	}

	scrollDidOnTop = () => {

	}

	handleScroll = (e) => {
		if ( !this.dateDivRefs ) return;
		const scroller = this.baronRef.getScroller();
		let topElement = null;
 		
 		if ( scroller.scrollTop < 5 ) {
 			this.scrollDidOnTop();	
 		}

 		if ( scroller.scrollTop < 30 ) {
 			this.setCurrentDateLabel(undefined);
 			return;
 		}

		const chatRoomLogBRect = ReactDOM.findDOMNode(this.chatRoomLog).getBoundingClientRect();
		for(let i = this.dateDivRefs.length -1 ; i >= 0; i--) {
			const element = this.dateDivRefs[i];
			const bRect = element.getBoundingClientRect();
			const elementScrollTop = bRect.top - chatRoomLogBRect.top;

			if ( elementScrollTop <= scroller.scrollTop ) {
				topElement = element;
				break;
			}
		}

		if ( topElement !== null ) {
			this.setCurrentDateLabel(topElement);
			this.turnOnDateCurrentContainer();
		}
	}

	getClassesForMessageBallon = (message) => {
		if ( message.fromId === firebase.auth().currentUser.uid ) {
			return "offset-5 chat-message-outgoing";
		}
		return "col-7 chat-message-incoming";
	}

	resolveDate = (date) => {

		const options = {
			month: 'long',
			day: 'numeric',
			weekday: 'short',
			timezone: 'UTC'
		};
		const formattedTimestamp = date.toLocaleString('ru', options);

		const now = new Date();
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

		const difference = (today - date) / 1000/ 60 / 60 / 24;

		if ( difference <= 0 ) {
			return 'СЕГОДНЯ'
		} else if ( difference - 1 < 0 ) {
			return 'ВЧЕРА'
		}

		return formattedTimestamp;
	}

	getDateLabel = (message1, message2, i) => {
		const dateCurrentMessage 	= DateNumber.since1970(message1.timestamp);
		if ( i > 0 ) {
			const datePrevMessage 	= DateNumber.since1970(message2.timestamp);
			if ( dateCurrentMessage.toDateString() === datePrevMessage.toDateString() ) return;
		}

		return (<div key       = { "date-label-for-" + i } 
					 className = "chat-room-log-d-label"  
					 ref 	   = { r => { if ( r !== null ) this.dateLabelRefs.push(ReactDOM.findDOMNode(r)) } }>
					<div className="inner-date-container badge-pill badge-secondary m-auto shadow text-center w-25">{ this.resolveDate( dateCurrentMessage ) }</div>
				</div>);
	}

	getCurrentFormattedDate = (message) => {
		const dateCurrentMessage 	= DateNumber.since1970(message.timestamp);


		let timestamp = dateCurrentMessage;
		var options = {
			month: 'long',
			day: 'numeric',
			weekday: 'short',
			timezone: 'UTC'
		};
		let formattedTimestamp = timestamp.toLocaleString('ru', options);

		return formattedTimestamp;	
	}

	getMarginClass = (dateLabel, messages, i) => {
		let marginClass = "";
		const length = messages.length;

		if ( i === length - 1 || messages[i].fromId !== messages[i+1].fromId  ) 
			marginClass += " mb-2";

		if ( i === 0 || 
			messages[i].fromId !== messages[i-1].fromId ||
			( messages[i].fromId !== messages[i-1].fromId && i === length - 1 ) ||
			( messages[i].fromId !== messages[i-1].fromId && messages[i].fromId !== messages[i+1].fromId )  )
			marginClass += " last-message-radius";

		if ( i === 0 )
			marginClass += " mt-2";
		else if ( messages[i].fromId === messages[i-1].fromId )
			marginClass += " margin-top-3p";

		return marginClass;
	}

	wrap = (className, children = [], key, ref = (r) => {}) => {
		if ( children.length === 0 ) return;
		return (<div key 	   = { key } 
					 className = { className }
					 ref 	   = { ref }>{ children }</div>)
	} 

	messageClickHandler = (message) => {
		let index = this.imgsIndex.indexOf(message.props.imageUrl);
		if ( index === -1 ) index = null; 
		this.setState({ imageUrlViewIndex : index });
	}

	onCloseImgViewer = () => {
		this.setState({ imageUrlViewIndex : null });
	}

	gotoPreviousImg = () => {
		let prevImg = this.state.imageUrlViewIndex;
		if ( --prevImg < 0 )
			prevImg = this.imgs.length - 1;
		this.setState({ imageUrlViewIndex : prevImg });
	}

	gotoNextImg = () => {
		let nextImg = this.state.imageUrlViewIndex;
		if ( ++nextImg >= this.imgs.length )
			nextImg = 0;
		this.setState({ imageUrlViewIndex : nextImg });
	}

	onClickImg = (e) => {
		window.open(e.target.src, '_blank');
	}

	createRoomLog = () => {
		this.dateLabelRefs = [];
		this.dateDivRefs = [];
		let divList = [];
		let oneDayBlock = [];
		let messages = firebaseMessagesObserver.messages[this.props.roomId];
 		let i;
 		const refClosure = (r => { 
 			if ( r !== null ) 
 				this.dateDivRefs.push(ReactDOM.findDOMNode(r)) 
 		});
		if (typeof messages !== "undefined") {
			for(i = 0; i < messages.length; i++) {
				const dateLabel = this.getDateLabel(messages[i], messages[i-1], i);
				if ( dateLabel !== undefined ) {
					divList.push(this.wrap('wrapper', oneDayBlock, i, refClosure));
					oneDayBlock = [];
					oneDayBlock.push(dateLabel);
				}

				const marginClass = this.getMarginClass(dateLabel, messages, i);

				oneDayBlock.push(<ChatRoomLogMessage key 		 = { i }
												 message 	 = { messages[i] } 
												 marginClass = { marginClass }
												 onClick 	 = { this.messageClickHandler }/>)
			}	
			divList.push(this.wrap('wrapper', oneDayBlock, i, refClosure));
		}
		return divList;
	}

	renderPlaceholder = () => {
		return <div className="placeholder">&nbsp;</div>;
	}

	renderRoomInput = () => {
		if ( this.props.roomId === null ) return;
		return <ChatRoomInput roomId={ this.props.roomId }/>
	}

	renderHeaderMessage = (message, key) => {
		if ( message !== null ) {
			return (
				<div key = { key } className={ "header-message " + message.cls }>
					<div 	className 	= "toast" 
							role 		= "alert" 
							aria-live 	= "assertive" 
							aria-atomic = "true">

						<div className="toast-header">
							<strong className="mr-auto">{ message.h }</strong>
							<button type 	     = "button" 
									onClick      = { this.eraseHeaderMessage(message).bind(this) } 
									className    = "ml-2 mb-1 close" 
									data-dismiss = "toast" 
									aria-label 	 = "Close">
								<span aria-hidden="true">&times;</span>
							</button>
						</div>
						<div className="toast-body">
							{ message.message }
						</div>
					</div>
				</div>
			)
		}
		return (
			<div className="header-message">
			</div>
		)
	}

	renderHeaderMessages = () => {
		let divHeaders = [];
		if ( this.state.headerMessages.length === 0 ) return;
		this.state.headerMessages.forEach(( message, index ) => {
			divHeaders.push(this.renderHeaderMessage(message, index));
		})
		return <div className="system-messages">{ divHeaders }</div>;
	}

	updateCacheImages = () => {
		this.imgs = [];
		this.imgsIndex = [];
		const messages = firebaseMessagesObserver.messages[this.props.roomId];
		if (typeof messages === "undefined" || messages.length === 0) 
			return;

		messages.forEach(message => {
			if ( message.pathToImage && 
				 message.pathToImage !== '' ) {
				const url = this.props.imagesUrlState[message.pathToImage];
				if ( url ) {
					this.imgs.push({ src: url });
					this.imgsIndex.push(url);
				}
			}
		})
	}


	renderImageViewer = () => {

		if ( !this.imgs || this.imgs.length === 0 ) return; 

		let isOpen = true;
		if ( this.state.imageUrlViewIndex === null ) isOpen = false;

		return <ImgsViewer 
					imgs    	= { this.imgs }
					isOpen  	= { isOpen }
					currImg 	= { this.state.imageUrlViewIndex }
        			onClickPrev = { this.gotoPreviousImg }
       				onClickNext = { this.gotoNextImg }
       				onClickImg 	= { this.onClickImg }
					onClose 	= { this.onCloseImgViewer }/>	
	}

	renderGradient = () => {
		return <div className="gradient"></div>
	}

	clickMoreDateHandler = (object) => {
		object.setState({ isLoading : true });
		firebaseMessagesObserver.loadPreviousFor(this.props.roomId, (count) => {
			object.setState({ isLoading : false });
			let state = { messagesCount : this.state.messagesCount + count };
			this.setState(state);
		});
	}

	renderLoadMoreButton = () => {
		if ( this.props.roomId !== null && 
			 this.state.messagesCount >= firebaseMessagesObserver.loadingPortion )
			return <ChatRoomLogLoadMoreButton onClick  = { this.clickMoreDateHandler.bind(this) } 
											  isHidden = { firebaseMessagesObserver.roomLoadedComplete[this.props.roomId] }/>		
	}

	render() {
		return(
			<div className   = "col-sm-8 p-0 chat-room-log-container">
				{ this.renderImageViewer() }
				{ this.renderHeaderMessages() }
				<div className = "chat-room-messages" style={ { marginBottom: -this.props.roomInputHeight } }>
					<Baron ref 		  = {(r) => this.baronRef = r}
						   onScroll   = { this.handleScroll }
						   params = { { barOnCls : "baron", direction: 'v' } }>
						{ this.renderLoadMoreButton() }
						<div className="chat-room-log p-2" ref={r => this.chatRoomLog = r}>
							{ this.props.roomId === null ? this.renderPlaceholder() : this.createRoomLog() }
						</div>
					</Baron>
				</div>
				{ this.renderRoomInput() }
			</div>
		);
	}
}

const mapStateToProps = (state, ownProps) => ({
  roomInputHeight: !state.roomInputState[ownProps.roomId] || !state.roomInputState[ownProps.roomId].roomInputHeight ? 61 : state.roomInputState[ownProps.roomId].roomInputHeight,
  imagesUrlState : state.imagesUrlState
})

export default connect(
	mapStateToProps
)(ChatRoomLog);