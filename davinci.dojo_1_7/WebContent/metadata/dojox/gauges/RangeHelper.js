dojo.provide("davinci.libraries.dojo.dojox.gauges.RangeHelper");

dojo.declare("davinci.libraries.dojo.dojox.gauges.RangeHelper", null, {

	//color comes in as string so we switch back to object
	preProcessData: function(data){
		if(data.properties.color && typeof data.properties.color == "string")
			data.properties.color = {'color': data.properties.color};
		return data;
	}

	
	
});