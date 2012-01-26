define([
    	"dojo/_base/declare",
    	"./_TableAction",
    	"davinci/commands/CompoundCommand",
    	"davinci/ve/commands/AddCommand",
    	"davinci/ve/commands/ModifyCommand",
    	"davinci/ve/widget",
    	"davinci/ve/actions/TableMatrix"
], function(declare, _TableAction, CompoundCommand, AddCommand, ModifyCommand, Widget, TableMatrix){


return declare("davinci.ve.actions.AddColumnBeforeAction", [_TableAction], {

	name: "addColumnBefore",
	iconClass: "editActionIcon editAddColumnIcon",

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
		var c = pos.c;

		var command = new CompoundCommand();
		for(var r = 0; r < rows.length; r++){
			var cols = cells[r];
			var cell = cols[c];
			if(cell && cols[c - 1] == cell){ // spanning to the prev column
				var widget = Widget.byNode(cell);
				var properties = {colspan: matrix.getColSpan(cell) + 1};
				command.add(new ModifyCommand(widget, properties));
				r += (matrix.getRowSpan(cell) - 1); // skip rows covered by this cell
			}else{
				var data = {type: "html.td", context: context};
				var parent = Widget.byNode(rows[r]);
				var nextCell = matrix.getNextCell(r, c);
				var next = (nextCell ? Widget.byNode(nextCell) : undefined);
				command.add(new AddCommand(data, parent, next));
			}
		}
		context.getCommandStack().execute(command);
	}

});
});
