var _ = require('lodash');

module.exports = function(Box) {

	Box.Application.addModule('errors', function(context) {
		console.log("INITING ERRORS VIEW MODULE");
		var $el = $(context.getElement());
		var defaultRow = $el.find('#defaultBottomRow');
		var alertRow   = $el.find('#alertBottomRow');

		var showTimer;

		var DURATION = 6000;

		var currAlertCounter = 1;
		var historyArr = [];



		// Private stuff

		var showNotification = function(data) {

			console.error("SHOW NOTIFICATION RUN");

			var notif = alertRow.find('#aikavahti_notification');

			if (data && typeof(data) === 'object') {
				notif.removeClass('alert-success alert-warning alert-info alert-danger').addClass('alert-' + data.type);
				notif.empty().append(data.msg);
				historyArr.push({type: data.type, msg: data.msg, t: Date.now()});
			} else {
				// It is error
				notif.removeClass('alert-success alert-warning alert-info').addClass('alert-danger');
				notif.empty().append(data);
				historyArr.push({type: 'danger', msg: data, t: Date.now()});
			}
			
			//defaultRow.hide();
			alertRow.show();
			
			// Do some css dancing
			notif.addClass('animated').addClass('bounceIn');

			if (showTimer) {
				clearTimeout(showTimer);
			}

			showTimer = setTimeout(backToNormal, DURATION);
		}

		var backToNormal = function() {
			alertRow.find('#aikavahti_notification').removeClass('animated').removeClass('bounceIn');
			alertRow.hide();
			showTimer = null;
		}

		var populateHistoryModal = function() {
			var historyArea = $el.find('#notificationhistory_area');
			var html = '';
			_.forEachRight(historyArr, function(notification) {
				html += '<div class="alert alert-block alert-' + notification.type + '">';
				html += '<span style="font-size: 11px;">' + moment(notification.t).format('HH:mm:ss') + '</span>';
				html += '<p>' + notification.msg + '</p>';
				html += '</div>';
			});
			historyArea.empty().append(html);
		}


		

		// Public API
		return {

			messages: ['notificationTriggered', 'statsUpdated'],

			onclick: function(event, element, elementType) {
				if (elementType === 'notificationHistory') {
					populateHistoryModal();
				}
			},

			onmessage: function(name, data) {

				if (name === 'notificationTriggered') {
					showNotification(data);
				} else if (name === 'statsUpdated') {
					$el.find('#aikavahti_statstime').empty().append(moment().format('HH:mm:ss'));
				}
			}

		}

	});

}
