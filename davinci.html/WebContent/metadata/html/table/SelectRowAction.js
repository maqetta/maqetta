define([
    	"dojo/_base/declare",
    	"./_TableAction",
    	"davinci/ve/actions/SelectParentAction"
], function(declare, _TableAction, SelectParentAction){

return declare(_TableAction, {

	name: "selectRow",
	iconClass: "editActionIcon editSelectRowIcon",

	constructor: function(){
		this._selectParentAction = new SelectParentAction();
	},
	
	//Don't want enabled if dealing with a selected row or selected columns
	_isEnabled: function(cell) {
		var nodeName = cell.nodeName.toLowerCase();
		return nodeName == "td" ||
			   nodeName == "th";
 	},
	
	run: function(context){
		this._selectParentAction.run(context);
	}
});
});

