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
	"davinci/ve/tools/CreateTool",
	"./DataStoreBasedWidgetInput"
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
	CreateTool,
	DataStoreBasedWidgetInput
) {

return declare(CreateTool, {
	_useDataDojoProps: false,
	
	// AWE TODO: temporary with intent to help debug difficult to reproduce timing issue on test server when
	// GridX is first created with empty cache.
	_debug: false,

	constructor: function(data) {
		this._resizable = "both";
	},
	
	_create: function(args) {	
		if(this._data.length !== 2){
			console.error("DataStoreBasedCreateTool:_create incorrect number of items in this._data.");
			return;
		}
		
		if (this._debug) {
			console.error("!!!!!!!!!DataStoreBasedCreateTool::_create BEFORE this._loadRequires()");
		}
		this._loadRequires().then(dojo.hitch(this, function(results) {
			if (this._debug) {
				console.error("******** DataStoreBasedCreateTool::_create ALL promises fulfilled!");
			}
			if (results.every(function(arg){return arg;})) {
				// all args are valid
				this._getCreateCommand(args).then(function(command) {
					this._context.getCommandStack().execute(command);
					this._select(this._widget);
				}.bind(this));
			} else {
				console.error("DataStoreBasedCreateTool:_loadRequires failed to load all requires");
			}
		}));
	},
	
	//We're making _getCreateCommand async here to support _augmentWidgetCreationProperties (for GridX)
	_getCreateCommand: function(args) {
		var deferred = new Deferred();

		var storeData = this._data[0];
		var widgetData = this._data[1];
		
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

		if(!widgetData.properties){
			widgetData.properties = { };
		}
		// <hack> Added to make new ve code happy, Widget.createWidget requires id in properties or context on data, but id didn't work when dragging second tree onto canvas so switched to context:
		// node.id= (data.properties && data.properties.id) || data.context.getUniqueID(srcElement); 
		//treeData.properties.id = treeId;
		widgetData.context = this._context;
		// </hack>
	
		var store, 
			dataStoreBasedWidget;

		var finish = function(store, dataStoreBasedWidget) {
			if(!store || !dataStoreBasedWidget){
				deferred.reject("DataStoreBasedCreateTool:_getCreateCommand failed to create either store and/or grid.");
				return;
			}
			
			var command = new CompoundCommand();
			var index = args.index;
			command.add(new AddCommand(store, args.parent, index));
			index = (index !== undefined && index >= 0 ? index + 1 : undefined);
			command.add(new AddCommand(dataStoreBasedWidget, args.parent, index));
	        
			// If preference says to add new widgets to the current custom state,
			// then add appropriate StyleCommands
			CreateTool.prototype.checkAddToCurrentState(command, dataStoreBasedWidget);
		
			if(args.position){
				var absoluteWidgetsZindex = this._context.getPreference('absoluteWidgetsZindex');
				command.add(new StyleCommand(dataStoreBasedWidget, [{position:'absolute'},{'z-index':absoluteWidgetsZindex}]));
				command.add(new MoveCommand(dataStoreBasedWidget, args.position.x, args.position.y));
			}
			args.size = this._getInitialSize(dataStoreBasedWidget, args);
			if(args.size){
				command.add(new ResizeCommand(dataStoreBasedWidget, args.size.w, args.size.h));
			}
			this._widget = dataStoreBasedWidget;
			
			deferred.resolve(command);
		}.bind(this);
		
		var dj = this._context.getDojo();
		dojo.withDoc(this._context.getDocument(), function(){
			store = Widget.createWidget(storeData);
		});
		widgetData.properties.store = dj.getObject(storeId);
		if (this._useDataDojoProps) { 
			var dataDojoProps = widgetData.properties["data-dojo-props"];
			dataDojoProps =
					DataStoreBasedWidgetInput.setPropInDataDojoProps(
							dataDojoProps, "store", storeId); 
			
			//Put updated data-dojo-props back into the widget's properties
			widgetData.properties["data-dojo-props"] = dataDojoProps;
			
			//Parse data-dojo-props, get the structure, and put it into widget's properties
			var dataDojoPropsEval = dj.eval("({" + dataDojoProps + "})");
			widgetData.properties.structure = dataDojoPropsEval.structure;				
		}
			
		this._augmentWidgetCreationProperties(widgetData.properties).then(function() {
			dojo.withDoc(this._context.getDocument(), function(){
				dataStoreBasedWidget = Widget.createWidget(widgetData);
			});
			finish(store, dataStoreBasedWidget);
		}.bind(this));
	
		return deferred.promise;
	},
	
	_augmentWidgetCreationProperties: function(properties) {
		//Intended for subclass
		var deferred = new Deferred();
		deferred.resolve();
		return deferred.promise;
	},
	
	addPasteCreateCommand: function(command, args) {
		this._context = this._data.context;
		
		// Look for cut/copied store data to associate with the base widget, and build up
		// an array of data items
		if (this._data.associatedCopiedWidgetData) {
			var data = []; // use concat
			dojo.forEach(this._data.associatedCopiedWidgetData, function(associatedDataItem) {
				data.push(associatedDataItem);
			});
			data.push(this._data);
			this._data = data;
		}

		var deferred = new Deferred();

		this._loadRequires().then(dojo.hitch(this, function(results) {
			if (results.every(function(arg){return arg;})) {
				// all args are valid
				this._getCreateCommand(args).then(function(createCommand) {
					command.add(createCommand);
					
					// pass back the container
					deferred.resolve(this._widget);
				}.bind(this));
			} else {
				deferred.reject(new Error("DataStoreBasedCreateTool:_loadRequires failed to load all requires"));
			}
		}));

		return deferred.promise;
	},

	_loadRequires: function() {
		/* FIXME: Commenting out compact form temporarily for debugging
		return all(this._data.map(function(item) {
			return this._context.loadRequires(item.type, true);
		}, this));
		*/
		
		return all(this._data.map(function(item) {
			if (this._debug) {
				console.error("\tDataStoreBasedCreateTool::_loadRequires asking for requires for " + item.type); 
			}
			var promise = this._context.loadRequires(item.type, true);
			if (this._debug) {
				promise.then(function() {
					console.error("\t\t!!!!!!!!!!!DataStoreBasedCreateTool::_loadRequires requires for " + item.type + " fulfilled!");
				}, function(err) {
					console.error("\t\t!!!!!!!!!!!DataStoreBasedCreateTool::_loadRequires requires for " + item.type + " ERROR!!!!!");
				});
			}
			return promise;
		}, this));
	}
});

});