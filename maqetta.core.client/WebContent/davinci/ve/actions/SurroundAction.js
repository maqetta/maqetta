define([
    	"dojo/_base/declare",
    	"davinci/ve/actions/ContextAction",
    	"davinci/commands/CompoundCommand",
    	"davinci/ve/commands/RemoveCommand",
    	"davinci/ve/commands/AddCommand",
    	"davinci/ve/commands/ReparentCommand",
    	"davinci/ve/widget"
], function(declare, ContextAction, CompoundCommand, RemoveCommand, AddCommand, ReparentCommand, Widget){


return declare("davinci.ve.actions.SurroundAction", [ContextAction], {


	run: function(context){
		context = this.fixupContext(context);
		var newWidget, tag = this.item.surroundWithTagName;
		if(!tag){
			console.error('missing surroundWithTagName');
			return;
		}
		dojo.withDoc(context.getDocument(), function(){
			newWidget = Widget.createWidget({type: "html." + tag, properties: {}, children: [], context: context});
		});
		var command = new CompoundCommand(),
			selection = [].concat(context.getSelection()),
			first = selection[0],
			parent = first.getParent();

		selection.sort(function(a, b){
			return parent.indexOf(a) - parent.indexOf(b);
		});
		command.add(new AddCommand(newWidget, parent, parent.indexOf(first)));
		dojo.forEach(selection, function(w){
			command.add(new ReparentCommand(w, newWidget, "last"));
		});
		context.getCommandStack().execute(command);
	},

	isEnabled: function(context){
		context = this.fixupContext(context);
		if (context && context.getSelection().length){
			var parent = context.getSelection()[0].getParent(),
				indices = [];
			if(!parent){
				return false;
			}
			var siblings = dojo.every(context.getSelection(), function(selection){
				var selectionParent = selection.getParent();
				if(!selectionParent){
					return false;
				}
				indices.push(parent.indexOf(selection));
				return parent.id == selectionParent.id;
			});
			if (siblings){
				// return true only if they are sequential
				indices.sort();
				var i,j;
				for(i = indices.shift(); indices.length; i = j){
					j = indices.shift();
					if(j != i + 1){
						return false;
					}
				}
				return true;
			}
		}
		return false;
	}
});
});