var shell = require("shelljs");
var shellglobal = require('shelljs/global');
var uuid = require('node-uuid');
var fs = require('fs');

module.exports = function(Box, tempFolder) {
	Box.Application.addService('screenshotService', function(application) {

		var currentlyTakingScreenshot = false;

	    // private methods here

	    var take = function() {
	        console.log("Screenshot requested in T3 service!");
	        if (currentlyTakingScreenshot) return;
			console.log("Taking screenshot");
			currentlyTakingScreenshot = true;

			// Generate unique identifier from temp file name 
			var tempFileName = uuid.v1();

		    shell.exec("gnome-screenshot -a -f " + tempFolder + "/" + tempFileName + ".jpg", function(){
		    	currentlyTakingScreenshot = false;
		    	console.log("Screenshot saved to temp file: " + tempFolder + "/" + tempFileName + ".jpg");
		    	Box.Application.broadcast('screenshotready', {tempFile: tempFileName});
		    });






	        	
	    }

	    return {

	        take: take

	    };
	});


}

