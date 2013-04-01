define([
    "require",
    "dojo/_base/xhr",
    "dojo/request",
    "dojo/request/notify",
	"dojo/i18n!./nls/webContent"
], function(
	require,
	xhr,
	request,
	notify,
	webContent
) {

//FIXME: define interval in getInitializationInfo? preferences? Hard-code value, for now.
var maxInactiveInterval = 5 * 60 * 1000,
	connections = [],
	countdown,
	warnDiv;

/*
 *  Sets up Maqetta to monitor interaction with the server and the workspace
 */
var UserActivityMonitor = {
	setUpInActivityMonitor: function(doc, Runtime) {
		if (!Runtime.singleUserMode()) {
			connections = UserActivityMonitor.addInActivityMonitor(doc);
			Runtime.subscribe('/dojo/io/load', UserActivityMonitor.lastServerConnection); // topic is deprecated
			notify("load", UserActivityMonitor.lastServerConnection);

			UserActivityMonitor.lastActivity = Date.now();

			UserActivityMonitor.heartbeat = window.setInterval(function(){
				if (!countdown && Date.now() - UserActivityMonitor.lastActivity > maxInactiveInterval) {
					UserActivityMonitor.idle();
				}
			}, 1000);
		}
	},
	
	/*
	 *  Adds user activity monitoring for a document, that is most likely in an iframe (eg editors)
	 */
	addInActivityMonitor: function(doc) {
		return [
			//dojo.connect(doc.documentElement, "mousemove", UserActivityMonitor, "userActivity"),
			dojo.connect(doc.documentElement, "keydown",  UserActivityMonitor, "userActivity"),
			//dojo.connect(doc.documentElement, "DOMMouseScroll", UserActivityMonitor, "userActivity"),
			//dojo.connect(doc.documentElement, "mousewheel",  UserActivityMonitor, "userActivity"),
			dojo.connect(doc.documentElement, "mousedown",  UserActivityMonitor, "userActivity")
		];
	},
	
	/*
	 * This method is connected to the document and is called whenever the user interacts with
	 * the document (eg mousedown, keydown...)
	 * When this method is invoked we reset the user idle timer, if the user does not interact within 
	 * the idle time, the timer will pop and we will warn the user of impending session time out
	 */
	userActivity: function(e){
		//console.log('userActivity');
		if (countdown) { 
			//user is about to time out so clear it
			UserActivityMonitor.resetIdle();
		}
		UserActivityMonitor.lastActivity = Date.now();
	},
	
	/*
	 * this method is subscribed to /dojo/io/load and will be invoked whenever we have successful
	 * io with the server. When the method is invoked we will reset the server poll timer to 80%
	 * of the server session timeout value. if the timer pops we will call keepAlive to let the server 
	 * know we are still working
	 */
	lastServerConnection: function(deferred, result) {
		if (UserActivityMonitor._serverPollTimer){
			window.clearTimeout(UserActivityMonitor._serverPollTimer);
		}
		if (maxInactiveInterval > 0) { // set the timer only if we have a timeout
			UserActivityMonitor._serverPollTimer = window.setTimeout(function(){
				request("cmd/keepalive");
			}, maxInactiveInterval * .8); // maxInactiveInterval is in seconds so poll 30 seconds early
		}
	},
	
	/*
	 * This method is invoked when the user idle timer pops. We will display a warning to the user 
	 * that the session is about to time out and give them a 30 second countdown. If the user clicks on 
	 * the document resetIdle is triggered which cancels the countdown.
	 */
	idle: function(){
		var counter = 30;
		warnDiv = dojo.create('div', {
			'class': "idleWarning",
			innerHTML: dojo.string.substitute(webContent.idleSessionMessage, {seconds: counter})
		}, dojo.byId('davinci_app'), "first");

		countdown = window.setInterval(function(){
			if(--counter === 0){
				window.clearInterval(countdown);
				countdown = null;
				require("davinci/Workbench").logoff().otherwise(function(result) {
					//TODO: tear down warnDiv and post failure message
				});
			} else {
				warnDiv.innerHTML = dojo.string.substitute(webContent.idleSessionMessage, {seconds: counter});
			}
		}, 1000);
	},

	/*
	 * This method removes the session timeout message and calls userActivity 
	 */
	resetIdle: function(e){
		window.clearInterval(countdown);
		countdown = null;
		warnDiv.parentNode.removeChild(warnDiv);
		warnDiv = null;
		UserActivityMonitor.userActivity();
	}
};

return UserActivityMonitor;
});
