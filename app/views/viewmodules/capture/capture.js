var Promise = require('bluebird');

module.exports = function(Box) {

	Box.Application.addModule('capture', function(context) {
		var moduleName = 'capture'; // Save here for easier copypaste of code between modules
		console.log("INITING capture VIEW MODULE");
		var isHidden = true; // Keeps local state whether DOM element is visible or not
		var $el = $(context.getElement()); // Link to DOM element

		// Private stuff
		var deactivate = function() {
			ensureCaptureOff();
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
				$el.show();
			});
			
		}

		var ensureCaptureOff = function() {
			var captureService = context.getService('captureService');
			captureService.turnOff();
		}

		var turnCaptureOn = function() {
			var captureService = context.getService('captureService');
			captureService.turnOn();
		}

		var showLatestFen = function(fen) {
			$el.find('#latestFen').empty().append(fen);
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