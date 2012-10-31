define(["dojo/_base/declare",
        "dojo/data/ItemFileReadStore"
],function(declare, ItemFileReadStore){
	var MultiTypeStore = declare("davinci.ve.widgets.MultiTypeStore", ItemFileReadStore, {
	
		constructor: function(args){
			this._allValues = [];
			this.clearValues();
			if(args.values && args.units) {
				this.setValues(args.values, args.units);
			}
		},
	
		setValues: function(values, unit){
			values.forEach(function(item){
	            if (this._allValues.indexOf(item) === -1) {
	            	this._allValues.push(item);
	            }
			}, this);
			
			this._unit = unit;
			
			var items = [];
			dojo.forEach(this._allValues, function(v){
				var u = unit,
					asString = "" + v;
				
				/* check for spaces (no value) and do not add units character */
				if((asString.replace(/^\s*/, '').replace(/\s*$/, ''))=="") {
					u = "";
				}

				items.push({name: ("" + v + u), value: ("" + v + u)});
			});
			this._jsonData = {identifier: "name", items: items};
			this._loadFinished = false;
		},
		
		
		contains: function(value){
			return this._allValues.indexOf(value) != -1;
		},
		
		clearValues: function(){
			this._allValues = [davinci.ve.widgets.MultiTypeStore.BLANK_VALUE];
			this._unit = null;
			this._loadFinished = false;
		}
	});
	return dojo.mixin(MultiTypeStore,{BLANK_VALUE:"     "});
});