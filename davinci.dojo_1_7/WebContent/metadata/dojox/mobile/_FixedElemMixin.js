define(function() {
	
	return {

		getPropertyValue: function(widget, prop) {
			// dojox.mobile doesn't keep the "fixed" property on the widget object;
			// instead, pull value from the model.
			if (prop === 'fixed') {
				var attr = widget._srcElement._getAttribute(prop);
				if (attr) {
					return attr.value;
				}
			}
			return widget._getPropertyValue(prop);
		}

	};

});