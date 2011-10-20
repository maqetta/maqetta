dojo.provide("davinci.actions.CopyAction");
dojo.require("davinci.actions.Action");

dojo.declare("davinci.actions.CopyAction", davinci.actions.Action, {
	
	run: function(selection){
	  davinci.Runtime.clipboard=selection;
},

isEnabled: function(selection){
	return selection.length>0;
}


});
