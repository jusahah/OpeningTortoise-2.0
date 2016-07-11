// Here is the starting point for your application code.
// All stuff below is just to show you how it works. You can delete all of it.

// Use new ES6 modules syntax for everything.
import os from 'os'; // native node.js module
import { remote } from 'electron'; // native electron module
import jetpack from 'fs-jetpack'; // module loaded from npm
import { greet } from './hello_world/hello_world'; // code authored by you in this project
import env from './env';

console.log('Loaded environment variables:', env);

var app = remote.app;
var appDir = jetpack.cwd(app.getAppPath());

/////////////////////////////////////////////////////////////////////////////////////

/*
*
* DATABASE GATEWAY
* All data fetch/insert actions go through dataAPI
* 
*/
var dataAPI = require('./dataLayer/entry')(app.getAppPath() + "/teststore"); // Opens db sync!
dataAPI.runSeed(4); // Only for testing



// SERVICES REGISTRATION
// Args: Box, path_to_the_temporary_file_folder
// CHANGE FOR PRODUCTION THE FOLDER PATH!
require('./services/util/screenshot')(Box, app.getAppPath()); // Screenshotting tool
require('./services/processCommunication')(Box); // Communication API with background process
require('./services/dataService')(Box, dataAPI); // Provides extra functions for managing data




// VIEW MODULES REGISTRATION
// Send Box in so view modules can bind themselves into it
require('./views/viewmodules/menu/menu')(Box);
require('./views/viewmodules/screenshot/screenshot')(Box);
require('./views/viewmodules/textnote/textnote')(Box);
require('./views/viewmodules/errors/errors')(Box);




// THIS ENDS THE INITIALIZATION/LOADING PHASE AND KICKS THE APPLICATION 
// TO ITS RUNTIME STATE
setTimeout(function() {
	Box.Application.init({
		debug: true
	});
	// Show the app
	$('#appScreen').show();
}, 300);



