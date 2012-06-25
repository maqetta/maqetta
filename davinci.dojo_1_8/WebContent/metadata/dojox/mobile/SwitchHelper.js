define(function() {

var SwitchHelper = function() {};
SwitchHelper.prototype = {

	create: function(widget, srcElement) {
		var parent = widget.dijitWidget.getParent();
		if (parent && parent.declaredClass === 'dojox.mobile.ListItem') {
			widget.addClass('mblItemSwitch');
//			dojo.addClass(widget.domNode, 'mblItemSwitch');
			// XXX need to add style to Model as well
		}
	}

};

return SwitchHelper;

});