define([
	"dojo/_base/declare",
	"dojo/Deferred",
	"dojo/promise/all",
	"davinci/ve/tools/CreateTool",
	"davinci/ve/widget",
	"davinci/commands/CompoundCommand",
	"davinci/ve/commands/AddCommand",
	"davinci/ve/commands/MoveCommand",
	"davinci/ve/commands/ResizeCommand",
	"davinci/ve/commands/StyleCommand",
	"./TreeHelper"
], function(
	declare,
	Deferred,
	all,
	CreateTool,
	Widget,
	CompoundCommand,
	AddCommand,
	MoveCommand,
	ResizeCommand,
	StyleCommand,
	TreeHelper
) {

return declare(CreateTool, {

	constructor: function(data){
		this._resizable = "both";
		
		this._treeHelper = new TreeHelper();
	},
	
	_create: function(args){
		this._loadRequires().then(dojo.hitch(this, function(results) {
			if (results.every(function(arg){return arg;})) {
				// all args are valid
				var command = this._getCreateCommand(args);
				this._context.getCommandStack().execute(command);
				this._select(this._tree);	
				
				// take steps to make sure the selection chrome gets reset as tree loads
				this._treeHelper._updateTreeSelectionChrome(this._context, this._tree);
			} else {
				console.log("TreeCreateTool:_loadRequires failed to load all requires");
			}
		}));
	},

	_getCreateCommand: function(args){
		if(this._data.length !== 3){
			return;
		}
		
		var storeData = this._data[0];
		var modelData = this._data[1];
		var treeData = this._data[2];

		var storeId = Widget.getUniqueObjectId(storeData.type, this._context.getDocument());
		if(!storeData.properties){
			storeData.properties = {};
		}
		storeData.properties.jsId = storeId;
		storeData.properties.id = storeId;
		storeData.context = this._context;
		
		var modelId = Widget.getUniqueObjectId(modelData.type, this._context.getDocument());
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

		var store,
			model,
			tree;
		
		var dj = this._context.getDojo();
		dojo.withDoc(this._context.getDocument(), function(){
			//Set-up store
			this._treeHelper._addStoreScriptBlocks(storeData);
			store = Widget.createWidget(storeData);
			
			//Set-up model
			modelData.properties.store = dj.getObject(storeId);
			this._treeHelper._addStoreFunctions(modelData.properties.store);
			this._treeHelper._addModelScriptBlocks(modelData);
			model = Widget.createWidget(modelData);
			
			//Set-up tree
			treeData.properties.model = dj.getObject(modelId);
			this._treeHelper._addModelFunctions(treeData.properties.model);
			tree = Widget.createWidget(treeData);
		}.bind(this));
		
		if(!store || !model || !tree){
			return;
		}

		var command = new CompoundCommand();
		var index = args.index;
		// always put store and model as first element under body, to ensure they are constructed by dojo before they are used
       // var bodyWidget = Widget.getWidget(this._context.rootNode);
		command.add(new AddCommand(store, args.parent, index));
		index = (index !== undefined && index >= 0 ? index + 1 : undefined);
		command.add(new AddCommand(model, args.parent, index));
		index = (index !== undefined && index >= 0 ? index + 1 : undefined);
		command.add(new AddCommand(tree, args.parent, index));
        
		// If preference says to add new widgets to the current custom state,
		// then add appropriate StyleCommands
		CreateTool.prototype.checkAddToCurrentState(command, tree);	
		
		if(args.position){
			var absoluteWidgetsZindex = this._context.getPreference('absoluteWidgetsZindex');
			command.add(new StyleCommand(tree, [{position:'absolute'},{'z-index':absoluteWidgetsZindex}]));
			command.add(new MoveCommand(tree, args.position.x, args.position.y));
		}
		args.size = this._getInitialSize(tree, args);
		if(args.size){
			command.add(new ResizeCommand(tree, args.size.w, args.size.h));
		}
		
		this._tree = tree;

		return command;
	},
	
	addPasteCreateCommand: function(command, args){
		this._context = this._data.context;
		
		// Look for cut/copied store data to associate with the base widget, and build up
		// an array of data items
		if (this._data.associatedCopiedWidgetData) {
			//FIXME: use concat instead of forEach/push
			var data = [];
			dojo.forEach(this._data.associatedCopiedWidgetData, function(associatedDataItem) {
				data.push(associatedDataItem);
			});
			data.push(this._data);
			this._data = data;
		}

		var deferred = new Deferred();

		this._loadRequires().then(function(results) {
			if (results.every(function(arg){return arg;})) {
				// all args are valid
				command.add(this._getCreateCommand(args));
				
				// pass back the tree
				deferred.resolve(this._tree);
			} else {
				deferred.reject(new Error("TreeCreateTool:_loadRequires failed to load all requires"));
			}
		}.bind(this));

		return deferred.promise;
	},

	_loadRequires: function() {
		return all(this._data.map(function(item) {
			return this._context.loadRequires(item.type, true);
		}, this));
	}
});

});