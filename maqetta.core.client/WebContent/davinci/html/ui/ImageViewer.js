define([], function(){

var ImageViewer = function(element) {
	this.element = element;
};

ImageViewer.prototype = {
	isReadOnly: true,

	save: function() {
	},

	getDefaultContent: function() {
	},

	supports: function (something) {
		return false;
	},

	setContent: function (fileName,content) {
		this.fileName = fileName;
		this.element.innerHTML = "<div style='overflow:auto'>"
			+ "<img src='"+ encodeURI(this.resourceFile.getURL())+"'/>"
			+ "</div>";
		this.dirty = false;
	},

	destroy: function() {
	}
};

return ImageViewer;

});
