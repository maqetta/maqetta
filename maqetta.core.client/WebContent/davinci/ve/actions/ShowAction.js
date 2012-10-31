define([
    	"dojo/_base/declare",
    	"davinci/ve/actions/_LayerAction"
], function(declare, _LayerAction){


return declare("davinci.ve.actions.ShowAction", [_LayerAction], {

	name: "show",
	run: function(context){
		if(!context){
			return;
		}
		var widget = context.getSelection()[0];
		if(!widget){
			return;
		}
		var node = widget.domNode;
		if(dojo.style(node, "visibility") == "hidden"){
			dojo.style(node, "visibility", "visible");
		}
		if(dojo.style(node, "display") == "none"){
			dojo.style(node, "display", "");
		}
		if(dojo.style(node, "zIndex") != "auto"){
			dojo.style(node, "zIndex", "auto");
		}
		var parent = node.offsetParent;
		var top = (parent.offsetHeight-node.offsetHeight)/2,
		    left = (parent.offsetWidth-node.offsetWidth)/2;
		top = (top >= 0)? top : 0;
		left = (left >= 0)? left : 0;
		dojo.style(node, "top", top + "px");
		dojo.style(node, "left", left + "px");
		context.select(widget);
	}
});
});