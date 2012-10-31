//FIXME: This routine doesn't seem to be used. Remove?
define([
    	"dojo/_base/declare",
    	"../../actions/Action",
    	"../../commands/CompoundCommand",
    	"../commands/MoveCommand",
    	"davinci/ve/utils/GeomUtils",
    	"../widget"
], function(declare, Action, CompoundCommand, MoveCommand, GeomUtils, Widget){


return declare("davinci.ve.actions.AlignAction", [Action], {

	run: function(context){
		if(!context){
			return;
		}

		var command = new CompoundCommand();
		var selection = context.getSelection();
		var parent = undefined;
		var baseline = undefined;
		dojo.forEach(selection, function(w){
			var node = Widget.getStyleNode(w);
			if(node.style.position != "absolute"){
				return;
			}
/*
			var box = dojo.marginBox(node);
*/
			var box = null;
			var helper = w.getHelper();
			if(helper && helper.getMarginBoxPageCoords){
				box = helper.getMarginBoxPageCoords(w);
			} else {
				box = GeomUtils.getMarginBoxPageCoords(node);
			}
			if(parent){
				if(Widget.getParent(w) != parent){
					context.deselect(w);
					return;
				}
				var left = box.l;
				var top = box.t;
				switch(this.align){
				case "left":
					left = baseline.l;
					break;
				case "right":
					left = baseline.l + baseline.w - box.w;
					break;
				case "top":
					top = baseline.t;
					break;
				case "bottom":
					top = baseline.t + baseline.h - box.h;
					break;
				default:
					return;
				}
				command.add(new MoveCommand(w, left, top));
			}else{
				parent = Widget.getParent(w);
				baseline = box;
			}
		}, this);

		if(!command.isEmpty()){
			context.getCommandStack().execute(command);
		}
	},

	isEnabled: function(context){
		var selection = context.getSelection();
		if(selection.length < 2){
			return false;
		}
		var parent = Widget.getParent(selection[0]);
		for(var i = 1; i < selection.length; i++){
			if(Widget.getParent(selection[i]) != parent){
				return false;
			}
		}
		return true;
	}

});
});

