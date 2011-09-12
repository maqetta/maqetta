dojo.provide("davinci.libraries.dojo.dijit.TreeCreateTool");

dojo.require("davinci.ve.widget");
dojo.require("davinci.commands.CompoundCommand");
dojo.require("davinci.ve.commands.AddCommand");
dojo.require("davinci.ve.commands.MoveCommand");
dojo.require("davinci.ve.commands.ResizeCommand");
dojo.require("davinci.ve.tools.CreateTool");

dojo.declare("davinci.libraries.dojo.dijit.TreeCreateTool", davinci.ve.tools.CreateTool, {

	constructor: function(data){
		this._resizable = "both";
	},
	
	_create: function(args){
		
		var command = this._getCreateCommand(args);
		this._context.getCommandStack().execute(command);
		this._select(this._tree);
	},

	_getCreateCommand: function(args){
		if(this._data.length !== 3){
			return;
		}
		
		var storeData = this._data[0];
		var modelData = this._data[1];
		var treeData = this._data[2];
		
		if(!this._context.loadRequires(storeData.type,true) || !this._context.loadRequires(modelData.type,true) ||
			!this._context.loadRequires(treeData.type,true)){
			return;
		}

		var storeId = davinci.ve.widget.getUniqueObjectId(storeData.type, this._context.getDocument());
		if(!storeData.properties){
			storeData.properties = {};
		}
		storeData.properties.jsId = storeId;
		storeData.properties.id = storeId;
		storeData.context = this._context;
		
		var data = storeData.properties.data;
		var items = data.items;
		
		// Kludge to workaround lack of support for frames in dojo's ItemFileReadStore
		// Replaces objects and arrays in metadata that were created with the top context with ones created in the frame context
		var copyUsingFrameObject = dojo.hitch(this, function (items) {
			var win = this._context.getGlobal();
			var copyOfItems = win.eval("[]");
			for (var i = 0; i < items.length; i++) {
				var item = items[i];
				var object = win.eval("new Object()");
				var copy = this._context.getDojo().mixin(object, item);
				copyOfItems.push(copy);
				if (copy.children) {
					copy.children = copyUsingFrameObject(copy.children);
				}
			}
			return copyOfItems;
		});
		data.items = copyUsingFrameObject(items);
		
		var modelId = davinci.ve.widget.getUniqueObjectId(modelData.type, this._context.getDocument());
		if(!modelData.properties){
			modelData.properties = {};
		}
		modelData.properties.jsId = modelId;
		modelData.properties.id = modelId;
		modelData.context = this._context;
		
		if(!treeData.properties){
			treeData.properties = { };
		}
		treeData.context = this._context;

		var store = undefined;
		var model = undefined;
		var tree = undefined;
		
		var dj = this._context.getDojo();
		dojo.withDoc(this._context.getDocument(), function(){
			store = davinci.ve.widget.createWidget(storeData);
			modelData.properties.store = dj.getObject(storeId);
			model = davinci.ve.widget.createWidget(modelData);
			treeData.properties.model = dj.getObject(modelId);
			tree = davinci.ve.widget.createWidget(treeData);
		});
		
		if(!store || !model || !tree){
			return;
		}

		var command = new davinci.commands.CompoundCommand();
		var index = args.index;
		// always put store and model as first element under body, to ensure they are constructed by dojo before they are used
       // var bodyWidget = davinci.ve.widget.getWidget(this._context.rootNode);
		command.add(new davinci.ve.commands.AddCommand(store, args.parent, index));
		index = (index !== undefined && index >= 0 ? index + 1 : undefined);
		command.add(new davinci.ve.commands.AddCommand(model, args.parent, index+1));
		index = (index !== undefined && index >= 0 ? index + 1 : undefined);
		command.add(new davinci.ve.commands.AddCommand(tree, args.parent, index+2));
		
		if(args.position){
			command.add(new davinci.ve.commands.MoveCommand(tree, args.position.x, args.position.y));
		}
		if(args.size){
			command.add(new davinci.ve.commands.ResizeCommand(tree, args.size.w, args.size.h));
		}
		
		//this._context.getCommandStack().execute(command);

		//this._select(tree);
		this._tree = tree;
		return command;
	},
	
	addPasteCreateCommand: function(command, args){

		this._context = this._data.context;
		var model = this._data.properties.model;
		var modelWidget = davinci.ve.widget.byId(model.id);
		var modelData = modelWidget.getData();
		var storeWidget = davinci.ve.widget.byId(model.store._edit_object_id);
   		var storeData = storeWidget.getData();
   		var data = [];
   		data[0] = storeData;
   		data[1] = modelData;
   		data[2] = this._data;
   		this._data = data;
   		command.add( this._getCreateCommand(args));
   		return this._tree;

	}
	

});
