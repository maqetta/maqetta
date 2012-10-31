define([
	    "dojo/_base/declare"
], function(declare) {
	
return declare("davinci.review.drawing.tools._ToolCommon", null, {

	constructor: function(surface, filterAttributes) {
		this.surface = surface;
		this.filterAttributes = filterAttributes || [];
	},

	setFilterAttributes: function(attributes) {
		this.filterAttributes = filterAttributes || [];
	},

	activate: function() {},

	deactivate: function() {
		dojo.forEach(this._evtSubs, dojo.unsubscribe);
		dojo.forEach(this._evtConns, dojo.disconnect);
	},

	destroy: function() {
		dojo.forEach(this._evtSubs, dojo.unsubscribe);
		dojo.forEach(this._evtConns, dojo.disconnect);
		this.surface = null;
	}

});
});
