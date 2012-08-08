define([
	"dojo/_base/declare",
	"davinci/ve/utils/URLRewrite"
], function(declare, URLRewrite){
	
return declare("davinci.html.ui.ImageViewer", null, {

	isReadOnly : true,

	constructor : function (element) {
		this.element = element;
	},

	save : function() {
	},

	getDefaultContent : function() {
	},

	supports : function (something) {
		return false;
	},

	setContent : function (fileName,content) {
		this.fileName = fileName;
		this.element.innerHTML = "<div style='overflow:auto'>"
			+ "<img src='"+ URLRewrite.encodeURI(this.resourceFile.getURL())+"'/>"
			+ "</div>";
		this.dirty = false;
	},

	destroy : function() {
	}

});
});