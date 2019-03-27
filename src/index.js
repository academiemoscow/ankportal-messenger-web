import React from 'react';
import ReactDOM from 'react-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import './preloader.css';
import './toggle-button.css';
import './animations.css';

import { Provider } from 'react-redux';
import { createStore,
		 combineReducers } from 'redux';
import { roomInput,
		 imageDownload,
		 chatStateReducer } from 'redux/reducers';

import Chat from 'components/Chat.js';
import firebaseMessagesObserver from 'controllers/FirebaseMessagesObserver';
import firebasePushMessaging from 'controllers/FirebasePushMessaging';

const reducers = combineReducers( {
	roomInputState: roomInput, 
	imagesUrlState: imageDownload,
	chatState: chatStateReducer 
});
const store = createStore(reducers);
firebaseMessagesObserver.store = store;
firebasePushMessaging.store = store;
ReactDOM.render(
	<Provider store={store}>
		<Chat />
	</Provider>,
	document.getElementById('root')	
);
