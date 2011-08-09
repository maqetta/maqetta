dojo.provide("davinci.libraries.dojo.dijit.form.HorizontalRuleLabelsHelper");

dojo.declare("davinci.libraries.dojo.dijit.form.HorizontalRuleLabelsHelper", null, {

	//
	create: function(widget, srcElement){
		var test = widget;
		//if label changes in properties palette, it'll come in as a string
		if(widget.dijitWidget.labels && typeof widget.dijitWidget.labels == "string"){
			var labelStr = widget.dijitWidget.labels;
			var strArray = labelStr.split(",");
			if(parseInt(widget.dijitWidget.count) != strArray.length){
				var lengthStr = strArray.length + "";
				widget.dijitWidget.count = strArray.length;
				widget.dijitWidget.params.count = lengthStr;
				widget._params.count = lengthStr;
				widget.dijitWidget.labels = strArray;
				widget.dijitWidget.params.labels = strArray;
				widget._params.labels = strArray;
				srcElement.setAttribute('labels', strArray);
			}
		}//may not need this part...
		if(widget.properties && widget.properties.labels && typeof widget.properties.labels == "string"){
			var labelStr = widget.properties.labels;
			var strArray = labelStr.split(",");
			widget.properties.count = strArray.length;
			widget.properties.labels = strArray;
		}
		//if count changes in properties palette
		
	}

	
	
});