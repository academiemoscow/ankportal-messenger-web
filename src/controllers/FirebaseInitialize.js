import firebase from "firebase/app";

var config = {
	apiKey: "AIzaSyDKI_c0HuhqrDntkm0qt8VDDcZdTXx_Mtk",
	authDomain: "ankportal-d5a6d.firebaseapp.com",
	databaseURL: "https://ankportal-d5a6d.firebaseio.com",
	projectId: "ankportal-d5a6d",
	storageBucket: "ankportal-d5a6d.appspot.com",
	messagingSenderId: "1087651949975"
};

firebase.initializeApp(config);

export default firebase;