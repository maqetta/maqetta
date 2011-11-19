define([
], function(){
return function() {
	this.popup = function(widget){
		widget.dijitWidget.show();
	};

	this.tearDown = function(widget, selected){
		for(var w = selected; w && w != widget; w = w.getParent && w.getParent());
		if(w != widget){
			widget.dijitWidget.hide();
		}
		return w != widget;
	};
};
});
