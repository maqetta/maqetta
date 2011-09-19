dojo.provide("davinci.ui.widgets.ThemeStore");
dojo.require("dojo.data.ItemFileWriteStore");

dojo.declare("davinci.ui.widgets.ThemeStore", dojo.data.ItemFileReadStore, {
	constructor: function(args){
		this._allValues = [];
		if(args.values)
		this.setValues(args.values);
	},

	setValues: function(values){
		var data = [];
		for(var i=0;i<values.length;i++){
			data[i] = {};
			data[i]['name'] = values[i]['name'] + " " +  values[i]['version'];
			data[i]['value'] = i;
		}
		
		this._jsonData = {label:'name', identifier: "value", items: data};
		this._loadFinished = false;
	}
});
