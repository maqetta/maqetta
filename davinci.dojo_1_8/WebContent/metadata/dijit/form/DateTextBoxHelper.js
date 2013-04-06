define(function() {

var DateTxtBoxHelper = function() {};
DateTxtBoxHelper.prototype = {

	getData: function(/*Widget*/ widget, /*Object*/ options) {

		var data = widget._getData( options);
		data.properties.value = widget.getPropertyValue('value');
		if (data.properties.value && data.properties.value.toISOString) {
			if (widget.type == 'dijit/form/DateTextBox') {
				data.properties.value = data.properties.value.toISOString().substring(0, 10);
			} else if (widget.type == 'dijit/form/TimeTextBox'){
				data.properties.value = "T" + data.properties.value.toTimeString().substring(0, 8);
			} else {
				data.properties.value = data.properties.value.toISOString();
			}
		}
		return data;
	}

};

return DateTxtBoxHelper;

});