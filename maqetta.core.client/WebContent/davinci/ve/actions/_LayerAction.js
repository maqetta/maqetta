define([
    	"dojo/_base/declare",
    	"davinci/actions/Action",
    	"davinci/ve/metadata"
], function(declare, Action, Metadata){


return declare("davinci.ve.actions._LayerAction", [Action], {
	

	isEnabled: function(context){
		if(!context){
			return false;
		}
		var selection = context.getSelection();
		if(selection.length != 1){
			return false;
		}
		var widget = selection[0];
		if (Metadata.queryDescriptor(widget.type, "isLayered")) {
			return true;
		}else{
			return false;
		}
	}
});
});