define(function() {

var ComboBoxHelper = function() {};
ComboBoxHelper.prototype ={
	
	create: function(widget, srcElement) {
		this.updateDataListWidget(widget);
		widget.domNode.style.display = '';
	},

	updateDataListWidget: function(widget) {
		var storeId;
		var value;
		
		var dojoProps;
		if (widget._params['data-dojo-props']){
			dojoProps = widget._params['data-dojo-props'].split(',');
		} else if(widget._params.properties['data-dojo-props']){
			dojoProps = widget._params.properties['data-dojo-props'].split(',');
		} else {
			throw('ComboBoxHelper: Error missing data-dojo-props');
		}
		var values = this.getStoreValues(dojoProps);
        if (widget._edit_context) {
            var ldijit = widget._edit_context.getDijit();
            var storeWidget = ldijit.byId(values.storeId);
            if (storeWidget) { // only replace the store if we find a new one.
                widget.dijitWidget.store = storeWidget;
            }
        }
		
		widget.domNode.value = values.value;
	},
	
	getStoreValues: function(dojoProps){
		var values = {};
		//"value:"Item 1", list:"DataList_1""
		var re = new RegExp('"', "g");
		for (var i = 0; i < dojoProps.length; i++){
			var prop = dojoProps[i].split(':'),
				result = prop[0].trim();
			if(result === 'list'){ 
				values.storeId =  prop[1].replace(re,'');
				values.storeId = values.storeId.trim();
			}else if(result === 'value'){
				values.value = prop[1].replace(re,'');
				values.value = values.value.trim();
			}
		}
		
		return values;
	},
	
	getData: function(widget, options) {
		var data = widget._getData(options);

		if (widget.dijitWidget.params['data-dojo-props']){
			data.properties['data-dojo-props'] = widget.dijitWidget.params['data-dojo-props'];
		} else {
			data.properties['data-dojo-props'] = 'value: "' + widget.dijitWidget.params.value +
					'", list: "' + widget.dijitWidget.params.list + '"';
		}

	    return data;
	}

};

return ComboBoxHelper;

});