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
	},

	/* Gets called before browser page is unloaded to give 
	 * editor a chance to warn the user they may lose data if
	 * they continue. Should return a message to display to the user
	 * if a warning is needed or null if there is no need to warn the
	 * user of anything. In browsers such as FF 4, the message shown
	 * will be the browser default rather than the returned value.
	 * 
	 * NOTE: With auto-save, _not_ typically needed by most editors.
	 */
	getOnUnloadWarningMessage: function() {
		return null;
	}
};

return ImageViewer;

});
