
export class FirebaseFile {

	downloadUrl 	= null;
	file 			= null;
	storageRefPath 	= null;
	uploadProggress = 0;

	setProgress(progress) {
		this.uploadProggress = progress;
		if ( typeof this.onProgress === 'function' ) {
			this.onProgress(progress);
		}
		if ( progress >= 100 && typeof this.onComplete === 'function' ) {
			this.onComplete();
		}
	}

	setDownloadUrl(url) {
		this.downloadUrl = url;
	}
}

export class UploadTask {

	firebaseFiles 		= [];
	uploadedFilesCount 	= 0;

	constructor(roomId) {
		this.roomId = roomId;
	}

	addFile(file, storageRefPath, onComplete, onProgress) {
		let firebaseFile 			= new FirebaseFile();
		firebaseFile.file 			= file;
		firebaseFile.storageRefPath = storageRefPath;
		this.firebaseFiles.push(firebaseFile);
	}

	completeHandler() {
		if ( typeof this.onComplete !== 'function' ) return;
		this.onComplete(this.roomId, this.firebaseFiles);
	}

	onError(error) {
		if ( typeof this.onError !== 'function' ) return;
		this.onError(this.roomId, error);
	}

	fileUploaded(file) {
		this.uploadedFilesCount++;
	}

	currentProgress() {
		let sumProgressFiles = this.firebaseFiles.length === 0 ? 0 : this.firebaseFiles.reduce(function(sum, currentFile) {
								return sum + currentFile.uploadProggress;
							}, 0);

		let averageProgressFiles = this.firebaseFiles.length > 0 ? sumProgressFiles / this.firebaseFiles.length : 100;
		return averageProgressFiles;
	}

	isCompleted() {
		return this.uploadedFilesCount === this.firebaseFiles.length;
	}

	progressHandler() {
		if ( typeof this.onProgress !== 'function' ) return;
		this.onProgress(this.roomId, this.currentProgress());
	}

}