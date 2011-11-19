define([
    "dijit/popup"
], function(popup){
return function() {
	this.popup = function(widget){
		var owner = widget.dijitWidget.owner;
		if (owner) {
			owner.openDropDown();
		}
	};

	this.tearDown = function(widget, selected){
		for(var w = selected; w && w != widget; w = w.getParent && w.getParent());
		if(w != widget){
			var owner = widget.dijitWidget.owner;
			if (owner) {
				owner.closeDropDown();
			}
		}
		return w != widget;
	};
};
});