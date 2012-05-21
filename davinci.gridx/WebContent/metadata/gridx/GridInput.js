define([
	"dojo/_base/declare",
	"maq-metadata-dojo-1.7/dojox/grid/DataGridInput"
], function(
	declare,
	DataGridInput
) {

return declare(DataGridInput, {
	constructor : function() {
		this.useDataDojoProps = true;
		this.useTableElementsForStructure = true;
		this.supportsEscapeHTMLInData = false;
	}
});

});