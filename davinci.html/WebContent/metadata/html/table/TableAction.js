define([
    	"dojo/_base/declare",
    	"./_TableAction"
], function(declare, _TableAction){

// Empty action - present just to provide isEnabled for the dropdown button on the action bar
// for the various table commands
return declare(_TableAction, {

	name: "TableAction",
	
	run: function(context){
		// does nothing
	},

	//subclass can override
	isEnabled: function(cell) {
		return true;
	}

	// Uses base class for shouldShow

});
});
