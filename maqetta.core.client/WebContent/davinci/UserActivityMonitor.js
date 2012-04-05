define([
	"dojo/i18n!./nls/webContent"
], function(
	webContent
) {

var UserActivityMonitor = {
	subscriptions: [],
		
	subscribe: function(topic,func) {
		this.subscriptions.push(dojo.subscribe(topic,this,func));
	},
	
	destroy: function() {
		dojo.forEach(this.subscriptions, dojo.unsubscribe);
	},
	
	
	/*
	 *  Sets up Maqetta to monitor interaction with the server and the workspace
	 */
	setUpInActivityMonitor: function() {
		if (!this._runtime){
			// we need to wait to add runtime to avoid chicken or egg
			try{
				this._runtime = dojo.require("davinci/Runtime");
	       }catch(e){
	            console.warn("FAILED: failure for loading davinci/Runtime");
	            return;
	       }
		} 
		if (this._runtime.singleUserMode()) {
			this._MaxInactiveInterval = -1; // no timeout
		} else {
			this._MaxInactiveInterval = 60; // defalt this will be changed when we get from server
			this.keepAlive(); // get the timeout value
			this.addInActivityMonitor(dojo.doc);
			this.subscribe('/dojo/io/load', this.lastServerConnection);
			this.userActivity(); // prime the value
		}
		
	},
	
	/*
	 *  Adds user activity monitoring for a document, that is most likly in an iframe (eg editors)
	 */
	addInActivityMonitor: function(doc) {
		if (this._MaxInactiveInterval === -1) { // no session timeout
			return []; // no montioring
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
			var t = (this._MaxInactiveInterval * 1000); 
			this._idleTimer = window.setTimeout(function(){
				this.idle();
			}.bind(this), t); // make sure this happends before the server timesout
		}

	},
	
	/* 
	 *  This method quereis the server to find the seesion timeout value and also 
	 *  let the user we are still working here so don't time us out
	 */
	keepAlive: function(){
		var deferred = dojo.xhrGet({
			url: "cmd/keepalive",
			sync: false,
			handleAs: "json",
		});
		deferred.then(function(result) {
			if (result.MaxInactiveInterval) {
				this._MaxInactiveInterval = result.MaxInactiveInterval;
			} else {
			    console.warn("Unknown error: result="+result);
			}
		    }.bind(this), function(error) {
		    	console.warn("MaxInactiveInterval error", error);
	    });
	},
	
	/*
	 * this method is subscribed to /dojo/io/load and will be invoked whenever we have succesfull
	 * io with the server. When ths method is invoked we will reset the server poll timer to 80%
	 * of the server session timeout value. if the timer pop's we will call keepAlive to let the server 
	 * know we are still working
	 */
	lastServerConnection: function(deferred, result) {
		if (this._serverPollTimer){
			window.clearTimeout(this._serverPollTimer);
		}
		if (this._MaxInactiveInterval > 0) { // set the timer only if we have a timeout
			t =  ((this._MaxInactiveInterval  * 1000) * .8);  // take 80 %
			this._serverPollTimer = window.setTimeout(function(){
				this.keepAlive();
			}.bind(this), t); // _MaxInactiveInterval is in seconds so poll 30 seconds early
		}
		
	},
	
	/*
	 * This method is invoked when the user idle timer pops. We will display a warning to the user 
	 * that the session is bout to time out and give them a 30 second countdown. If the user clicks on 
	 * the document idleRest is involed
	 */
	idle: function(){
		var counter = 30;
		var app = dojo.byId('davinci_app');
		var warnDiv = dojo.doc.createElement('div');
		warnDiv.id = 'org.maqetta.idleWarning';
		app.appendChild(warnDiv);
		warnDiv.setAttribute("class","idleWarning");
		warnDiv.innerHTML = dojo.string.substitute(webContent.idleSessionMessage, {seconds: counter});
		this.countdown = window.setInterval(function(){
			if(--counter === 0){
				window.clearInterval(this.countdown);
				delete this.countdown;
				this._runtime.logoff();
			} else {
				var span = dojo.byId('org.maqetta.idleWarning');
				span.innerHTML = dojo.string.substitute(webContent.idleSessionMessage, {seconds: counter});
				
			}
		}.bind(this), 1000);
	},
	
	/*
	 * This method removes the session timeout message and calls userActivity 
	 */
	resetIdle: function(e){
		window.clearInterval(this.countdown);
		delete this.countdown;
		var warning = dojo.byId('org.maqetta.idleWarning');
		warning.parentNode.removeChild(warning);
		this.userActivity();
	}
	
};

davinci.UserActivityMonitor = UserActivityMonitor; 
return UserActivityMonitor;
});
