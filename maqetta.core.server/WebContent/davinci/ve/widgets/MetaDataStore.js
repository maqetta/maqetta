dojo.provide("davinci.ve.widgets.MetaDataStore");

dojo.require("dojo.data.ItemFileWriteStore");

dojo.declare("davinci.ve.widgets.MetaDataStore", dojo.data.ItemFileReadStore, {
	_allValues : [],

	constructor: function(args){
		this.setValues((args && args.values) || []);
	},

	setValues: function(values){
		dojo.mixin(this._allValues, values);

		var items = [];
		dojo.forEach(this._allValues, function(v){
			items.push({name: v, value: v});
		});
		this._jsonData = {identifier: "name", items: items};
		
		this._loadFinished = false;
	},
	
	contains: function(value){
		return dojo.indexOf(this._allValues, value) != -1;
	},
	
	clearValues: function(){
		this._allValues = [];
		this._loadFinished = false;
	}
});
