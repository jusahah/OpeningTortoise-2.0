module.exports = function(Box) {

	Box.Application.addModule('pgnupload', function(context) {
		var moduleName = 'pgnupload'; // Save here for easier copypaste of code between modules
		console.log("INITING pgnupload VIEW MODULE");
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

			// Testing data fetch from disk
			var dataService = context.getService('dataService');
			var viewDataPromise = dataService.needCount();

			viewDataPromise.then(function(numberOfPositions) {
				console.warn("NUM OF POS: " + numberOfPositions);
				if (isHidden) return; // User already switched to another view			

				console.warn("Text note coming into view!");
				$el.find('#positioncount').empty().append(numberOfPositions);
				$('#globalLoadingBanner').hide();
				$el.show();
			});
			
		}

		var uploadGames = function() {
			// In real version get the file from the input element
			var inputService = context.getService('inputService');

			inputService.pgnsUpload('a b c d e').then(function() {
				console.warn("Games uploaded to system!");
			});

		}
		

		// Public API
		return {
			messages: ['routechanged'],
			onclick: function(event, element, elementType) {
				console.log("CLICK IN pgnupload: " + elementType);

				if (elementType === 'uploadgames') {
					uploadGames();
				}
			},
			onmessage: function(name, data) {
				console.log("MSG IN pgnupload: " + name + " | " + data.route);
				if (data.route === moduleName) {
					activate();
				} else {
					deactivate();
				}				
				
			}


		};

	});

}