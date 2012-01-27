define(["dojo/_base/declare",
      
        "dojo/data/ItemFileReadStore",
        "dojo/i18n!davinci/ve/nls/ve",
        "dojo/i18n!dijit/nls/common"
        
       
],function(declare, ItemFileReadStore){

  return declare("davinci.ve.widgets.ColorStore", ItemFileReadStore, {
	
	constructor: function(args){
		this.clearValues();
		if(args.noncolors){
			this.noncolors = args.noncolors;
		}
		
		if(args.values){
			this.setValues(args.values);
		}
	},

	setValues: function(values){
		
		var items = [];
		var counter = 0;
		
		if(values) 
			this._values = values;
		
		dojo.forEach(this._values, dojo.hitch(this,function(v){
			var found = false;
			for(var i=0;!found && i<this.noncolors.length;i++){
				if(this.noncolors[i]==v)
					found = true;
			}
			if(found)
				items.push({name:v, value: v, label:v});
			else
				items.push({/*name: v,*/ value: v, name:v,  label:"<table><tr><td style='width:10em'>" + v +"</td><td style='width:10px;height:10px;background-color:" + v + "'></td></tr></table>"});

				
		}));
		
		this._jsonData = {identifier: "value", items: items};
		this._loadFinished = false;
	},

	/* insert an item at the given index */
	insert : function(atIndex, value){
	
		this._values.splice(atIndex, 0, value);
		
		this.setValues();
	},

	contains : function(item){
		for(var i = 0;i<this._values.length;i++){
			if(this._values[i]==item){
				return true;
			}
		}
		return false;
		
	},
	
	/* finds a value in the store that has the same units as specified value */

	getItemNumber : function(index){
		return this._values[index];
	}, 
	
	clearValues : function(){
		this._loadFinished = false;
	}
	
});
});