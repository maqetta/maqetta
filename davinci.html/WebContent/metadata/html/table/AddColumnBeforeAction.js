define([
    	"dojo/_base/declare",
    	"./AddColumnAction"
], function(declare, AddColumnAction){


return declare(AddColumnAction, {

	name: "addColumnBefore",
	iconClass: "editActionIcon editAddColumnBeforeIcon",

	constructor: function(){
		this._insertAfter = false;
	}

});
});
