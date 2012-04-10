define([
	"dojo/_base/declare",
	"../../metadata/dojo/1.7/dojox/grid/DataGridCreateTool"
], function(
	declare,
	DataGridCreateTool
) {

return declare(DataGridCreateTool, {

	constructor: function(data) {
		this._useDataDojoProps = true;
	}
});

});