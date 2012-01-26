define([
    	"dojo/_base/declare",
    	"./_TableAction",
    	"davinci/commands/CompoundCommand",
    	"davinci/ve/commands/AddCommand",
    	"davinci/ve/commands/ModifyCommand",
    	"davinci/ve/widget",
    	"davinci/ve/actions/TableMatrix"
], function(declare, _TableAction, CompoundCommand, AddCommand, ModifyCommand, Widget, TableMatrix){


return declare("davinci.ve.actions.AddRowAction", [_TableAction], {

	name: "addRow",
	iconClass: "editActionIcon editAddRowIcon",

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
		var r = pos.r + matrix.getRowSpan(sel) - 1; // the bottom-most row
		if(r >= rows.length){
			r = rows.length - 1; // limit to the last row
		}
		var cols = cells[r];
		var nextCols = cells[r + 1];

		var command = new CompoundCommand();
		var data = {type: "html.tr", children: [], context: context};
		for(var c = 0; c < cols.length; c++){
			var cell = cols[c];
			if(nextCols && nextCols[c] == cell){ // spanning to the next row
				var widget = Widget.byNode(cell);
				var properties = {rowspan: matrix.getRowSpan(cell) + 1}; 
				command.add(new ModifyCommand(widget, properties));
				c += (matrix.getColSpan(cell) - 1); // skip columns covered by this cell
			}else{
				data.children.push({type: "html.td", context: context});
			}
		}
		var parent = Widget.byNode(rows[r].parentNode);
		var next = (r + 1 < rows.length ? Widget.byNode(rows[r + 1]) : undefined);
		command.add(new AddCommand(data, parent, next));
		context.getCommandStack().execute(command);
	}

});
});