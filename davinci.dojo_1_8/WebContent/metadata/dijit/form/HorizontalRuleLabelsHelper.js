define([
"dojo/_base/declare"
], function(declare){

var HorizontalRuleLabelsHelper = function() {};

HorizontalRuleLabelsHelper.prototype = {

	preProcessData: function(data) {
		// process labels if user makes changes and adjust Count
		if (data.properties.labels) {
			if (typeof data.properties.labels == "string") {
				var labelString = dojo.trim(data.properties.labels);
				var strArray = labelString.split(",");
				data.properties.labels = strArray;
				data.properties.count = strArray.length;
				// numericMargin > 0 only if labels aren't specified
				data.properties.numericMargin = 0; 
			} else if (data.properties.count &&
					data.properties.labels.length != parseInt(data.properties.count, 10) ||
					data.properties.numericMargin) {
				// remove labels if user changes Count so that it can calculate the percentages for the Labels
				if (parseInt(data.properties.count, 10) > 1) {
					delete data.properties.labels;
				} else { // Dojo doesn't handle a count of just 1
					data.properties.labels = new Array("50%");
				}
			}
		}
		return data;
	}
};

return HorizontalRuleLabelsHelper;

});