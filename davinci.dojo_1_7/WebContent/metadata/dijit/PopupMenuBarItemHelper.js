dojo.provide("davinci.libraries.dojo.dijit.PopupMenuBarItemHelper");

dojo.declare("davinci.libraries.dojo.dijit.PopupMenuBarItemHelper", null, {

	create: function(widget, srcElement){

		if (widget.dijitWidget.popup)
			widget.dijitWidget.popup.domNode._dvWidget.hidden=true; // this will hide the dijitMenu in designer

	}
	

});