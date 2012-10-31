define(["dojo/_base/declare",
		"dojo/data/ItemFileReadStore",
  ],function(declare, ItemFileReadStore){
	return declare("davinci.ui.widgets.ProjectDataStore",  ItemFileReadStore, {
		constructor: function(args){
			this.clearValues();
			if(args.values){
				this.setValues(args.values);
			}
		},
	
		setValues: function(values){
			var items = [];
			
			
			if(values) 
				this._values = values;
			
			dojo.forEach(this._values, dojo.hitch(this,function(v){
				items.push({name: v.name, value: v.name});
			}));
			
			this._jsonData = {identifier: "name", items: items};
			this._loadFinished = false;
		},
		modifyItem : function(oldValue, newValue){
			for(var i = 0;i<this._values.length;i++){
				if(this._values[i]==oldValue){
					this._values[i] = newValue;
				}
			}
			this.setValues();
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
	
		getItemNumber : function(index){
			return this._values[index];
		}, 
		
		clearValues : function(){
			this._loadFinished = false;
		}
		
	});
});