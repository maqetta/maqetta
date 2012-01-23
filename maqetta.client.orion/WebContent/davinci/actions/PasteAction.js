define([
	"dojo/_base/declare",
	"davinci/actions/Action"
], function(declare, Action){

return declare("davinci.actions.PasteAction", Action, {
	
	run: function(selection){  
	},

	isEnabled: function(selection){
		return davinci.Runtime.clipboard;
	}
});
});
