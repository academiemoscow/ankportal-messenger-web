import firebaseStorage from 'controllers/FirebaseStorage';

class FirebaseUploader {

	tasks = [];

	addTask(uploadTask) {
		this.tasks = this.tasks.concat(uploadTask);
	}

	runTask(uploadTask) {
		uploadTask.firebaseFiles.forEach(function(firebaseFile) {

			if ( firebaseFile.storageRefPath 	=== undefined ||
				 firebaseFile.file 				=== undefined ) return;

			let ref = firebaseStorage.storageRef.child(firebaseFile.storageRefPath);
			let firUploadTask = ref.put(firebaseFile.file);

			firUploadTask.on('state_changed', function(snapshot){
				var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
				firebaseFile.setProgress(progress);
				uploadTask.progressHandler();
			}, function(error) {

			}, function() {
				firUploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
					firebaseFile.setDownloadUrl(downloadURL);
					uploadTask.fileUploaded(firebaseFile);
					if ( uploadTask.isCompleted() ) {
						uploadTask.completeHandler();
					}
				});
			});
		})
	}

}

export default new FirebaseUploader();