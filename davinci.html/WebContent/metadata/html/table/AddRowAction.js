define([
    	"dojo/_base/declare",
    	"./_TableAction",
    	"davinci/commands/CompoundCommand",
    	"davinci/ve/commands/AddCommand",
    	"davinci/ve/commands/ModifyCommand",
    	"davinci/ve/widget",
    	"./TableMatrix"
], function(declare, _TableAction, CompoundCommand, AddCommand, ModifyCommand, Widget, TableMatrix){


return declare(_TableAction, {

	name: "addRow",
	iconClass: "editActionIcon editAddRowIcon",
	
	_insertAfter: true,
	
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

		//Build table matrix helper based on selection
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
		if (this._insertAfter) {
			// the bottom-most row
			r += matrix.getRowSpan(sel) - 1; 
			if(r >= rows.length){
				// limit to the last row
				r = rows.length - 1; 
			}
		}
		var cols = cells[r];
		var neighborCols = null;
		if (this._insertAfter) {
			//next row
			neighborCols = cells[r + 1];
		} else {
			//prev row
			neighborCols = cells[r - 1];
		}

		var command = new CompoundCommand();
		var data = TableMatrix.createTableRowData(context);
		for(var c = 0; c < cols.length; c++){
			var cell = cols[c];
			// check is spanning to the neighbor row (e.g., next/prev row)
			if(neighborCols && neighborCols[c] == cell){ 
				var widget = Widget.byNode(cell);
				var properties = {rowspan: matrix.getRowSpan(cell) + 1}; 
				command.add(new ModifyCommand(widget, properties));
				c += (matrix.getColSpan(cell) - 1); // skip columns covered by this cell
			}else{
				data.children.push(TableMatrix.createTableCellData(context));
			}
		}
		var parent = Widget.byNode(rows[r].parentNode);
		var insertIndex = r;
		if (this._insertAfter) {
			insertIndex = r + 1;
		}
		command.add(new AddCommand(data, parent, insertIndex));
		context.getCommandStack().execute(command);
	}
	
});
});