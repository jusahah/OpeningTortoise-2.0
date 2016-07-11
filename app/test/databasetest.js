// Note to self:
// Test file like this is run by calling 'mocha' on app directory!
// Mocha automatically locates 'test' directory and runs its files!

var fs = require('fs');
var _ = require('lodash');

// Purge old database first through back-door (straight from file system)
try {
	var file = fs.readFileSync('testdb');
	fs.unlinkSync('testdb');
} catch (err) {
	console.log("No file yet");
}

var dataAPI = require('../dataLayer/entry')('testdb');
var assert = require('chai').assert;

function buildTestWorld() {
	return dataAPI.getList()
	.timeout(250) // Should be unnecessary as db initialized using sync calls
	.then(function() {
	    return dataAPI.positionOccurred('abceuuu');
	})
	.then(function() {
	    return dataAPI.positionOccurred('abce');
	})
	.then(function() {
	    return dataAPI.positionWasTrained('abchhh', true);
	})
	.then(function() {
	    return dataAPI.positionWasTrained('abce', false);
	})
	.then(function() {
	    return dataAPI.positionWasTrained('abce', false);
	})
	.then(function() {
	    return dataAPI.positionWasTrained('abce', true);
	})
	.then(function() {
	    return dataAPI.positionWasTrained('abcekrslksr', false); // Wrong pos
	})
	.then(function() {
	    return dataAPI.positionWasTrained('abce', true);
	})
	.then(function() {
	    return dataAPI.positionOccurred('abce');
	})
}


var buildProm = buildTestWorld();
runTests(buildProm); // Start registering test cases. Each test is run async.


function runTests(worldReady) {
	describe('Positions test', function() {

		it('abchhh should not exist', function(done) {
			// As our test is async we need to use 'done' callback
			// Note that asserts throw sync and thus lead to issue of 'done' never
			// being called for the 'it' that threw up.

			// Not a big issue though, lets refactor like never.
	      worldReady.then(function() {
	      	dataAPI.getPosition('acbhhh').then(function(position) {
	      		if (position) throw "Position abchhh should not exists!";
	      		done();
	      	})
	      });
	    });

		it('abce should have three occurs + four trainings', function(done) {
	      worldReady.then(function() {
	      	dataAPI.getPosition('abce').then(function(position) {
		      assert.equal(2, position.occurs.length);
	      	  assert.equal(4, position.trainings.length)
		      done();
	      	})
	      });
	    });

		it('abceuuu should have 1 occur + 0 trainings', function(done) {
	      worldReady.then(function() {
	      	dataAPI.getPosition('abceuuu').then(function(position) {
		      assert.equal(1, position.occurs.length);
	      	  assert.equal(false, !!position.trainings && position.trainings.length > 0)
		      done();
	      	})
	      });
	    });	

		it('total num of positions should be 2', function(done) {
	      worldReady.then(function() {
	      	dataAPI.getList().then(function(positions) {
		      assert.equal(2, positions.length);
		      done();
	      	})
	      });
	    });	

		it('abce should have success pattern f,f,t,t', function(done) {
	      worldReady.then(function() {
	      	dataAPI.getPosition('abce').then(function(position) {
	      	  var pattern = _.map(position.trainings, function(training) {
	      	  	return training.res;
	      	  });
		      assert.deepEqual(
		      	[false, false, true, true],
		      	pattern
		      )
		      done();
	      	})
	      });
	    });		    	        
	});


}
