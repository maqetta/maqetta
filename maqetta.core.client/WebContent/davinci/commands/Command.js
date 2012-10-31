define([
	    "dojo/_base/declare"
], function(declare){
	
return declare("davinci.commands.Command", null, {
	
	constructor: function(args){
		dojo.mixin(this, args);
	},

	execute: function(){
	},

	undo: function(){
	}
	
});
});

