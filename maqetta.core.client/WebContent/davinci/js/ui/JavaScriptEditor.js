define([
	"dojo/_base/declare",
	"davinci/js/ui/JavaScriptOutline",
	"davinci/model/Factory",
	"davinci/ui/ModelEditor"
], function(declare, JavaScriptOutline, Factory, ModelEditor) {

return declare(ModelEditor, {

	constructor: function(element) {
		this.jsFile = Factory.newJS();
		this.model = this.jsFile;
	},

	getOutline: function() {
		if (!this.outline) {
			this.outline = new JavaScriptOutline(this.model);
		}
		return this.outline;
	},

	getDefaultContent: function() {
		return "function functionName ()\n{\n}\n";
	}

});
});

