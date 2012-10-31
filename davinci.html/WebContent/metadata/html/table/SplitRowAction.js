// FIXME: Moved from core.client, but currently unused. There's an open ticket to potentially resurrect some of this function.
define([
    	"dojo/_base/declare",
    	"./_TableAction",
    	"davinci/commands/CompoundCommand",
    	"davinci/ve/commands/ModifyCommand",
    	"davinci/ve/commands/AddCommand",
    	"davinci/ve/widget",
    	"./TableMatrix"
], function(declare, _TableAction, CompoundCommand, ModifyCommand, AddCommand, Widget, TableMatrix){


return declare(_TableAction, {
	
	name: "splitRow",
	iconClass: "editActionIcon editSplitRowIcon",

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
		var rs = matrix.getRowSpan(sel);

		var command = new CompoundCommand();
		var data = TableMatrix.createTableCellData();
		if(cs > 1){
			data.properties = {colspan: cs};
		}
		if(rs > 1 && pos.r + rs <= rows.length){
			var widget = Widget.byNode(sel);
			var properties = {rowspan: rs - 1};
			command.add(new ModifyCommand(widget, properties));
			var r = pos.r + rs - 1; // the bottom-most row
			var parent = Widget.byNode(rows[r]);
			var nextCell = matrix.getNextCell(r, pos.c + cs);
			var next = (nextCell ? Widget.byNode(nextCell) : undefined);
			command.add(new AddCommand(data, parent, next));
		}else{
			// add a new row
			data = TableMatrix.createTableRowData();
			var parent = Widget.byNode(rows[pos.r].parentNode);
			var next = (pos.r + rs < rows.length ? Widget.byNode(rows[pos.r + rs]) : undefined);
			command.add(new AddCommand(data, parent, next));
			// span other cells in the row
			var cols = cells[pos.r];
			for(var c = 0; c < cols.length; c++){
				if(c == pos.c){
					// skip the cell to split
					c += (cs - 1);
					continue;
				}
				var cell = cols[c];
				var widget = Widget.byNode(cell);
				var properties = {rowspan: matrix.getRowSpan(cell) + 1};
				command.add(new ModifyCommand(widget, properties));
				c += (matrix.getColSpan(cell) - 1); // skip columns covered by this cell
			}
		}
		context.getCommandStack().execute(command);
	}

});
});