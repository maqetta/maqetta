define([
        "dojo/_base/lang",
],function(lang) {

var SpinWheelSlotHelper = function() {};
SpinWheelSlotHelper.prototype = {

	preProcessData: function(data) {
		function fixLabelProp(value){
			if(dojo.isString(value)){
				value = parseFloat(value);
			}
			if(isNaN(value)){
				value = null;
			}
			return value;
		}
		// dojo hangs if string values are passed for labelTo and labelFrom
		// and when labelFrom > labelTo
		if (data.properties){
			data.properties.labelFrom = fixLabelProp(data.properties.labelFrom);
			if(data.properties.labelFrom === null){
				delete data.properties.labelFrom;
			}
			data.properties.labelTo = fixLabelProp(data.properties.labelTo);
			if(data.properties.labelTo === null){
				delete data.properties.labelTo;
			}
			if(typeof data.properties.labelFrom == 'number' && typeof data.properties.labelTo == 'number' && 
					data.properties.labelFrom > data.properties.labelTo){
				data.properties.labelTo = data.properties.labelFrom;
			}
		  if(lang.isString(data.properties.labels)){ 
			  data.properties.labels = data.properties.labels.split(',');
			  for (var i = 0; i < data.properties.labels.length; i++ ) { 
				  data.properties.labels[i] = data.properties.labels[i].trim(); 
			  }
		  }
		}
		return data;
	}

};

return SpinWheelSlotHelper;

});