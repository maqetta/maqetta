define(function() {

var HorizontalRuleLabelsHelper = function() {};
HorizontalRuleLabelsHelper.prototype = {

	preProcessData: function(data) {
		//process labels if user makes changes and adjust Count
		var props = data.properties;
		if (props.labels) {
			var propsCount = parseInt(props.count, 10);
			if (typeof props.labels == "string") {
				var labelString = dojo.trim(props.labels);
				var strArray = labelString.split(",");
				props.labels = strArray;
				props.count = strArray.length;
				props.numericMargin = 0; //numericMargin > 0 only if labels aren't specified
			} else if(props.labels.length != propsCount || props.numericMargin) {
				//remove Labels if user changes Count so that it can calculate the percentages for the Labels
				if (propsCount > 1) {
					delete props.labels;
				} else {  //Dojo doesn't handle a count of just 1
					props.labels = new Array("50%");
				}
			}
		}
		return data;
	}

};

return HorizontalRuleLabelsHelper;

});