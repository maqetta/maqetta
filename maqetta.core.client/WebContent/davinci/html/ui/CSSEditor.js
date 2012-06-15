define([
	"dojo/_base/declare",
	"davinci/ui/ModelEditor",
	"davinci/html/CSSEditorContext",
	"davinci/html/CSSModel",
	"davinci/html/ui/CSSOutline",
	"davinci/model/Factory",
	"davinci/html/CSSFile",
], function(declare, ModelEditor, CSSEditorContext, CSSModel, CSSOutline, Factory, CSSFile){

return declare("davinci.html.ui.CSSEditor", ModelEditor, {

	constructor : function(element, fileName) {
		debugger;
		//this.cssFile = Factory.getModel({url:fileName});
		//this.cssFile = Factory.newCSS(a);
		//this.cssFile = new CSSFile(args);
		this.cssFile = new CSSFile();
		this.model = this.cssFile;
	},

	destroy : function() {
		this.cssFile.close();
		this.inherited(arguments);
	},

	getOutline : function() {
		if (!this.outline) { 
			this.outline = new CSSOutline(this.model);
		}
		return this.outline;
	},

	getDefaultContent : function() {
		return	"";
	},

	getContext : function() {
		if (!this.context) {
			this.context = new CSSEditorContext(this);
		}
		return this.context;
	}

});
});
