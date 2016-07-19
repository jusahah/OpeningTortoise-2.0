var _ = require('lodash');
var Promise = require('bluebird');
var uuid = require('node-uuid');
var shell = require("shelljs");
var shellglobal = require('shelljs/global');

module.exports = function(Box, positionAI) {
	Box.Application.addService('captureService', function(application) {

		var currentlyTakingScreenshot = false;
		var captureInterval = null;

		var turnOn = function() {
			/*
			if (currentlyTakingScreenshot) return Promise.reject('Screen capture in progress');
			if (captureInterval) return Promise.reject('Capture interval already exists');

			captureInterval = setInterval(function() {
				takeScreenshot(1).then(sendToAnalysis);
			}, 8000);
			*/
			console.log("Setting test timeouts for calling positionAI API");
			setTimeout(takeBoardSetupImage, 2000);
			setTimeout(function() {
				captureInterval = setInterval(function() {
					takeScreenshot(1).then(sendToAnalysis);
				}, 2500);
			}, 7000);


		}

		var turnOff = function() {
			// Clear the interval timer
			if (captureInterval) {
				clearInterval(captureInterval);
				captureInterval = null;
			}
		}

	    var takeScreenshot = function(timer) {
	    	return new Promise(function(resolve, reject) {
		        console.log("Capture shot requested in T3 service!");
		        if (currentlyTakingScreenshot) return;
				console.log("Taking screencapture");
				currentlyTakingScreenshot = true;

				// Generate unique identifier from temp file name 
				// NOTE: In production save these to OS's temp folder!?
				var tempFileName = __dirname + "/temp/" + uuid.v1() + ".jpg"

			    shell.exec("gnome-screenshot -w -d " + timer + " -f " + tempFileName, function(){
			    	currentlyTakingScreenshot = false;
			    	console.log("Screenshot saved to temp file: " + tempFileName)
			    	resolve(tempFileName);
			    });	    		
	    	})

	        	
	    }

	    var sendToAnalysis = function(tempFileName) {
	    	return positionAI.resolveImageUsingBoardSetup(tempFileName)
	    	.then(function(fen) {
	    		console.warn("FEN RECEIVED BY CAPTURE SERVICE: " + fen);
	    		Box.Application.broadcast('latestFen', fen);
	    	})
	    }

	    var takeBoardSetupImage = function() {
	    	return takeScreenshot(1).then(function(tempFileName) {
	    		console.log("Sending board setup request to positionAI")
	    		return positionAI.findBoardSetup(tempFileName);
	    	});
	    }

		return {
			turnOn: turnOn,
			turnOff: turnOff
		}


	});


}