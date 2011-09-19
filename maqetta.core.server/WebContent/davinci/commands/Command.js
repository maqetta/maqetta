dojo.provide("davinci.commands.Command");

dojo.declare("davinci.commands.Command", null, {

	constructor: function(args){
		dojo.mixin(this, args);
	},

	execute: function(){
	},

	undo: function(){
	}

});
