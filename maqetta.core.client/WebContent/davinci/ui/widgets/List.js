define(["dojo/_base/declare",
        "dojox/widget/SortList"
  ],function(declare, SortList){
	return declare("davinci.ui.widgets.List", SortList, {
		singleSelect : false,
		postCreate:function(){
			if(this.store){
				if (this.store instanceof String)
					this.store=dojo.getObject(this.store);
				var _2={onItem:dojo.hitch(this,"_addItem"),onComplete:dojo.hitch(this,"onSort")};
				this.store.fetch(_2);
			}else{
				this.onSort();
			}
			dojo.addClass(this.domNode, "dijitContainer");
			dojo.addClass(this.domNode, this.baseClass);
	
			
			// if the store supports Notification, subscribe to the notification events
			if(this.store && this.store.getFeatures()['dojo.data.api.Notification']){
					this.connect(this.store, "onNew", "_onNewItem"),
					this.connect(this.store, "onDelete", "_onDeleteItem"),
					this.connect(this.store, "onSet",  "_onSetItem")
			 
			}
		},
	
		_handleClick: function(/* Event */e){
			if (this.singleSelect){
				this._selected = dojo.query("li.sortListItemSelected", this.containerNode);
				dojo.forEach(this._selected, function(node){
					dojo.toggleClass(node,"sortListItemSelected");
				}, this);
			}
	
			// summary: click listener for data portion of widget. toggle selected state
			//	of node, and update this.selected array accordingly
			dojo.toggleClass(e.target,"sortListItemSelected");
			e.target.focus();
			this._updateValues(e.target.innerHTML);
		},
		
		_onNewItem : function (){
			this._reload();
		},
		_onDeleteItem : function (){
			this._reload();
		},
		_onSetItem : function (){
			this._reload();
		},
		
		_reload: function(){
			var arr = dojo.query("li",this.domNode);
			dojo.forEach(arr, function(node){
				this.containerNode.removeChild(node);
			}, this);
	
				var _2={onItem:dojo.hitch(this,"_addItem"),onComplete:dojo.hitch(this,"onSort")};
				this.store.fetch(_2);
		}
	 
	});
});
