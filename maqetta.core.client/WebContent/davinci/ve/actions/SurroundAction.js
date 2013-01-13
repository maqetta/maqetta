define([
    	"dojo/_base/declare",
    	"dojo/_base/array",
    	"davinci/ve/actions/ContextAction",
    	"davinci/commands/CompoundCommand",
    	"davinci/ve/commands/AddCommand",
    	"davinci/ve/commands/StyleCommand",
    	"davinci/ve/commands/MoveCommand",
    	"davinci/ve/commands/ResizeCommand",
    	"davinci/ve/commands/ReparentCommand",
    	"davinci/ve/tools/CreateTool",
    	"davinci/ve/widget",
    	"davinci/ve/utils/GeomUtils"
], function(declare, Array, ContextAction, CompoundCommand, AddCommand, StyleCommand, MoveCommand, ResizeCommand, ReparentCommand, CreateTool, Widget, GeomUtils){


return declare("davinci.ve.actions.SurroundAction", [ContextAction], {


	run: function(context){
		context = this.fixupContext(context);
		var minX, minY, maxX, maxY;
		var marginBoxPageCoords = [];
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
			parent = first.getParent(),
			parentMarginBoxPageCoords = GeomUtils.getMarginBoxPageCoords(parent.domNode);
		selection.sort(function(a, b){
			return parent.indexOf(a) - parent.indexOf(b);
		});
		var userdoc = context.getDocument();	// inner document = user's document
		var userDojo = userdoc.defaultView && userdoc.defaultView.dojo;
		var allAbsolute = Array.every(selection, function(widget){
			if(userDojo){
				position_prop = userDojo.style(widget.domNode, 'position');
				return (position_prop == 'absolute');
			}
		});
		if(allAbsolute){
			Array.forEach(selection, function(w, i){
				// Store away margin boxes for later use
				marginBoxPageCoords.push(GeomUtils.getMarginBoxPageCoordsCached(w.domNode));
				
				// Add a seemingly superfluous MoveCommand at front of command stack
				// so that when an Undo occurs, the surrounded widgets will properly
				// go back to original correct location
				command.add(new MoveCommand(w, marginBoxPageCoords[i].l, marginBoxPageCoords[i].t, null, marginBoxPageCoords[i]));
			});
		}
		command.add(new AddCommand(newWidget, parent, parent.indexOf(first)));
		
		// If preference says to add new widgets to the current custom state,
		// then add appropriate StyleCommands
		CreateTool.prototype.checkAddToCurrentState(command, newWidget);

		if(allAbsolute){
			command.add(new StyleCommand(newWidget, [{'position':'absolute'}]));
			Array.forEach(selection, function(w, i){
				var r = marginBoxPageCoords[i].l + marginBoxPageCoords[i].w;
				var b = marginBoxPageCoords[i].t + marginBoxPageCoords[i].h;
				if(i == 0 || marginBoxPageCoords[i].l < minX){
					minX = marginBoxPageCoords[i].l;
				}
				if(i == 0 || marginBoxPageCoords[i].t < minY){
					minY = marginBoxPageCoords[i].t;
				}
				if(i == 0 || r > maxX){
					maxX = r;
				}
				if(i == 0 || b > maxY){
					maxY = b;
				}
			});
			command.add(new MoveCommand(newWidget, minX, minY));
			command.add(new ResizeCommand(newWidget, maxX-minX, maxY-minY));
		}
		Array.forEach(selection, function(w){
			command.add(new ReparentCommand(w, newWidget, "last"));
		});
		if(allAbsolute){
			// Need to perform MoveCommand on selected widgets after Reparent command
			// because MoveCommand accepts page-relative coordinates and then
			// adjusts left/top properties to be relative to widget's offsetParent
			Array.forEach(selection, function(w, i){
				command.add(new MoveCommand(w, 
						marginBoxPageCoords[i].l, 
						marginBoxPageCoords[i].t, 
						null,
						marginBoxPageCoords[i]));
			});
		}
		context.getCommandStack().execute(command);
		context.select(newWidget);
	},

	isEnabled: function(context){
		context = this.fixupContext(context);
		if (context && context.getSelection().length){
			var parent = context.getSelection()[0].getParent(),
				indices = [];
			if(!parent){
				return false;
			}
			var siblings = Array.every(context.getSelection(), function(selection){
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