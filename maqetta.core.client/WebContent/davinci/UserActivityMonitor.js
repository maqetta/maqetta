define([
    "require",
    "dojo/_base/xhr",
	"dojo/i18n!./nls/webContent"
], function(
	require,
	xhr,
	webContent
) {

var UserActivityMonitor = {
	/*
	 *  Sets up Maqetta to monitor interaction with the server and the workspace
	 */
	setUpInActivityMonitor: function(doc, Runtime) {
		if (Runtime.singleUserMode()) {
			this._MaxInactiveInterval = -1; // no timeout
		} else {
			this._firstPoll = true;
			this._MaxInactiveInterval = 60 * 5; // default this will be changed when we get from server
			this.keepAlive(); // get the timeout value
			this.addInActivityMonitor(doc);
			Runtime.subscribe('/dojo/io/load', this.lastServerConnection);
			this.userActivity(); // prime the value
		}
	},
	
	/*
	 *  Adds user activity monitoring for a document, that is most likely in an iframe (eg editors)
	 */
	addInActivityMonitor: function(doc) {
		if (this._MaxInactiveInterval === -1) { // no session timeout
			return []; // no monitoring
		} else {
			var connections = [
			//dojo.connect(doc.documentElement, "mousemove", this, "userActivity"),
			dojo.connect(doc.documentElement, "keydown",  this, "userActivity"),
			//dojo.connect(doc.documentElement, "DOMMouseScroll", this, "userActivity"),
			//dojo.connect(doc.documentElement, "mousewheel",  this, "userActivity"),
			dojo.connect(doc.documentElement, "mousedown",  this, "userActivity")
			];
			return connections;
		}
	},
	
	/*
	 * This method is connected to the document and is called whenever the user interacts with
	 * the document (eg mousedown, keydown...)
	 * When this method is invoked we reset the user idle timer, if the user does not interact within 
	 * the idle time, the timer will pop and we will warn the user of impending session time out
	 */
	userActivity: function(e){
		//console.log('userActivity');
		if (this.countdown) { 
			//user is about to time out so clear it
			this.resetIdle();
		}
		if (this._idleTimer){
			window.clearTimeout(this._idleTimer);
		}
		if (this._MaxInactiveInterval > 0) { // set the timer only if we have a timeout
			var t = this._MaxInactiveInterval * 1000; 
			this._idleTimer = window.setTimeout(function(){
				this.idle();
			}.bind(this), t); // make sure this happens before the server times out
		}
	},
	
	/* 
	 *  This method queries the server to find the session timeout value and also 
	 *  let the user we are still working here so don't time us out
	 */
	keepAlive: function(){
		return xhr.get({
			url: "cmd/keepalive",
			handleAs: "json"
		}).then(function(result) {
			if (result.MaxInactiveInterval) {
				this._MaxInactiveInterval = result.MaxInactiveInterval;
				if (this._firstPoll) {
					delete this._firstPoll;
					this.userActivity(null); // reset to server timeout from defaults
				}
			} else {
			    console.warn("Keep Alive: no MaxInactiveInterval. result="+result);
			}
		}.bind(this), function(error) {
			console.warn("keepalive error", error);
	    });
	},
	
	/*
	 * this method is subscribed to /dojo/io/load and will be invoked whenever we have successful
	 * io with the server. When the method is invoked we will reset the server poll timer to 80%
	 * of the server session timeout value. if the timer pop's we will call keepAlive to let the server 
	 * know we are still working
	 */
	lastServerConnection: function(deferred, result) {
		if (this._serverPollTimer){
			window.clearTimeout(this._serverPollTimer);
		}
		if (this._MaxInactiveInterval > 0) { // set the timer only if we have a timeout
			var t = this._MaxInactiveInterval * 1000 * .8;  // take 80 %
			this._serverPollTimer = window.setTimeout(function(){
				this.keepAlive();
			}.bind(this), t); // _MaxInactiveInterval is in seconds so poll 30 seconds early
		}
	},
	
	/*
	 * This method is invoked when the user idle timer pops. We will display a warning to the user 
	 * that the session is about to time out and give them a 30 second countdown. If the user clicks on 
	 * the document resetIdle is triggered which cancels the countdown.
	 */
	idle: function(){
		var counter = 30;
		var warnDiv = this.warnDiv = dojo.create('div', {
			'class': "idleWarning",
			innerHTML: dojo.string.substitute(webContent.idleSessionMessage, {seconds: counter})
		}, dojo.byId('davinci_app'), "first");

		this.countdown = window.setInterval(function(){
			if(--counter === 0){
				window.clearInterval(this.countdown);
				delete this.countdown;
				require("davinci/Workbench").logoff().otherwise(function(result) {
					//TODO: tear down warnDiv and post failure message
				});
			} else {
				warnDiv.innerHTML = dojo.string.substitute(webContent.idleSessionMessage, {seconds: counter});
			}
		}.bind(this), 1000);
	},

	/*
	 * This method removes the session timeout message and calls userActivity 
	 */
	resetIdle: function(e){
		window.clearInterval(this.countdown);
		delete this.countdown;
		this.warnDiv.parentNode.removeChild(this.warnDiv);
		delete this.warnDiv;
		this.userActivity();
	}
};

return UserActivityMonitor;
});
