dojo.provide("davinci.ve.actions.LayerActions");

dojo.require("davinci.ve.widget");
dojo.require("davinci.actions.Action");

dojo.declare("davinci.ve.actions._LayerAction", davinci.actions.Action, {
	isEnabled: function(context){
		if(!context){
			return false;
		}
		var selection = context.getSelection();
		if(selection.length != 1){
			return false;
		}
		var widget = selection[0];
		if (davinci.ve.metadata.queryDescriptor(widget.type, "isLayered")) {
			return true;
		}else{
			return false;
		}
	}
});

dojo.declare("davinci.ve.actions.ShowAction", davinci.ve.actions._LayerAction, {

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

dojo.declare("davinci.ve.actions.HideAction", davinci.ve.actions._LayerAction, {

	name: "hide",
	run: function(context){
		if(!context){
			return;
		}
		var widget = context.getSelection()[0];
		if(!widget){
			return;
		}
		var node = widget.domNode;
		if(dojo.style(node, "visibility") != "hidden"){
			dojo.style(node, "visibility", "hidden");
		}
		if(dojo.style(node, "display") != "none"){
			dojo.style(node, "display", "none");
		}
		context.deselect(widget);
	}
});

