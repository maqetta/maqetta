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

	name: "selectColumn",
	iconClass: "editActionIcon editSelectColumnIcon",

	//Don't want enabled if dealing with a selected row or selected columns
	_isEnabled: function(cell) {
		var nodeName = cell.nodeName.toLowerCase();
		return nodeName == "td" ||
			   nodeName == "th";
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
		var pos = matrix.getPos(sel);
		var col = matrix.getColElement(pos.c);
		if (col) {
			context.select(col._dvWidget);
		} else {
			//User must have messed around with <colgroup> or <col> elements
			console.error("SelectColumnAction: could not find <col> element associated with the selection");
		}
	}
});
});