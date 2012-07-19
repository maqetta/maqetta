define([
	"dojo/_base/declare",
	"../../dijit/layout/StackContainerInput",
], function(
	declare,
	StackContainerInput
) {

return declare(StackContainerInput, {
	propertyName: "label",
	multiLine: "true",
	format: "rows",
	supportsHTML: "true",
	helpText:  "",

	update: function(widget, value) {
		this.inherited(arguments);

		// FIXME: hack to make the widget resize
		widget.resize();
	}		

});

});
