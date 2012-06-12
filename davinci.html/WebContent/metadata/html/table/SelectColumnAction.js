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
	iconClass: "editActionIcon editSelectColumnIcon", //AWE TODO: need an icon

	run: function(context){
		//AWE TODO: implement
	}
});
});