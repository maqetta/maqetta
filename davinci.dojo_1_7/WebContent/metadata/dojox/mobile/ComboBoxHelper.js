dojo.provide("davinci.libraries.dojo.dojox.mobile.ComboBoxHelper");
dojo.require("davinci.ve.tools.CreateTool");


dojo.declare("davinci.libraries.dojo.dojox.mobile.ComboBoxHelper", null, {

	
	create: function(widget, srcElement){

		this.updateDataListWidget(widget);
		
		widget.domNode.style.display = '';

	},

	updateDataListWidget: function(widget){
		
		var storeId;
		var value;
		
		var dojoProps;
		if (widget._params['data-dojo-props']){
			dojoProps = widget._params['data-dojo-props'].split(',');
		} else if(widget._params.properties['data-dojo-props']){
			dojoProps = widget._params.properties['data-dojo-props'].split(',');
		} else {
			throw('ComboBoxHelper: Error missing data-dojo-props')
			
		}
		//"value:"Item 1", list:"DataList_1""
		var patt= new RegExp('^[ \s]+|[ \s]+$', "g");
		var re = new RegExp('"', "g");
		for (var i = 0; i < dojoProps.length; i++){
			var prop = dojoProps[i].split(':');
			var result = prop[0].replace(patt, '');
			if(result === 'list'){ 
				storeId =  prop[1].replace(re,'');
				storeId = storeId.replace(patt, '');
			}else if(result === 'value'){
				value = prop[1].replace(re,'');
				value = value.replace(patt, '');
			}
		}
		var storeWidget = davinci.ve.widget.byId(storeId);
		if(storeWidget.dijitWidget){ // only replace the store if we find a new one. 
			widget.dijitWidget.store = storeWidget.dijitWidget;
		}
		widget.domNode.value = value;

		
	},
	
	getData: function(widget, options){

		var data = widget._getData(options);

		if (widget.dijitWidget.params['data-dojo-props']){
			data.properties['data-dojo-props'] = widget.dijitWidget.params['data-dojo-props'];
		} else {
			data.properties['data-dojo-props'] ='value: "'+widget.dijitWidget.params.value+'", list: "'+widget.dijitWidget.params.list+'"';
		}
	

	    return data;
		
	}

});