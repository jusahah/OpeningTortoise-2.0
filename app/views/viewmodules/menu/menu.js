// Valikko module
// This is special view module in that its always visible and it controls other modules
// It also governs most of the always-visible stuff on the site

module.exports = function(Box) {
	Box.Application.addModule('valikko', function(context) {

		var current;
		var $el = $(context.getElement());
		var dataNeeded = ['frontViewData']; // empty means that this view can always render instantly (no need to wait on data)
			// Private stuff

		var currentNow = null;
		var $currentPanelWrapper = $el.find('#frontshowpanel');	

		var pendingGamesAmountChanged = function(newAmount) {
			$el.find('#pendinggamesamount').empty().append(newAmount);
		}

		var updatePositionsInDBCount = function(newCount) {
			console.log("MENU: Update position count: " + newCount);
		}

		var enginesRunningAmountChanged = function(isRunning) {
			// Handle differently if zero (turn red or something)
			$el.find('#enginesrunningamount').empty().append(isRunning ? 'running' : 'idle');
		}

		var reshowCurrentView = function() {
			if (current) {
				Box.Application.broadcast('routechanged', {route: current, payload: null});
				$('#globalLoadingBanner').show();
			}
			// Ask for own data
			var derivedService  = context.getService('derivedData');
			var viewDataPromise = derivedService.getDeriveds(dataNeeded);

			viewDataPromise.then(function(viewData) {

					bindToView(viewData.frontViewData);
					loopTimer();
			});		
		}

		var bindToView = function(frontViewData) {
			currentNow = frontViewData.current;
			var color = currentNow.color || '554455';
			color = color.charAt(0) === '#' ? color.substr(1) : color;
			var textcolor = tinycolor(color).isDark() ? 'fff' : '222';
			$currentPanelWrapper.find('#currentactivityfrontname').empty().append(currentNow.name);
			$currentPanelWrapper.find('#currentactivityfrontname').css('color', '#' + textcolor);
			$currentPanelWrapper.find('#currentactivityfront_duration').css('color', '#' + textcolor);
			$currentPanelWrapper.css('background-color', '#' + color);

		}

		var updateProgressBar = function(percentageDone) {

			if (percentageDone !== 100) {
				computationText.empty().append('Tilastoja lasketaan...');
				computeProgressBar.parent().addClass('active');
			} else {

				computationText.empty().append('Tilastot valmiina!');
				computeProgressBar.parent().removeClass('active');
				Box.Application.broadcast('statsUpdated');
			}
			computeProgressBar.css('width', percentageDone + "%");
			computeProgressBar.empty().append(percentageDone + "%");
		}

		var updateFrontShow = function(data) {

			if (_.isEqual(data, lastCurrentShowData)) {
				return;
			}

			lastCurrentShowData = Object.assign({}, data);
			// Maybe check against local copy so no unnecessary DOM hit
			// Although its pretty insignificant anyway
			var panel = $el.find('#frontshowpanel');
			panel.find('#currentactivityfrontname').empty().append(data.name);
			panel.find('#currentactivityfronttime').empty().append(data.timeString);
			
		}

		var handleRouteChange = function(element, elementType, payload, firstEver) {
			// Broadcast event which makes appropriate view module wake up
			Box.Application.broadcast('routechanged', {route: elementType, payload: payload});
			// Set new module as current
			current = elementType;
			// Update menu highlighting
			$el.find('#aikavahti_mainmenu').find('li').removeClass('active');
			if (element) {
				var linkEl = $(element);
				linkEl.addClass('active');			
			}

			// Start loading banner
			// View itself is responsible of hiding it when its ready!
			// This makes sense as view knows best when it is ready

			// Hide it first
			$('#globalErrorBanner').hide();
			// ..only show it if this is the firstEver time view is loaded
			if (!firstEver) $('#globalLoadingBanner').show();		
		}

		var shutDownRequest = function() {
			// Send shutdown request to background
			// Make one last save
			var adminService = context.getService('adminService');

			adminService.forceSave().then(function() {
				$el.find('#quitWithSave').click();
				Box.Application.stopAll(document);
				setTimeout(function() {
					ipcRenderer.send('appShutDown');
				}, 900);
				
			}).catch(function(err) {
				$el.find('#quitNoSave').click();
			});

		} 

		var forceShutDown = function() {
			// Not asking again...
			Box.Application.stopAll(document);
			ipcRenderer.send('appShutDown');
		}




		//
		// Analysis stuff
		//
		var sendAnalysisResumeRequest = function() {
			var analysisService = context.getService('analysisService');
			analysisService.resumeAnalysis();
		}

		console.log("INITING VALIKKO VIEW MODULE");
		return {
			messages: [
			'currenteventupdate', 
			'initFirstView', 
			'forceQuitAfterSaveFailure',
			'pendingGamesUpdate',
			'enginesRunningUpdate',
			'positionsInDBUpdate'
			],
			onclick: function(event, element, elementType) {
				var actionType = elementType.split('-')[1];
				if (actionType === 'route') {
					var moduleName = elementType.split('-')[0]; // what module to activate
					console.log("Route changing link clicked: " + elementType);
					var payload = $(element).data('payload'); // Additional data to send to module
					// Changing a route
					handleRouteChange(element, moduleName, payload);

				} else if (actionType === 'action') {
					var action = elementType.split('-')[0];
					if (action === 'analyze') {
						return sendAnalysisResumeRequest();
					}
				} else if (actionType === 'modal') {
					return Box.Application.broadcast('modalOpen', elementType.split('-')[0]);
				}

				
			},
			onmessage: function(name, data) {
				// Handles msgs regarding games to be analyzed either inc or dec.
				if (name === 'pendingGamesUpdate') {
					return pendingGamesAmountChanged(data);
				}

				if (name === 'enginesRunningUpdate') {
					return enginesRunningAmountChanged(data);
				}

				if (name === 'positionsInDBUpdate') {
					return updatePositionsInDBCount(data);
				}

				/*
				if (name === 'cachewasflushed') {
					reshowCurrentView();
				} else if (name === 'computationprogressupdate') {
					updateProgressBar(data);
				} else if (name === 'newacticity_showall') {
					var ss = context.getService('settingsService');
				} else if (name === 'currenteventupdate') {
					updateFrontShow(data);
				} else if (name === 'initFirstView') {
					context.getService('derivedData').forceDataRecomputation();
					handleRouteChange(null, 'front-route', null, true);
				} else if (name === 'forceQuitAfterSaveFailure') {
					forceShutDown();
				}
				*/

			}


		};

	});	

}