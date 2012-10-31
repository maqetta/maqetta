define(["dojo/_base/declare",
        "dojo/data/util/simpleFetch"
   ],function(declare, SimpleFetch){
	var arrayStore= declare("davinci.ui.widgets.ArrayStore", null,{
		constructor: function(/* object */ keywordParameters){
	
		this._features = {'dojo.data.api.Read':true, 'dojo.data.api.Identity':true,
				'dojo.data.api.Write':true, 'dojo.data.api.Notification':true};
		this._jsonData = keywordParameters.data;
		this._items = this._jsonData.items;
		
		},
		_fetchItems: function(	/* Object */ keywordArgs, 
				/* Function */ findCallback, 
				/* Function */ errorCallback){
			keywordArgs.count=this._items.length;
			keywordArgs.start=0;
			findCallback(this._items, keywordArgs);
		},
		
		getFeatures: function(){
			//	summary: 
			//		See dojo.data.api.Read.getFeatures()
			return this._features; //Object
		},
		
		getValue: function(	/* item */ item, 
				/* attribute-name-string */ attribute, 
				/* value? */ defaultValue){
			return item[attribute];
		},
		
		itemForLabel : function (key)
		{
			for (var i=0;i<this._items.length;i++)
			{
				if (key==this._items[i][this._jsonData.label])
					return this._items[i];
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
	return dojo.extend(arrayStore,SimpleFetch);
});