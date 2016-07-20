var _ = require('lodash');
var Promise = require('bluebird');
var uuid = require('node-uuid');
var shell = require("shelljs");
var shellglobal = require('shelljs/global');

var gameTrackingCreator = require('./gameTracking');

module.exports = function(Box, positionAI) {
	Box.Application.addService('captureService', function(application) {

		var currentlyTakingScreenshot = false;
		var captureInterval = null;

		var gameTracker = null;

		var turnOn = function() {
			/*
			if (currentlyTakingScreenshot) return Promise.reject('Screen capture in progress');
			if (captureInterval) return Promise.reject('Capture interval already exists');

			captureInterval = setInterval(function() {
				takeScreenshot(1).then(sendToAnalysis);
			}, 8000);
			*/
			console.log("Setting test timeouts for calling positionAI API");

			if (captureInterval) return;

			captureInterval = 1; // Mark capturing started although not yet started

			gameTracker = gameTrackingCreator();
			setTimeout(takeBoardSetupImage, 2000);
						



		}

		var turnOff = function() {
			// Clear the interval timer
			if (captureInterval && captureInterval !== 1) {
				clearInterval(captureInterval);
				captureInterval = null;
				console.log("Capture interval killed");
			}

			gameTracker = null;
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
	    		// See if it matches some of the possible next fens
	    		var moves = gameTracker.newFen(fen);
	    		if (moves) {
	    			// Fen was accepted by gameTracker
	    			Box.Application.broadcast('newMoves', moves);
	    			Box.Application.broadcast('latestFen', fen);
	    		}
	    		
	    	})
	    }

	    var takeBoardSetupImage = function() {
	    	return takeScreenshot(1).then(function(tempFileName) {
	    		console.log("Sending board setup request to positionAI")
	    		captureInterval = setInterval(function() {
					takeScreenshot(0).then(sendToAnalysis);
				}, 1200);
	    		return positionAI.findBoardSetup(tempFileName);
	    	});
	    }

		return {
			turnOn: turnOn,
			turnOff: turnOff
		}


	});


}