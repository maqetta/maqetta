define([
    	"dojo/_base/declare",
    	"./_TableAction",
    	"davinci/commands/CompoundCommand",
    	"davinci/ve/commands/RemoveCommand",
    	"davinci/ve/commands/ModifyCommand",
    	"davinci/ve/commands/ReparentCommand",
    	"davinci/ve/widget",
    	"./TableMatrix"
], function(declare, _TableAction, CompoundCommand, RemoveCommand, ModifyCommand, ReparentCommand, Widget, TableMatrix){


return declare(_TableAction, {

	name: "removeRow",
	iconClass: "editActionIcon editRemoveRowIcon",

	//Don't want enabled if dealing with columns
	_isEnabled: function(cell) {
		var nodeName = cell.nodeName.toLowerCase();
		return nodeName == "td" ||
			   nodeName == "th" ||
			   nodeName == "tr";
 	},
 	
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
		
		//If we have a row element, let's use the first cell in the row
		if (sel.nodeName.toLowerCase() == "tr") {
			var selRowIndex = rows.indexOf(sel);
			sel = cells[selRowIndex][0];
		}
		
		var pos = matrix.getPos(sel);
		var r = pos.r;
		var cols = cells[r];

		var command = new CompoundCommand();
		var widget = undefined;
		for(var c = 0; c < cols.length; c++){
			var cell = cols[c];
			var rowspan = matrix.getRowSpan(cell);
			var colspan = matrix.getColSpan(cell);
			if(rowspan > 1){
				widget = Widget.byNode(cell);
				var properties = {rowspan: rowspan - 1};
				command.add(new ModifyCommand(widget, properties));
				if(matrix.getPos(cell).r == r && r + 1 < rows.length){ // on the row to delete
					var parent = Widget.byNode(rows[r + 1]);
					var nextCell = matrix.getNextCell(r + 1, c + colspan);
					var next = (nextCell ? Widget.byNode(nextCell) : undefined);
					command.add(new ReparentCommand(widget, parent, next));
				}
			}
			c += (colspan - 1); // skip rows covered by this cell
		}
		widget = Widget.byNode(rows[r]);
		command.add(new RemoveCommand(widget));
		context.getCommandStack().execute(command);
	}

});
});