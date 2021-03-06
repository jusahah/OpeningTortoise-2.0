/*
*
* DEPS AND STUFF
*/
import { app, Menu, BrowserWindow } from 'electron';
import { devMenuTemplate } from './helpers/dev_menu_template';
import { editMenuTemplate } from './helpers/edit_menu_template';
import createWindow from './helpers/window';


// Special module holding environment variables which you declared
// in config/env_xxx.json file.
import env from './env';

var ipcMain = require('electron').ipcMain;
var uuid    = require('node-uuid');
var Promise = require('bluebird');

var processPGNs = require('./external_process_services/processPGNs')

var threads = require('threads');
var config  = threads.config;
var spawn   = threads.spawn;

config.set({
  basepath : {
    browser : 'http://myserver.local/thread-scripts',
    node    : __dirname + '/external_process_services'
  }
});



/////////////////////////////////////////////////////////////////////////////////////

/*
* ELECTRON-SPECIFIC INITIALIZATION STUFF
*
*/

var mainWindow;
var setApplicationMenu = function () {
    var menus = [editMenuTemplate];
    if (env.name !== 'production') {
        menus.push(devMenuTemplate);
    }
    Menu.setApplicationMenu(Menu.buildFromTemplate(menus));
};

app.on('ready', function () {
    setApplicationMenu();

    var mainWindow = createWindow('main', {
        width: 1000,
        height: 680
    });

    mainWindow.loadURL('file://' + __dirname + '/index.html');

    if (env.name !== 'production') {
        mainWindow.openDevTools();
    }

});

app.on('window-all-closed', function () {
    app.quit();
});



/////////////////////////////////////////////////////////////////////////////////////

/*
*
* INTER-PROCESS MESSAGE COMMUNICATION STUFF 
*/

var msgListenerFunction = require('./ipcWrapper')

// Registering handling functions for different messages!
// Note that each must return Promise!
msgListenerFunction('test', function(incData) {
    return Promise.resolve(incData + 1);
});


msgListenerFunction('pgnParsingNeeded', function(pgnData) {
    // Parsing is done on separate thread provided by our threads library
    console.log("processPGNs below");
    console.log(processPGNs);

    return new Promise(function(resolve, reject) {
        var thread = spawn('processPGNs');

        thread
        .send(pgnData)
        // The handlers come here: (none of them is mandatory) 
        .on('message', function(response) {
            resolve(response);
            thread.kill();
        })
        .on('error', function(error) {
            reject(error);
            console.error('Worker errored:', error);
            thread.kill();
        })
        .on('exit', function() {
            console.log('Worker has been terminated.');
        }); 
    });
 

    
});





