var Promise = require('bluebird');

module.exports = function(Box) {

	Box.Application.addModule('capture', function(context) {
		var moduleName = 'capture'; // Save here for easier copypaste of code between modules
		console.log("INITING capture VIEW MODULE");
		var isHidden = true; // Keeps local state whether DOM element is visible or not
		var $el = $(context.getElement()); // Link to DOM element

		// Due limitations of chessboard.js we have to get outside our own DOM el.
		var chessboard = ChessBoard('chessboardWrapper', 'start');

		// Private stuff
		var deactivate = function() {
			turnCaptureOff();
			if (!isHidden) {
				isHidden = true;
				$el.hide();
			}
		}

		var activate = function() {
			// hide right away in case we are reactivating view that is currently visible
			$el.hide();
			isHidden = false;

			// Testing data fetch from disk
			var dataService = context.getService('dataService');
			var viewDataPromise = Promise.resolve();

			viewDataPromise.then(function() {
				if (isHidden) return; // User already switched to another view			

				console.warn("Capture view coming into view!");
				$('#globalLoadingBanner').hide();
				showLatestFen('???');
				ensureButtonsInInitialCondition();
				$el.show();
			});
			
		}

		var ensureButtonsInInitialCondition = function() {
			$el.find('#stopcapture').hide();
			$el.find('#startcapture').show();
		}

		var buttonsInRunningMode = function() {
			$el.find('#startcapture').hide();
			$el.find('#stopcapture').show();			
		}

		var turnCaptureOff = function() {
			var captureService = context.getService('captureService');
			captureService.turnOff();
			ensureButtonsInInitialCondition();
		}

		var turnCaptureOn = function() {
			var captureService = context.getService('captureService');
			captureService.turnOn();
			buttonsInRunningMode();
		}

		var showLatestFen = function(fen) {
			$el.find('#latestFen').empty().append(fen);
			chessboard.position(fen, false);
		}


		// Public API
		return {
			messages: ['routechanged', 'modalOpen', 'latestFen'],
			onclick: function(event, element, elementType) {
				console.log("CLICK IN capture: " + elementType);
				if (elementType === 'startcapture') {
					// Start live capture mode
					console.log("Live capture starting");
					turnCaptureOn();
				} else if (elementType === 'stopcapture') {
					turnCaptureOff();
				}
				
			},
			onmessage: function(name, data) {

				if (name === 'routechanged') {
					console.log("MSG IN capture: " + name + " | " + data.route);
					if (data.route === moduleName) {
						activate();
					} else {
						deactivate();
					}	
				} else if (name === 'latestFen') {
					showLatestFen(data);
				}		
				
			}


		};

	});

}