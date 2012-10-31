define(["dojo/_base/declare",
        "dojo/data/ItemFileReadStore",
        "dojo/i18n!davinci/ve/nls/ve",
        "dojo/i18n!dijit/nls/common"
        
       
],function(declare,   ItemFileReadStore, veNLS,commonNLS){
	return declare("davinci.ve.widgets.MutableStore", ItemFileReadStore, {
		
		constructor: function(args){
			this.clearValues();
			if(args.divider){
				this.divider = args.divider;
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
				items.push({name: v, value: v, id: counter++});
			}));
			
			this._jsonData = {identifier: "id", items: items};
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
		
		/* finds a value in the store that has the same units as specified value */
		findSimilar : function(value){
			
			var	numbersOnlyRegExp = new RegExp(/(\D*)(-?)(\d+)(\D*)/);
			var numberOnly = numbersOnlyRegExp.exec(value);
			
			if(!numberOnly)
				return;
			var	unitRegExp = new RegExp( (numberOnly.length>0?numberOnly[1]:"") + "(-?)(\\d+)" + (numberOnly.length>3?numberOnly[4]:""));
			for(var i = 0;i<this._values.length;i++){
				if(unitRegExp.test(this._values[i])){
					return this._values[i];
				}
			}
		},
		getItemNumber : function(index){
			return this._values[index];
		}, 
		
		clearValues : function(){
			this._loadFinished = false;
		}
		
	});
});