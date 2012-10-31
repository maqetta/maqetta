define([
	"dojo/_base/declare",
	"./Action",
	"../Runtime"
], function(declare, Action, Runtime){

return declare("davinci.actions.PasteAction", Action, {
	
	run: function(selection){	  
	},

	isEnabled: function(selection){
		return Runtime.clipboard;
	}
});
});
