dojo.provide("davinci.ve.widgets.MultiTypeStore");

dojo.require("dojo.data.ItemFileWriteStore");




dojo.declare("davinci.ve.widgets.MultiTypeStore", dojo.data.ItemFileReadStore, {

	constructor: function(args){
		this._allValues = [];
		this.clearValues();
		if(args.values && args.units)
			this.setValues(args.values, args.units);
	},

	setValues: function(values, unit){
		for(var i=0;i<values.length;i++){
			davinci.Runtime.arrayAddOnce(this._allValues, values[i]);	
		}
		
		this._unit = unit;
		
		var items = [];
		dojo.forEach(this._allValues, function(v){
			var u = unit;
			var asString = "" + v;
			
			/* check for spaces (no value) and do not add units character */
			if((asString.replace(/^\s*/, '').replace(/\s*$/, ''))=="")
				u = "";
			
			items.push({name: ("" + v + u), value: ("" + v + u)});
		});
		this._jsonData = {identifier: "name", items: items};
		this._loadFinished = false;
	},
	
	
	contains : function(value){
		for(var i = 0;i<this._allValues.length;i++){
			
			if(this._allValues[i]  == value)
				return true;
			
		}
		return false;
	},
	
	clearValues : function(){
		this._allValues = [davinci.ve.widgets.MultiTypeStore.BLANK_VALUE];
		this._unit = null;
		this._loadFinished = false;
		
	}
	
});

davinci.ve.widgets.MultiTypeStore.BLANK_VALUE="     ";
