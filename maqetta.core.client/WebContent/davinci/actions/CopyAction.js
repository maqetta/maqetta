define([
	"dojo/_base/declare",
	"./Action",
	"../Runtime"
], function(declare, Action, Runtime){

return declare("davinci.actions.CopyAction", Action, {
	
	run: function(selection){
		  Runtime.clipboard=selection;
	},
	
	isEnabled: function(selection){
		return selection.length>0;
	}
});
});
