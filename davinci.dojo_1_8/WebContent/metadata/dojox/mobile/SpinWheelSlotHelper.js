define(function() {

var SpinWheelSlotHelper = function() {};
SpinWheelSlotHelper.prototype = {

	preProcessData: function(data) {
		// dojo hangs if empty strings are passed for labelTo and labelFrom
		if (data.properties && dojo.isString(data.properties.labelTo) && data.properties.labelTo.length == 0) {
			delete data.properties.labelTo;
		}
		if (data.properties && dojo.isString(data.properties.labelFrom) && data.properties.labelFrom.length == 0) {
			delete data.properties.labelFrom;
		}

		return data;
	}

};

return SpinWheelSlotHelper;

});