dojo.provide("davinci.libraries.dojo.dijit.DialogHelper");

dojo.declare("davinci.libraries.dojo.dijit.DialogHelper", null, {

		popup: function(widget){
			widget.dijitWidget.show();
		},

		tearDown: function(widget, selected){
			for(var w = selected; w && w != widget; w = w.getParent && w.getParent());
			if(w != widget){
				widget.dijitWidget.hide();
			}
			return w != widget;
		}
});