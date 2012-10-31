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

	name: "joinRow",
	iconClass: "editActionIcon editJoinRowIcon",

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
		var rs = matrix.getRowSpan(sel);
		var nr = pos.r + rs; // the next row
		if(nr >= rows.length){ // the last row
			return;
		}
		var nc = pos.c + matrix.getColSpan(sel); // the next column

		var command = new CompoundCommand();
		var widget = undefined;
		var properties = undefined;
		for(var c = pos.c; c < nc; c++){
			var cell = cells[nr][c];
			if(!cell){
				continue;
			}
			if(c > 0 && cells[nr][c - 1] == cell){ // spanning from the previous column
				return;
			}
			var colspan = matrix.getColSpan(cell);
			if(c + colspan > nc){ // spanning to the next column
				return;
			}
			var rowspan = matrix.getRowSpan(cell);
			widget = davinci.ve.widget.byNode(cell);
			if(rowspan > 1 && nr + 1 < rows.length){
				properties = {rowspan: rowspan - 1};
				command.add(new ModifyCommand(widget, properties));
				// move to the next row
				var parent = Widget.byNode(rows[nr + 1]);
				var nextCell = matrix.getNextCell(nr + 1, c + colspan);
				var next = (nextCell ? Widget.byNode(nextCell) : undefined);
				command.add(new ReparentCommand(widget, parent, next));
			}else{
				var parent = Widget.byNode(sel);
				dojo.forEach(Widget.getChildren(widget), function(w){
					command.add(new ReparentCommand(w, parent));
				});
				command.add(new RemoveCommand(widget));
			}
			c += (colspan - 1); // skip columns covered by this cell
		}
		widget = Widget.byNode(sel);
		properties = {rowspan: rs + 1};
		command.add(new ModifyCommand(widget, properties));
		context.getCommandStack().execute(command);
	}

});
});