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
		context.getCommandStack().execute(command);
	}

});
});