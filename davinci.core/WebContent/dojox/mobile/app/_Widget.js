dojo.provide("dojox.mobile.app._Widget");
dojo.experimental("dojox.mobile.app._Widget");

dojo.require("dijit._Widget");

dojo.declare("dojox.mobile.app._Widget", dijit._Widget, {
	// summary:
	//		The base mobile app widget.

	getScroll: function(){
		// summary:
		//		Returns the scroll position.
		return {
			x: window.scrollX,
			y: window.scrollY
		};
	},

	connect: function(target, event, fn){
		if(event.toLowerCase() == "dblclick"
			|| event.toLowerCase() == "ondblclick"){

			if(window["Mojo"]){
				// Handle webOS tap event
				return this.connect(target, Mojo.Event.tap, fn);
			}
		}
		return this.inherited(arguments);
	}
});