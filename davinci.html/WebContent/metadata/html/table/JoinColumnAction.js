// FIXME: Moved from core.client, but currently unused. There's an open ticket to potentially resurrect some of this function.
define([
    	"dojo/_base/declare",
    	"./_TableAction",
    	"davinci/commands/CompoundCommand",
    	"davinci/ve/commands/ReparentCommand",
    	"davinci/ve/commands/ModifyCommand",
    	"davinci/ve/commands/RemoveCommand",
    	"davinci/ve/widget",
    	"./TableMatrix"
], function(declare, _TableAction, CompoundCommand, ReparentCommand, ModifyCommand, RemoveCommand, Widget, TableMatrix){


return declare(_TableAction, {

	name: "joinColumn",
	iconClass: "editActionIcon editJoinColumnIcon",

	run: function(context){
		context = this.fixupContext(context);
		if(!context){
			return;
		}
		var sel = this._getCell(context);
		if(!sel){
			return;
		}

		var matrix = new TableMatrix(sel);
		var rows = matrix.rows;
		var cells = matrix.cells;
		var pos = matrix.getPos(sel);
		var cs = matrix.getColSpan(sel);
		var nc = pos.c + cs; // the next column
		if(nc >= cells[pos.r].length){ // the last column
			return;
		}
		var nr = pos.r + matrix.getRowSpan(sel); // the next row
		if(nr > rows.length){
			nr = rows.length; // limit to the last row
		}

		var command = new CompoundCommand();
		var widget = undefined;
		var parent = Widget.byNode(sel);
		var properties = undefined;
		for(var r = pos.r; r < nr; r++){
			var cell = cells[r][nc];
			if(!cell){
				continue;
			}
			if(r > 0 && cells[r - 1][nc] == cell){ // spanning from the previous row
				return;
			}
			var rowspan = matrix.getRowSpan(cell);
			if(r + rowspan > nr){ // spanning to the next row
				return;
			}
			var colspan = matrix.getColSpan(cell);
			widget = Widget.byNode(cell);
			if(colspan > 1){
				properties = {colspan: colspan - 1};
				command.add(new ModifyCommand(widget, properties));
			}else{
				dojo.forEach(Widget.getChildren(widget), function(w){
					command.add(new ReparentCommand(w, parent));
				});
				command.add(new RemoveCommand(widget));
			}
			r += (rowspan - 1); // skip rows covered by this cell
		}
		widget = parent;
		properties = {colspan: cs + 1};
		command.add(new ModifyCommand(widget, properties));
		context.getCommandStack().execute(command);
	}

});
});