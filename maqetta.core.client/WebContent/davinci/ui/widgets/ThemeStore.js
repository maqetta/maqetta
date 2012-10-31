define(["dojo/_base/declare",
        "dojo/data/ItemFileReadStore"
],function(declare){
	
	return declare("davinci.ui.widgets.ThemeStore", ItemFileReadStore, {
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
});