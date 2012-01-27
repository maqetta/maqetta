define(function() {

var PopupMenuBarItemHelper = function() {};
PopupMenuBarItemHelper.prototype = {

	create: function(widget, srcElement) {
		var popup = widget.dijitWidget.popup;
		if (popup) {
			// this will hide the dijitMenu in designer
			popup.domNode._dvWidget.hidden = true;
		}
	}

};

return PopupMenuBarItemHelper;

});