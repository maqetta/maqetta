define([
    	"dojo/_base/declare",
    	"./_TableAction",
    	"davinci/commands/CompoundCommand",
    	"davinci/ve/commands/RemoveCommand",
    	"davinci/ve/commands/ModifyCommand",
    	"davinci/ve/widget",
    	"./TableMatrix"
], function(declare, _TableAction, CompoundCommand, RemoveCommand, ModifyCommand, Widget, TableMatrix){


return declare(_TableAction, {

	name: "removeColumn",
	iconClass: "editActionIcon editRemoveColumnIcon",

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

		var command = new CompoundCommand();
		for(var r = 0; r < rows.length; r++){
			var cols = cells[r];
			var cell = cols[c];
			var widget = Widget.byNode(cell);
			var colspan = matrix.getColSpan(cell);
			if(colspan > 1){
				var properties = {colspan: colspan - 1};
				command.add(new ModifyCommand(widget, properties));
			}else{
				command.add(new RemoveCommand(widget));
			}
			r += (matrix.getRowSpan(cell) - 1); // skip rows covered by this cell
		}
		
		// Delete (or modify) <col> element based on column we're deleting
		if (matrix.colgroup) {
			var colElement = matrix.getColElement(pos.c);
			if (colElement) {
				var widget = Widget.byNode(colElement);
				var span = matrix.getSpan(colElement);
				if (span > 1) {
					var properties = {span: span - 1};
					command.add(new ModifyCommand(widget, properties));
				} else {
					command.add(new RemoveCommand(widget));
				}
			} else {
				//User must have messed around with <colgroup> or <col> elements
				console.error("RemoveColumnAction: could not find <col> element associated with the selection");
			}
		}
		
		context.getCommandStack().execute(command);
	}

});
});