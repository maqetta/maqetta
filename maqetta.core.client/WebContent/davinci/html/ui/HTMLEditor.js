define([
	"dojo/_base/declare",
	"davinci/ui/ModelEditor",
	"davinci/html/HTMLFile",
	"davinci/html/ui/HTMLOutline"
], function(declare, ModelEditor, HTMLFile, HTMLOutline){
 
return declare("davinci.html.ui.HTMLEditor", ModelEditor, {

	constructor : function(element) {
		this.htmlFile = new HTMLFile();
		this.model = this.htmlFile;
	},

	destroy : function() {
		this.htmlFile.close();
		this.inherited(arguments);
	},

	getOutline : function() {
		if (!this.outline) {
			this.outline = new HTMLOutline(this.model);
		}
		return this.outline;
	},

	getDefaultContent : function () {
		return "<html>\n <head></head>\n <body></body>\n</html>";
	}

});
});
