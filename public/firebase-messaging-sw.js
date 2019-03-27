'use strict';

importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-messaging.js');

firebase.initializeApp({
  'messagingSenderId': '959682426231'
});

const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function(payload) {
  // Customize notification here
  const notificationTitle = payload.webpush.notification.title;
  const notificationOptions = {
    data: payload.data
  };

  return self.registration.showNotification(notificationTitle,
      notificationOptions);
});