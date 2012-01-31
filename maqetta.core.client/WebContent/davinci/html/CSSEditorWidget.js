define([
	"dojo/_base/declare"
], function(declare) {

return declare("davinci.html.CSSEditorWidget", null, {

	constructor : function(context) {
		this.context = context;
	},

	getValues : function () {
		if (!this.values) {
			this.values = {};
			var rule = this.context.selectedRule;
			for (var i=0; i<rule.properties.length; i++) {
				var property = rule.properties[i];
				this.values[property.name] = property.value;
			}
		}
		return this.values;
	}

});
});
