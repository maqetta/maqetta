define(["dojo/_base/declare",
        "dojo/data/util/simpleFetch"
   ],function(declare, SimpleFetch){
	var objectStore = declare("davinci.ui.widgets.ObjectStore", null,{
	
		labelName:"__LABEL",
		constructor: function(/* object */ keywordParameters){
	
		this._features = {'dojo.data.api.Read':true, 'dojo.data.api.Identity':true,
				'dojo.data.api.Write':true, 'dojo.data.api.Notification':true};
		this._jsonData = keywordParameters.data;
		this._items = this._jsonData.items;
		
	   	
		
		this._itemArray=[];
		for (var item in this._items)
		{
			
			var label=this._jsonData.labelMap[item];
			if (!label)
				label=item;
			this._itemArray.push({label:label, item:this._items[item]});
		}	
		
	},
	_fetchItems: function(	/* Object */ keywordArgs, 
			/* Function */ findCallback, 
			/* Function */ errorCallback){
		keywordArgs.count=this._itemArray.length;
		keywordArgs.start=0;
		findCallback(this._itemArray, keywordArgs);
	},
	
	getFeatures: function(){
		//	summary: 
		//		See dojo.data.api.Read.getFeatures()
		return this._features; //Object
	},
	
	getValue: function(	/* item */ item, 
			/* attribute-name-string */ attribute, 
			/* value? */ defaultValue){
		if (attribute==davinci.ui.widgets.ObjectStore.labelName)
			return item.label;
		return item.item[attribute];
	},
	
	itemForLabel : function (key)
	{
		for (var i=0;i<this._itemArray.length;i++)
		{
			if (key==this._itemArray[i].label)
				return this._itemArray[i].item;
		}
	},
	
	onSet: function(/* item */ item, 
			/*attribute-name-string*/ attribute, 
			/*object | array*/ oldValue,
			/*object | array*/ newValue){
	// summary: See dojo.data.api.Notification.onSet()
	
	// No need to do anything. This method is here just so that the 
	// client code can connect observers to it.
	},
	
	onNew: function(/* item */ newItem, /*object?*/ parentInfo){
	// summary: See dojo.data.api.Notification.onNew()
	
	// No need to do anything. This method is here just so that the 
	// client code can connect observers to it. 
	},
	
	onDelete: function(/* item */ deletedItem){
	// summary: See dojo.data.api.Notification.onDelete()
	
	// No need to do anything. This method is here just so that the 
	// client code can connect observers to it. 
	},
	
	newItem: function(/* Object? */ keywordArgs, /*Object?*/ parentInfo){
		var newItem;
		this._items.push(keywordArgs);
		this.onNew(newItem, parentInfo)
	},
	
	deleteItem: function(/* item */ item){
		for (var i=0;i<this._items.length;i++)
		{
			if (this._items[i]===item)
			{
				 this._items.splice(i,1);
				break;
			}
		}
		this.onDelete(item);
	},
	
	setValue: function(	/* item */ item, 
						/* string */ attribute,
						/* almost anything */ value){
		var oldValue=item[attribute];
		item[attribute]=value;
		this.onSet(item, attribute, oldValue, value);
	},
	
	setValues: function(/* item */ item,
						/* string */ attribute, 
						/* array */ values){
	},
	
	unsetAttribute: function(	/* item */ item, 
								/* string */ attribute){
	},
	
	save: function(/* object */ keywordArgs){
	},
	
	revert: function(){
		return false; // boolean
	},
	
	isDirty: function(/* item? */ item){
		return false; // boolean
	}
	
	
	
	});

	return dojo.extend(objectStore,SimpleFetch);
	
});
