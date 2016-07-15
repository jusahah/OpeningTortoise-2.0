var ipcRenderer = require('electron').ipcRenderer;
var uuid = require('node-uuid');
var Promise = require('bluebird');


module.exports = function(Box, tempFolder) {
	var idsToPromiseCallbacks = {};

	Box.Application.addService('processCommunication', function(application) {

		// Register listening service for incoming msgs from background
		ipcRenderer.on('msg', function(event, arg) {
			console.log("Incoming msg to processCommunication service");
			console.log(arg);

			// check if it has resolve stashed
			var msgID = arg.msgID;
			if (!idsToPromiseCallbacks.hasOwnProperty(msgID)) {
				// Probably error
				console.error('Error? Process communication received msg with no resolve stashed: ' + msgID);
				return; // Just return
			}

			// If the incoming msg has success-field as true, we call resolve
			// Otherwise we call reject
			// This allows client to decide what to do on resolve vs. reject
			if (arg.success) {
				console.log("Calling cb in processCommunication");
				idsToPromiseCallbacks[msgID].resolve(arg.data);
			} else {
				console.log("Rejecting cb in processCommunication")
				idsToPromiseCallbacks[msgID].reject(arg.data);
			}

		});

		ipcRenderer.on('systemmsg', function(event, arg) {

			// Mapping process communication stuff into Box app broadcasting
			application.broadcast(arg.reason, arg.data);
			
		});

		var saveCallbacks = function(resolveFun, rejectFun, msgID) {
			idsToPromiseCallbacks[msgID] = {resolve: resolveFun, reject: rejectFun};
		}

		var sendToBackgroundProcess = function(msg) {
			console.warn("Sending to bg!");
			msg.msgID = uuid.v4(); // Random msg identifier
			ipcRenderer.send('msg', msg);

			return new Promise(function(resolve, reject) {
				// Basically here we just stash resolve so we can
				// call it when results come back;
				// Also consider doing some timeout/race stuff in case background never answers back
				saveCallbacks(resolve, reject, msg.msgID);
			});

		}

		var sendToBackgroundProcessNoResponse = function(msg) {
			// No need to generate tracking token as we dont expect response
			ipcRenderer.send('msg', msg);
			return Promise.resolve(); // for chaining purposes
		}



	    return {

	        sendToBackgroundProcess: sendToBackgroundProcess,
	        sendToBackgroundProcessNoResponse: sendToBackgroundProcessNoResponse

	    };
	});


}
