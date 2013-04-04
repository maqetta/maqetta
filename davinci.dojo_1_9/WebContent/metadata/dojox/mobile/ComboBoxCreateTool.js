define([
	"dojo/_base/declare",
	"dojo/Deferred",
	"dojo/promise/all",
	"davinci/ve/tools/CreateTool",
	"davinci/ve/widget",
	"davinci/commands/CompoundCommand",
	"davinci/ve/commands/AddCommand",
	"davinci/ve/commands/StyleCommand",
	"davinci/ve/commands/MoveCommand",
	"davinci/ve/commands/ResizeCommand",
	"./ComboBoxHelper"
], function (
	declare,
	Deferred,
	all,
	CreateTool,
	Widget,
	CompoundCommand,
	AddCommand,
	StyleCommand,
	MoveCommand,
	ResizeCommand,
	ComboBoxHelper
) {

return declare(CreateTool, {

	constructor: function(data) {
		this._resizable = "both";
	},

	_create: function(args) {
		this._loadRequires().then(dojo.hitch(this, function(results) {
			if (results.every(function(arg){return arg;})) {
				// all args are valid
				var command = this._getCreateCommand(args);
				this._context.getCommandStack().execute(command);
				this._select(this._mobileWidget);
			} else {
				console.log("ComboBoxCreateTool:_loadRequires failed to load all requires");
			}
		}));
	},
	
	_getCreateCommand: function(args) {
		if(this._data.length !== 2){
			return;
		}

		var dataList = this._data[0];
		var comboBox = this._data[1];
	
		var dataListId = Widget.getUniqueObjectId(dataList.type, this._context.getDocument());
		if(!dataList.properties){
			dataList.properties = {};
		}
		dataList.properties.id = dataListId;
		dataList.properties['data-dojo-props'] = 'id:"'+dataListId+'"';
		dataList.context = this._context;
		
		if(!comboBox.properties){
			comboBox.properties = { };
		}
		comboBox.context = this._context;
		comboBox.properties['data-dojo-props'] = 'value:"Item 1", list:"'+dataListId+'"';

		var dataListWidget,
			comboBoxWidget;
		
		//var dj = this._context.getDojo();
		dojo.withDoc(this._context.getDocument(), function(){
			dataListWidget = Widget.createWidget(dataList);
			comboBoxWidget = Widget.createWidget(comboBox);
		});
		
		if(!dataListWidget || !comboBoxWidget){
			console.error(this.declaredClass + 'Error creating widgets');
			return;
		}
		comboBoxWidget.dijitWidget.store = dataListWidget.dijitWidget;
		
		var command = new CompoundCommand();
		var index = args.index;
		//var store = comboBoxWidget.dijitWidget.store;
		// always put datalists as first element under body, to ensure they are constructed by dojo before they are used
		var bodyWidget = Widget.getWidget(this._context.rootNode);
		command.add(new AddCommand( dataListWidget, bodyWidget , 0 ));
		index = (index !== undefined && index >= 0 ? index + 1 : undefined);
		command.add(new AddCommand(comboBoxWidget, args.parent, index));
        
		// If preference says to add new widgets to the current custom state,
		// then add appropriate StyleCommands
		CreateTool.prototype.checkAddToCurrentState(command, comboBoxWidget);	
		
		if(args.position){
			var absoluteWidgetsZindex = this._context.getPreference('absoluteWidgetsZindex');
			command.add(new StyleCommand(comboBoxWidget, [{position:'absolute'},{'z-index':absoluteWidgetsZindex}]));
			command.add(new MoveCommand(comboBoxWidget, args.position.x, args.position.y));
		}
		args.size = this._getInitialSize(comboBoxWidget, args);
		if(args.size){
			command.add(new ResizeCommand(comboBoxWidget, args.size.w, args.size.h));
		}
		
		this._mobileWidget = comboBoxWidget;
		return command;
	},
	
	addPasteCreateCommand: function(command, args) {
		this._context = this._data.context;
		var props = this._data.properties['data-dojo-props'].split(',');
		var x = new ComboBoxHelper();
		var values = x.getStoreValues(props);
		var storeWidget = Widget.byId(values.storeId);
		var storeData = storeWidget.getData();
		var data = [];

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

		this._loadRequires().then(dojo.hitch(this, function(results) {
			if (results.every(function(arg){return arg;})) {
				// all args are valid
				command.add( this._getCreateCommand(args));
				
				// pass back the container
				deferred.resolve(this._mobileWidget);
			} else {
				deferred.reject(new Error("ComboBoxCreateTool:_loadRequires failed to load all requires"));
			}
		}));

		return deferred.promise;
	},

	_loadRequires: function() {
		return all(this._data.map(function(item) {
			return this._context.loadRequires(item.type, true);
		}, this));
	}

});

});