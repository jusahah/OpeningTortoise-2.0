module.exports = function(Box) {

	Box.Application.addModule('textnote', function(context) {
		var moduleName = 'textnote'; // Save here for easier copypaste of code between modules
		console.log("INITING TEXTNOTE VIEW MODULE");
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

			// Testing ipc (rendener -> main -> back)
			// ALL IPC COMMUNICATION IS OF FORM: 
			// {eventname: String, data: {...}}
			var ipc = context.getService('processCommunication');
			ipc.sendToBackgroundProcess({eventname: 'test', data: 1})
			.then(function(incNumber) {
				console.log("Response for ipc: " + incNumber);
			})
			.catch(function(err) {
				console.error("IPC went wrong");
				console.log(err);
			});

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
			}).then(function() {
				return dataService.getTrainingSet(3, 'random');
			}).then(function(trainingSet) {
				console.warn("TRAINING SET RETURNED");
				console.log(trainingSet);
			}).then(function() {
				return dataService.getCombinedTrainingSet([
					{size: 2, includeOnly: 'random'},
					{size: 3, includeOnly: 'topXLatest'},
				]);
			}).then(function(trainingSet) {
				console.warn("COMBINED TRAINING SET");
				console.log(trainingSet);
			});
			
		}
		

		// Public API
		return {
			messages: ['routechanged'],
			onclick: function(event, element, elementType) {
				console.log("CLICK IN TEXTNOTE: " + elementType);


			},
			onmessage: function(name, data) {
				console.log("MSG IN TEXTNOTE: " + name + " | " + data.route);
				if (data.route === moduleName) {
					activate();
				} else {
					deactivate();
				}				
				
			}


		};

	});

}