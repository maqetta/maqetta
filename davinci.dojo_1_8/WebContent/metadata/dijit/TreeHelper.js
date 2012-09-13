define(["davinci/ve/widget",
		"davinci/ve/commands/RemoveCommand",
		"davinci/commands/CompoundCommand",
		"../dojo/data/DataStoreBasedWidgetInput",
		"./HTMLSubElementHelper",
		"davinci/ve/commands/ReparentCommand"
		],
function(Widget, RemoveCommand, CompoundCommand, DataStoreBasedWidgetInput, HTMLSubElementHelper, ReparentCommand){

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
	 * Called by Reparent command when widget is reparent.
	 * @param {davinci.ve._Widget} widget  Widget that is being reparentted
	 * 
	 * This widget has a data store and a model widget that are associated with it and must be reparented also.
	 */
	reparent: function(widget){ 
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
							if (!storeWidget) {
								// the jsId doesn't necessarily have to be the id of the store widget
								if (widget.dijitWidget.model.store && widget.dijitWidget.model.store.id) {
									storeWidget = Widget.byId(widget.dijitWidget.model.store.id);
								}
							}
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
	}, /*,
	
	updateStore: function(widget, storeWidget, w){
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
	
	// We need to provide getChildrenData because we're relying on <script> elements in the declarative HTML. We'll
	// delegate to HTMLSubElementHelper
	getChildrenData: function(/*Widget*/ widget, /*Object*/ options){
		if (!this._htmlSubElementHelper) {
			this._htmlSubElementHelper = new HTMLSubElementHelper();
		}
		return this._htmlSubElementHelper.getChildrenData(widget, options);
	},
	
	//The actual model object sometimes finds it's way into the source 
	//element, and we really need the id to be written out to the HTML source
	//instead of the string "[Object]"
	cleanSrcElement: function(srcElement) {
		var model = srcElement.getAttribute("model");
		if (model && model.id) {
			srcElement.setAttribute("model", model.id);
		}
	},
	
	//**************************************************************************************/
	// Some "private helpers reserved for use only by other tree-related meta data classes 
	//*************************************************************************************/
	_updateTreeSelectionChrome: function(context, tree) {
		// If autoExpand is on and height is auto, then the tree's height will change during 
		// initialization which messes up the selection chrome. So, let's take steps to make
		// sure the selection chrome gets reset.
		tree.dijitWidget.onLoadDeferred.then(function(){
		    setTimeout(function() {
				var selection = context.getSelection();
				dojo.some(selection, function(selectedItem, index) {
					if(selectedItem == tree){
						context.updateFocus(tree, index);
						return true;
					}
				}.bind(this));
			}.bind(this), 0);
		}.bind(this));
	},

	_createScriptBlockData: function(methodType, dojoEvent, argNames, jsString) {
		var data = {
			type: "html.script",
			properties: {
				type: methodType
			},
			children: jsString
		};
		data.properties["data-dojo-event"] = dojoEvent;
		data.properties["data-dojo-args"] = argNames;
		return data;
	},
	
	_addStoreScriptBlocks: function(storeData) {
		if (!storeData.children) {
			storeData.children = [];
		}
		
		var jsString = "return this.query({parent: this.getIdentity(item)});";
		storeData.children.push(this._createScriptBlockData("dojo/method", "getChildren", "item", jsString));
	},
	
	_addStoreFunctions: function(store) {
		if (!store.getChildren) {
			store.getChildren = this._getFunctionForGetChildren(); 
		}
	},
	
	_getFunctionForGetChildren: function() {
		return function(object) {return this.query({parent: object.id});}; 
	},

	_addModelScriptBlocks: function(modelData) {
		if (!modelData.children) {
			modelData.children = [];
		}
		
		var jsString = "return !item.leaf;";
		modelData.children.push(this._createScriptBlockData("dojo/method", "mayHaveChildren", "item", jsString));
	},
	
	_addModelFunctions: function(model) {
		model.mayHaveChildren = this._getFunctionForMayHaveChildren();
	},
	
	_getFunctionForMayHaveChildren: function() {
		return function(item) {return !item.leaf;};
	},
};

return TreeHelper;

});