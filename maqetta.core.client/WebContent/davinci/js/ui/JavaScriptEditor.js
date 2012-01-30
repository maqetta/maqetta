define([
	"dojo/_base/declare",
	"davinci/Runtime",
	"davinci/js/ui/JavaScriptOutline",
	"davinci/model/Factory",
	"davinci/ui/ModelEditor",
	"davinci/workbench/Preferences"
], function(declare, Runtime, JavaScriptOutline, Factory, ModelEditor, Preferences) {

return declare("davinci.js.ui.JavaScriptEditor", ModelEditor, {

	constructor : function(element) {
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

