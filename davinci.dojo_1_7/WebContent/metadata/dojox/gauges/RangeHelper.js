dojo.provide("davinci.libraries.dojo.dojox.gauges.RangeHelper");

dojo.declare("davinci.libraries.dojo.dojox.gauges.RangeHelper", null, {

	//color comes in as string so we switch back to object upon color change
	create: function(widget, srcElement){
		if(widget.dijitWidget.color && typeof widget.dijitWidget.color == "string") {
			widget.dijitWidget.color = {'color': widget.dijitWidget.color};
		}
	}

	
	
});