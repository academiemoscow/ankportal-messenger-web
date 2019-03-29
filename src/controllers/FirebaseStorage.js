import firebase from 'controllers/FirebaseInitialize';
import 'firebase/storage';

class FirebaseStorage {

	referencesToLoad = [];
	loadedUrl = {};
	loadedImages = {};

	addReference(ref) {
		this.referencesToLoad.push(ref);
		if ( this.referencesToLoad.length === 1) {
			this.download();
			this.intervalId = setInterval(this.download.bind(this), 1000);
		}
	}

	referenceIncrementAttempt(ref) {
		if ( ref.attempt === undefined ) {
			ref.attempt = 0;
		}

		if ( ref.maxAttempts !== undefined && ++ref.attempt > ref.maxAttempts ) {
			this.removeReference(ref);
			return;
		}

		return ref;
	}

	removeReference(ref) {
		this.referencesToLoad = this.referencesToLoad.filter(reference => reference !== ref);
		if ( this.referencesToLoad.length === 0 ) this.stopDownloading(); 
	}

	stopDownloading() {
		clearInterval(this.intervalId);
	}

	download() {
		if ( this.isDownloading ) return;
		if ( this.referencesToLoad.length === 0 ) return this.stopDownloading();
		this.isDownloading = true;

		let references = this.referencesToLoad;

		references.forEach( (ref) => {
			this.downloadRef(ref);	
		} )

		this.isDownloading = false;
	}

	downloadRef(ref) {
		let url 		= ref.url,
			onComplete 	= ref.onComplete;

		if ( !url || !onComplete ) {
			this.isDownloading = false;
			return this.removeReference(ref);
		}
		
		if ( this.referenceIncrementAttempt(ref) === ref ) {
			this.getDownloadURL(
				url, 
				(url) => {
					this.removeReference(ref);
					onComplete(url);
				}
			);	
		}
	}

	constructor() {
		this.storageRef = firebase.storage().ref();
	}

	getDownloadURL(childRef, callback = (url) => {}, onError = (error) => {}) {
		this.storageRef
			.child(childRef)
			.getDownloadURL()
			.then(function(url) {
				this.loadedUrl[childRef] = url;
				let image = new Image();
				image.src = url;
				this.loadedImages[childRef] = image;
				callback(url);
			}.bind(this))
			.catch(function(error) {
				onError(error);
			})
	}
}

export default new FirebaseStorage();