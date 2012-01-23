define([
	"dojo/_base/declare",
	"davinci/actions/Action"
], function(declare, Action){

return declare("davinci.actions.CopyAction", Action, {

	run: function(selection){
	  davinci.Runtime.clipboard=selection;
	},
	
	isEnabled: function(selection){
		return selection.length>0;
	}
});
});

