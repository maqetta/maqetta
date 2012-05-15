define([
	"dojo/_base/declare",
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
		var command = this._getCreateCommand(args);
		this._context.getCommandStack().execute(command);
		this._select(this._dataGrid);
	},
	
	_getCreateCommand: function(args) {
		if(this._data.length !== 2){
			return;
		}
		
		var storeData = this._data[0],
			dataGridData = this._data[1];
		
		if(!this._context.loadRequires(storeData.type,true) /*|| !this._context.loadRequires(modelData.type,true)*/ ||
			!this._context.loadRequires(dataGridData.type,true)){
			return;
		}
	
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
		
		var dataGridId = Widget.getUniqueObjectId(dataGridData.type, this._context.getDocument());
		if(!dataGridData.properties){
			dataGridData.properties = { };
		}
		// <hack> Added to make new ve code happy, Widget.createWidget requires id in properties or context on data, but id didn't work when dragging second tree onto canvas so switched to context:
		// node.id= (data.properties && data.properties.id) || data.context.getUniqueID(srcElement); 
		//treeData.properties.id = treeId;
		dataGridData.context = this._context;
		// </hack>
	
		var store,
			dataGrid;
		
		var dj = this._context.getDojo();
		dojo.withDoc(this._context.getDocument(), function(){
			store = Widget.createWidget(storeData);
			dataGridData.properties.store = dj.getObject(storeId);
			if (this._useDataDojoProps) { 
				dataGridData.properties["data-dojo-props"] =
						DataStoreBasedWidgetInput.setPropInDataDojoProps(
								dataGridData.properties["data-dojo-props"], "store", storeId); 
			}
			this._augmentWidgetCreationProperties(dataGridData.properties);
			dataGrid = Widget.createWidget(dataGridData);
		}.bind(this));
		
		if(!store || !dataGrid){
			return;
		}
	
		var command = new CompoundCommand();
		var index = args.index;
		// always put store as first element under body, to ensure they are constructed by dojo before they are used
        var bodyWidget = Widget.getWidget(this._context.rootNode);
		//command.add(new davinci.ve.commands.AddCommand(store, bodyWidget, 0));
		command.add(new AddCommand(store, args.parent, index));
		index = (index !== undefined && index >= 0 ? index + 1 : undefined);
		command.add(new AddCommand(dataGrid, args.parent, index));
		
		if(args.position){
			var absoluteWidgetsZindex = this._context.getPreference('absoluteWidgetsZindex');
			command.add(new StyleCommand(dataGrid, [{position:'absolute'},{'z-index':absoluteWidgetsZindex}]));
			command.add(new MoveCommand(dataGrid, args.position.x, args.position.y));
		}
		if(args.size){
			command.add(new ResizeCommand(dataGrid, args.size.w, args.size.h));
		}
		this._dataGrid = dataGrid;
		/*this._context.getCommandStack().execute(command);
		this._select(dataGrid);*/
		return command;
	},
	
	_augmentWidgetCreationProperties: function(properties) {
		//Intended for subclass
	},
	
	addPasteCreateCommand: function(command, args) {
		this._context = this._data.context;
		var storeId = this._data.properties.store._edit_object_id;
		//var storeId = this._widget._srcElement.getAttribute("store"); 
		var storeWidget = Widget.byId(storeId);
		var storeData = storeWidget.getData();
		var data = [];
		data[0] = storeData;
		data[1] = this._data;
		this._data = data;
		command.add( this._getCreateCommand(args));
		return this._dataGrid;
	}

});

});