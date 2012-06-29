define(["davinci/ve/widget",
		"davinci/ve/commands/RemoveCommand",
		"davinci/commands/CompoundCommand",
		"../dojo/data/DataStoreBasedWidgetInput",
		"davinci/ve/commands/ReparentCommand",
		],
function(Widget, RemoveCommand, CompoundCommand, DataStoreBasedWidgetInput, ReparentCommand){

var TreeHelper = function() {};
TreeHelper.prototype = {

	/*
	 * Called by DeleteAction when widget is deleted.
	 * @param {davinci.ve._Widget} widget  Widget that is being deleted
	 * @return {davinci.commands.CompoundCommand}  command that is to be added to the command stack.
	 * 
	 * This widget has a data store and a model widget that are associated with it and must be deleted also.
	 */
	getRemoveCommand: function(widget) {
		
		var command = new CompoundCommand();
		var modelId = widget.domNode._dvWidget._srcElement.getAttribute("model");
		var modelWidget = Widget.byId(modelId);
		var storeId = modelWidget._srcElement.getAttribute("store");
		var storeWidget = Widget.byId(storeId);
		// order is important for undo... 
		command.add(new RemoveCommand(widget));
		command.add(new RemoveCommand(modelWidget));
		command.add(new RemoveCommand(storeWidget));
		return command;
		
	}, 
	
	/*
	 * Called  when widget is created.
	 * @param {davinci.ve._Widget} widget  Widget that is being created
	 * @param {} source element  Widget that is being created
	 * @param {} 
	 * 
	 * This widget has a data store and a model widget that are associated with it and must be created before the Tree.
	 */
	create: function(widget, srcElement, useDataDojoProps){ 

		try{
			this.reparent(widget, useDataDojoProps);
		} 
		catch (e) {
			console.error('TreeHelper.Create error processing tree.');
		}
	},
	
	/*
	 * Called by Reparent command when widget is reparent.
	 * @param {davinci.ve._Widget} widget  Widget that is being reparentted
	 * 
	 * This widget has a data store and a model widget that are associated with it and must be reparented also.
	 */
	reparent: function(widget, useDataDojoProps){ 

		try{
			var modelId = "";
			if (widget.dijitWidget && widget.dijitWidget.model) {
				var model = widget.dijitWidget.model;
				modelId = model.id ? model.id : model._edit_object_id;
			}
			if(modelId){
				// we may have the model as an object
				dojo.withDoc(widget.getContext().getDocument(), function(){
					var modelWidget = modelId.declaredClass ? Widget.byId(modelId.id) : Widget.byId(modelId);
					if (modelWidget && widget.dijitWidget && widget.dijitWidget.model){
						this._reparentWidget(widget, modelWidget);
						var storeId = modelWidget._srcElement.getAttribute('store');
						if(storeId){
							// we may have the store as an object
							var storeWidget = storeId.declaredClass ? Widget.byId(storeId.id) : Widget.byId(storeId);
								if (storeWidget ){
									this._reparentWidget(modelWidget, storeWidget);
								}
						}
					}
				}.bind(this));
			}
			
			} 
			catch (e) {
				console.error('TreeHelper.Reparent error processing tree.');
			}
	},
	/*
	 * Called  to reparent the widget
	 * @param {davinci.ve._Widget} widget  Widget that is being created
	 * @param {davinci.ve._Widget} widget associated with parm 1 eg. ForestModel or store
	 * @param {} 
	 * 
	 * This widget has a data store and a model widget that are associated with it and must be created before the Tree.
	 */
	_reparentWidget: function(widget, assocatedWidget) {
		var parent = widget.getParent();
		var assocatedParent = assocatedWidget.getParent();
		var newIndex = (parent.indexOf(widget) < 1) ? 0 : parent.indexOf(widget)-1;
		var i = parent.indexOf(widget);
		var x = assocatedParent.indexOf(assocatedWidget);
		if ((parent === assocatedParent) && (i < x )){ // same parent
			newIndex = parent.indexOf(widget);
		} else if (parent != assocatedParent) {
			newIndex = i;
		}
		var command = new ReparentCommand(assocatedWidget, parent, newIndex);
		command.execute();
	}/*,
	
	updateStore: function(widget, storeWidget, w, useDataDojoProps){
		var store = widget.dijitWidget.store;
		var data = storeWidget._srcElement.getAttribute('data'); 
		var url = storeWidget._srcElement.getAttribute('url');
		if (data){ 
			var value = data; 
			var storeData = eval('storeData = '+value);
			data = { identifier: storeData.identifier, items:[] };
		
			var items = data.items;
			var storeDataItems = storeData.items;
			for (var r = 0; r < storeDataItems.length; r++){
				var item = {};
				var dataStoreItem = storeDataItems[r];
				for (var name in dataStoreItem){
					item[name] = dataStoreItem[name];
				}
				items.push(item);
			}
			
			setTimeout(dojo.hitch(this, function(){
				// #1691 this bit of code is to give up control of the thread so FF can draw the grid
				// then we can update the store..
				store.clearOnClose = true;
				store.data = data;
				delete store.url; // wdr remove old url if switching
				store.close();
				widget.dijitWidget.setStore(store);
			}), 0);

		}else{ // must be url data store
			store.clearOnClose = true;
			store.url = url; 
			delete store.data; // wdr remove old url if switching
			store.close();
		}
	}*/

};

return TreeHelper;

});