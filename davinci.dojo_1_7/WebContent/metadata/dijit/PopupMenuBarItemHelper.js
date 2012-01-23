define(function() {

return {

	create: function(widget, srcElement) {
		var popup = widget.dijitWidget.popup;
		if (popup) {
			// this will hide the dijitMenu in designer
			popup.domNode._dvWidget.hidden = true;
		}
	}

};

});