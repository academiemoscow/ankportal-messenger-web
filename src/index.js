import React from 'react';
import ReactDOM from 'react-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import './preloader.css';
import './toggle-button.css';

import { Provider } from 'react-redux';
import { createStore, combineReducers } from 'redux';
import { roomInput, imageDownload } from 'redux/reducers';

import Chat from 'components/Chat.js';
import firebaseMessagesObserver from 'controllers/FirebaseMessagesObserver';

const reducers = combineReducers( {
	roomInputState: roomInput, 
	imagesUrlState: imageDownload 
});
const store = createStore(reducers);
firebaseMessagesObserver.store = store;
ReactDOM.render(
	<Provider store={store}>
		<Chat />
	</Provider>,
	document.getElementById('root')	
);
