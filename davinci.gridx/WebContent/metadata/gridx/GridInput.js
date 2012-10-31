define([
	"dojo/_base/declare",
	"maq-metadata-dojo/dojox/grid/DataGridInput"
], function(
	declare,
	DataGridInput
) {

return declare(DataGridInput, {
	constructor : function() {
		this._useDataDojoProps = true;
		this.supportsEscapeHTMLInData = false;
	}
});

});