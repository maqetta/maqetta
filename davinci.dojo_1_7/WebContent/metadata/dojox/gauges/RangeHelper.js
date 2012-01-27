define(function() {

var RangeHelper = function() {};
RangeHelper.prototype = {

	//color comes in as string so we switch back to object
	preProcessData: function(data) {
		if (data.properties.color && typeof data.properties.color === "string") {
			data.properties.color = {'color': data.properties.color};
		}
		return data;
	}

};

return RangeHelper;

});