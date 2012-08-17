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
	"../../dojo/data/DataStoreBasedWidgetInput"
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
	DataStoreBasedWidgetInput
) {

return declare(CreateTool, {
	_useDataDojoProps: false,

	constructor: function(data) {
		this._resizable = "both";
	},
	
	_create: function(args) {	
		this._loadRequires().then(dojo.hitch(this, function(results) {
			if (!dojo.some(results, function(arg){return !arg;})) {
				// all args are valid
				this._getCreateCommand(args).then(function(command) {
					this._context.getCommandStack().execute(command);
					this._select(this._dataGrid);
				}.bind(this));
			} else {
				console.log("DataGridCreateTool:_loadRequires failed to load all requires");
			}
		}));
	},
	
	_getCreateCommand: function(args) {
		var deferred = new Deferred();
		
		if(this._data.length !== 2){
			return;
		}
		
		var storeData = this._data[0];
		var dataGridData = this._data[1];
		
		var storeId = Widget.getUniqueObjectId(storeData.type, this._context.getDocument());
		if(!storeData.properties){
			storeData.properties = {};
		}
		storeData.properties.jsId = storeId;
		storeData.properties.id = storeId;
		storeData.context = this._context;

		if (storeData.properties.data) { // might be url
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
		}

		if(!dataGridData.properties){
			dataGridData.properties = { };
		}
		// <hack> Added to make new ve code happy, Widget.createWidget requires id in properties or context on data, but id didn't work when dragging second tree onto canvas so switched to context:
		// node.id= (data.properties && data.properties.id) || data.context.getUniqueID(srcElement); 
		//treeData.properties.id = treeId;
		dataGridData.context = this._context;
		// </hack>
	
		var store = undefined;
		var dataGrid = undefined;

		finish = function(store, dataGrid) {
			if(!store || !dataGrid){
				deferred.reject("DataGridCreateTool:_getCreateCommand failed to create either store and/or grid.");
				return;
			}
			
			var command = new CompoundCommand();
			var index = args.index;
			command.add(new AddCommand(store, args.parent, index));
			index = (index !== undefined && index >= 0 ? index + 1 : undefined);
			command.add(new AddCommand(dataGrid, args.parent, index));
			
			if(args.position){
				var absoluteWidgetsZindex = this._context.getPreference('absoluteWidgetsZindex');
				command.add(new StyleCommand(dataGrid, [{position:'absolute'},{'z-index':absoluteWidgetsZindex}]));
				command.add(new MoveCommand(dataGrid, args.position.x, args.position.y));
			}
			args.size = this._getInitialSize(dataGrid, args);
			if(args.size){
				command.add(new ResizeCommand(dataGrid, args.size.w, args.size.h));
			}
			this._dataGrid = dataGrid;
			
			deferred.resolve(command);
		}.bind(this);
		
		var dj = this._context.getDojo();
		dojo.withDoc(this._context.getDocument(), function(){
			store = Widget.createWidget(storeData);
		});
		dataGridData.properties.store = dj.getObject(storeId);
		if (this._useDataDojoProps) { 
			var dataDojoProps = dataGridData.properties["data-dojo-props"];
			dataDojoProps =
					DataStoreBasedWidgetInput.setPropInDataDojoProps(
							dataDojoProps, "store", storeId); 
			
			//Put updated data-dojo-props back into the widget's properties
			dataGridData.properties["data-dojo-props"] = dataDojoProps;
			
			//Parse data-dojo-props, get the structure, and put it into widget's properties
			var dataDojoPropsEval = dj.eval("({" + dataDojoProps + "})");
			dataGridData.properties.structure = dataDojoPropsEval.structure;				
		}
			
		this._augmentWidgetCreationProperties(dataGridData.properties).then(function() {
			dojo.withDoc(this._context.getDocument(), function(){
				dataGrid = Widget.createWidget(dataGridData);
			});
			finish(store, dataGrid);
		}.bind(this));
	
		return deferred.promise;
	},
	
	_augmentWidgetCreationProperties: function(properties) {
		//Intended for subclass
	},
	
	addPasteCreateCommand: function(command, args) {
		this._context = this._data.context;
		var store = this._data.properties.store;
		var storeId = store.id ? store.id : store._edit_object_id;
		var storeWidget = Widget.byId(storeId);
		var storeData = storeWidget.getData();
		this._data = [storeData, this._data];

		var deferred = new Deferred();

		this._loadRequires().then(dojo.hitch(this, function(results) {
			if (!dojo.some(results, function(arg){return !arg;})) {
				// all args are valid
				this._getCreateCommand(args).then(function(createCommand) {
					command.add(createCommand);
					
					// pass back the container
					deferred.resolve(this._dataGrid);
				}.bind(this));
			} else {
				deferred.reject("DataGridCreateTool:_loadRequires failed to load all requires");
			}
		}));

		return deferred.promise;
	},

	_loadRequires: function() {
		var promises = [];

		if (this._data.length == 2) {
			var storeData = this._data[0];
			promises.push(this._context.loadRequires(storeData.type, true));
			
			var dataGridData = this._data[1];
			promises.push(this._context.loadRequires(dataGridData.type, true));
		}

		return all(promises);
	}
});

});