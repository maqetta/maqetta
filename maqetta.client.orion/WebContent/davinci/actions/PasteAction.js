dojo.provide("davinci.actions.PasteAction");
dojo.require("davinci.actions.Action");

dojo.declare("davinci.actions.PasteAction", davinci.actions.Action, {
	
	run: function(selection){
	  
},

isEnabled: function(selection){
	return davinci.Runtime.clipboard;
}


});
