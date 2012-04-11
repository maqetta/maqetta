define([
	"dojo/_base/declare",
	"../../metadata/dojo/1.7/dojox/grid/DataGridInput"
], function(
	declare,
	DataGridInput
) {

return declare(DataGridInput, {	
	constructor : function() {
		this.useDataDojoProps = true;
		this.useTableElementsForStructure = true;
	},
	
	_cleanUpNewWidgetAttributes: function(widget) {
		// We don't want to write out "structure" (if using table elements to
		// define columns) 
		widget._srcElement.removeAttribute("cacheClass");
		
		//Call superclass
		this.inherited(arguments);
	}
});

});