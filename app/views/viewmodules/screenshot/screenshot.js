module.exports = function(Box) {

	Box.Application.addModule('screenshot', function(context) {
		var moduleName = 'screenshot'; // Save here for easier copypaste of code between modules
		console.log("INITING SCREENSHOT VIEW MODULE");
		var isHidden = true; // Keeps local state whether DOM element is visible or not
		var $el = $(context.getElement()); // Link to DOM element

		// Private stuff
		var deactivate = function() {
			if (!isHidden) {
				isHidden = true;
				$el.hide();
			}
		}

		var activate = function() {
			// hide right away in case we are reactivating view that is currently visible
			$el.hide();
			isHidden = false;

			var viewDataPromise = Promise.resolve();

			viewDataPromise.then(function(viewData) {
				if (isHidden) return; // User already switched to another view			

				//viewDataCached = viewData;

				//var dataObj = context.getService('derivedData').easify(viewData);			
				// viewData is always object with transforNames being keys and data being values
				console.warn("Screenshot coming into view!");
				$('#globalLoadingBanner').hide();
				//$el.find('#signalstable_body').empty().append(buildHTML(viewData.signalsTable));
				//$el.empty().append("<h3>" + JSON.stringify(viewData) + "</h3>");
				$el.show();
			});
			
		}

		var takeScreenshot = function() {
			// Taking screenshot is pretty complex so this
			// poor view module just assumes there is a service for that
			var screenshotService = context.getService('screenshotService');
			screenshotService.take();
		}

		var screenshotHasBeenSavedToTemp = function(tempFile) {
			console.log("Screenshot saved received in screenshot view module: " + tempFile);

		}
		

		// Public API
		return {
			messages: ['routechanged'],
			onclick: function(event, element, elementType) {
				console.log("CLICK IN SCREENSHOT: " + elementType);

				if (elementType === 'takescreenshot') {
					takeScreenshot();
				}


			},
			onmessage: function(name, data) {
				console.log("MSG IN SCREENSHOT: " + name + " | " + data.route);
				if (name === 'routechanged') {
					if (data.route === moduleName) {
						activate();
					} else {
						deactivate();
					}						
				} else if (name === 'screenshotready') {
					screenshotHasBeenSavedToTemp(data.tempFile);
				}
			
				
			}


		};

	});

}