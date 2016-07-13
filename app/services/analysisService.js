var _ = require('lodash');
var Promise = require('bluebird');
var uuid = require('node-uuid');

module.exports = function(Box, analysisController) {
	Box.Application.addService('analysisService', function(application) {

		var resumeAnalysis = function() {
			console.log("ANALYSIS RESUME REQUEST IN ANALYSIS SERVICE");
			analysisController.resumeAnalysing();
		}

		return {
			resumeAnalysis: resumeAnalysis
		}


	});


}