define(function() {

var _FixedElemMixin = function() {};
_FixedElemMixin.prototype = {

		getPropertyValue: function(widget, prop) {
			// dojox.mobile doesn't keep the "fixed" property on the widget object;
			// instead, pull value from the model.
			if (prop === 'fixed') {
				var attr = widget._srcElement._getAttribute(prop);
				// default value is empty string
				return attr && attr.value || '';
			}
			return widget._getPropertyValue(prop);
		}

};

return _FixedElemMixin;

});