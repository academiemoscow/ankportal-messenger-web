import firebase from "firebase/app";
import { config } from 'config/FirebaseConfig';

firebase.initializeApp(config);

export default firebase;