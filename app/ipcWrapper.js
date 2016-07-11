/*
*
*    THIS IPC WRAPPER TAKES AUTO-CARE OF ALL IPC MESSAGING
*    IT WRAPS MSG ID-BASED REQUEST/RESPONSE INTERFACE AND
*    AUTOMATICALLY REMEMBERS WHICH RENDERER SENT WHICH MSG
*
*    THUS IN YOUR RENDERER YOU CAN DO SOMETHING LIKE THIS AND EXPECT TO WORK:
*
*     
      sendMsgToMain({
         msgID: uniqueMsgID,
         eventname: 'needLove',
         arg: {amount: 'a lot'}
      }).then(function(response) {
         // Handle eventual response
      }).catch(function(errorResponse) {
         // Handle errors
      });
*/

var ipcMain = require('electron').ipcMain;
var uuid    = require('node-uuid');
var Promise = require('bluebird');

// Saves the info about which process sent the msg in
var msgIdsToRenderers = {};
var eventsToHandlingFunctions = {};

module.exports = function(eventname, functionReturningResultProm) {

    eventsToHandlingFunctions[eventname] = functionReturningResultProm;

};

ipcMain.on('msg', function(event, arg) {

    console.log("MSG IN!");
    console.log(JSON.stringify(arg));

    // Check if event handler exists
    if (!eventsToHandlingFunctions[arg.eventname]) {
        throw "No main process handler for ipc event: " + arg.eventname;
    }

    var msgID = arg.msgID; // We need this to send response back
    console.log("MSG ID IS: " + msgID);
    if (msgID) {
        // Save sending window to renderers map so we can use
        // msgID later to send msg back
        console.log("Setting msg back channel for renderer: " + arg.msgID);
        msgIdsToRenderers[msgID] = event.sender;
    } else {
        throw 'Msg id missing from ipc message!';
    }

    // Everything fine, can handle the message!
    // Note that all handlers must return promise!
    var functionReturningResultProm = eventsToHandlingFunctions[arg.eventname];

    functionReturningResultProm(arg.data)
    .then(function(results) {
        sendBack(true, msgID, results);
    })
    .catch(function(err) {
        sendBack(false, msgID, err);
    });

    
});

function sendBack(success, msgID, msgContent) {
    if (!msgIdsToRenderers[msgID]) {
        throw "Trying to send back msg -> renderer but no renderer present: " + msgID;
    }

    var renderer = msgIdsToRenderers[msgID];

    console.log("SENDING BACK TO RENDERER");
    console.log(msgContent);
    console.log(msgID);
    renderer.send('msg', {
        msgID: msgID,
        success: success,
        data: msgContent
    });

    garbageCollectRenderer(msgID);
}

// Purges obsolete process refs from msgIdsToRenderers
function garbageCollectRenderer(msgID) {
    if (!msgIdsToRenderers.hasOwnProperty(msgID)) return;
    msgIdsToRenderers[msgID] = null;
    delete msgIdsToRenderers[msgID];
}
