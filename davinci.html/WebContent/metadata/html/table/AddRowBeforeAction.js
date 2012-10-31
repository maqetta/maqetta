define([
    	"dojo/_base/declare",
    	"./AddRowAction"
], function(declare, AddRowAction){


return declare(AddRowAction, {

	name: "addRowBefore",
	iconClass: "editActionIcon editAddRowIcon",
	
	constructor: function(){
		this._insertAfter = false;
	}

});
});