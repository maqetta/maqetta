define([
	"dojo/_base/declare",
	"../../metadata/dojo/1.7/dojox/grid/DataGridInput", 
], function(
	declare,
	DataGridInput
) {

return declare(DataGridInput, {	
	constructor : function() {
		this.useDataDojoProps = true;
		this.useTableElementsForStructure = true;
	}
});

});