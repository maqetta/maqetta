define([
	"dojo/_base/declare",
	"davinci/ui/ModelEditor",
	"davinci/html/CSSEditorContext",
	"davinci/html/ui/CSSOutline",
	"davinci/html/CSSFile",
], function(declare, ModelEditor, CSSEditorContext, CSSOutline, CSSFile){

return declare(ModelEditor, {

	constructor: function(element) {
		this.cssFile = new CSSFile();
		this.model = this.cssFile;
	},

	destroy: function() {
		this.cssFile.close();
		this.inherited(arguments);
	},

	getOutline: function() {
		if (!this.outline) { 
			this.outline = new CSSOutline(this.model);
		}
		return this.outline;
	},

	getDefaultContent: function() {
		return	"";
	},

	getContext: function() {
		if (!this.context) {
			this.context = new CSSEditorContext(this);
		}
		return this.context;
	}

});
});
