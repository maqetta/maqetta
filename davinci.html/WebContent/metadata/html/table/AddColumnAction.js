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

	name: "addColumn",
	iconClass: "editActionIcon editAddColumnIcon",
	
	_insertAfter: true,

	//Don't want enabled if dealing with rows
	_isEnabled: function(cell) {
		var nodeName = cell.nodeName.toLowerCase();
		return nodeName == "td" ||
			   nodeName == "th" ||
			   nodeName == "col";
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
		
		//If we have a col element, let's use the first cell in the col
		if (sel.nodeName.toLowerCase() == "col") {
			var adjustedColIndex = matrix.getAdjustedColIndex(sel);
			sel = cells[0][adjustedColIndex];
		}
		
		var pos = matrix.getPos(sel);
		var c = pos.c;
		if (this._insertAfter) {
			// the right-most column
			c = c + matrix.getColSpan(sel) - 1; 
		}

		var command = new CompoundCommand();
		for(var r = 0; r < rows.length; r++){
			var cols = cells[r];
			var cell = cols[c];
			var neighborCell = null;
			if (this._insertAfter) {
				// next column
				neighborCell = cols[c + 1]; 
			} else {
				// prev column
				neighborCell = cols[c - 1]; 
			}
			if(cell && neighborCell == cell){ 
				// spanning to the neighborCell (either prev or next)
				var widget = Widget.byNode(cell);
				var properties = {colspan: matrix.getColSpan(cell) + 1};
				command.add(new ModifyCommand(widget, properties));
				// skip rows covered by this cell
				r += (matrix.getRowSpan(cell) - 1); 
			}else{
				var data = TableMatrix.createTableCellData(context);
				var parent = Widget.byNode(rows[r]);
				var colIndex = c;
				if (this._insertAfter) {
					colIndex = colIndex + 1;
				}
				var nextCell = matrix.getNextCell(r, colIndex);
				var next = (nextCell ? Widget.byNode(nextCell) : undefined);
				command.add(new AddCommand(data, parent, next));
			}
		}
		
		// Create (or modify) <col> element to go with new cells
		if (matrix.colgroup) {
			var colElement = matrix.getColElement(pos.c);
			if (colElement) {
				var neighborColElement = null;
				if (this._insertAfter) {
					// next column
					neighborColElement = matrix.getColElement(pos.c + 1); 
				} else {
					// prev column
					neighborColElement = matrix.getColElement(pos.c - 1); 
				}
				if(neighborColElement == colElement){ 
					// spanning to the neighborColElement (either prev or next), so
					// update span
					var widget = Widget.byNode(colElement);
					var properties = {span: matrix.getSpan(colElement) + 1};
					command.add(new ModifyCommand(widget, properties));
				} else {
					// create new <col> element
					var newColElementIndex = matrix.cols.indexOf(colElement);
					if (this._insertAfter) {
						newColElementIndex++;
					}
					var newColData = TableMatrix.createTableColData(context);
					command.add(new AddCommand(newColData, matrix.colgroup, newColElementIndex));
				}
			} else {
				//User must have messed around with <colgroup> or <col> elements
				console.error("AddColumnAction: could not find <col> element associated with the selection");
			}
		} else { //No <colgroup>
			//User must have messed around with <colgroup> or <col> elements
			console.error("AddColumnAction: could not find <colgroup> element associated with the selection.");
		}
		
		context.getCommandStack().execute(command);
	}

});
});
