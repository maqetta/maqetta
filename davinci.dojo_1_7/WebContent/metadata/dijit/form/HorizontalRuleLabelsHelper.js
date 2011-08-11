dojo.provide("davinci.libraries.dojo.dijit.form.HorizontalRuleLabelsHelper");

dojo.declare("davinci.libraries.dojo.dijit.form.HorizontalRuleLabelsHelper", null, {

	preProcessData: function(data){
		//process labels if user makes changes and adjust Count
		if(data.properties.labels){
			if(typeof data.properties.labels == "string"){
				var labelString = dojo.trim(data.properties.labels);
				var strArray = labelString.split(",");
				data.properties.labels = strArray;
				data.properties.count = strArray.length;
				data.properties.numericMargin = 0;//numericMargin > 0 only if labels aren't specified
			} else if(data.properties.labels.length != parseInt(data.properties.count) || data.properties.numericMargin){
				//remove Labels if user changes Count so that it can calculate the percentages for the Labels
				delete data.properties.labels;
			}
		}
		return data;
	}

	
	
});