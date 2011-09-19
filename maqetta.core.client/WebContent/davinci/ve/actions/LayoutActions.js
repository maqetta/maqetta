dojo.provide("davinci.ve.actions.LayoutActions");

dojo.require("davinci.actions.Action");
dojo.require("davinci.commands.CompoundCommand");
dojo.require("davinci.ve.widget");
dojo.require("davinci.ve.commands.AddCommand");
dojo.require("davinci.ve.commands.ModifyCommand");
dojo.require("davinci.ve.commands.MoveCommand");

dojo.declare("davinci.ve.actions.AlignAction", davinci.actions.Action, {

	run: function(context){
		if(!context){
			return;
		}

		var command = new davinci.commands.CompoundCommand();
		var selection = context.getSelection();
		var parent = undefined;
		var baseline = undefined;
		dojo.forEach(selection, function(w){
			var node = davinci.ve.widget.getStyleNode(w);
			if(node.style.position != "absolute"){
				return;
			}
			var box = dojo.marginBox(node);
			if(parent){
				if(davinci.ve.widget.getParent(w) != parent){
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
				command.add(new davinci.ve.commands.MoveCommand(w, left, top));
			}else{
				parent = davinci.ve.widget.getParent(w);
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
		var parent = davinci.ve.widget.getParent(selection[0]);
		for(var i = 1; i < selection.length; i++){
			if(davinci.ve.widget.getParent(selection[i]) != parent){
				return false;
			}
		}
		return true;
	}

});

