define(function() {

var AnalogGaugeHelper = function() {};
AnalogGaugeHelper.prototype = {

	checkValue: function(value) {
		// summary:
		//		Checks for cyclic data structure and removes it if it's there
		//
		if (value && value._ticks) {
			delete value._ticks;
		}
		return value;
	}

};

return AnalogGaugeHelper;

});