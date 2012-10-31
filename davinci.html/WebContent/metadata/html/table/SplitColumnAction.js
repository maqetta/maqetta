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
	
	name: "splitColumn",
	iconClass: "editActionIcon editSplitColumnIcon",

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
		var properties = undefined;
		if(cs > 1){
			var widget = Widget.byNode(sel);
			properties = {colspan: cs - 1};
			command.add(new ModifyCommand(widget, properties));
		}else{
			// span other cells in the column
			for(var r = 0; r < rows.length; r++){
				if(r == pos.r){
					// skip the cell to split
					r += (rs - 1);
					continue;
				}
				var cell = cells[r][pos.c];
				var widget = Widget.byNode(cell);
				properties = {colspan: matrix.getColSpan(cell) + 1};
				command.add(new ModifyCommand(widget, properties));
				r += (matrix.getRowSpan(cell) - 1); // skip rows covered by this cell
			}
		}
		var data = TableMatrix.createTableCellData();
		if(rs > 1){
			data.properties = {rowspan: rs};
		}
		var parent = Widget.byNode(rows[pos.r]);
		var nextCell = matrix.getNextCell(pos.r, pos.c + cs);
		var next = (nextCell ? Widget.byNode(nextCell) : undefined);
		command.add(new AddCommand(data, parent, next));
		context.getCommandStack().execute(command);
	}

});
});