import firebase from "firebase/app";

var config = {
    apiKey: "AIzaSyCll36_3sm6KWS2QZBYhTRV6w5Xxy40piU",
    authDomain: "ankportal-964f5.firebaseapp.com",
    databaseURL: "https://ankportal-964f5.firebaseio.com",
    projectId: "ankportal-964f5",
    storageBucket: "ankportal-964f5.appspot.com",
    messagingSenderId: "959682426231"
};

firebase.initializeApp(config);

export default firebase;