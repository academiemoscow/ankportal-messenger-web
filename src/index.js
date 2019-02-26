import React from 'react';
import ReactDOM from 'react-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import './preloader.css';
import './toggle-button.css';

import Chat from 'components/Chat.js';

ReactDOM.render(
  <Chat />,
  document.getElementById('root')
);
