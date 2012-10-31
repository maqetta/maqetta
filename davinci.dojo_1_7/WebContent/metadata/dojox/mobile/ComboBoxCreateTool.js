define([
	"dojo/_base/declare",
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
        var command = this._getCreateCommand(args);
        this._context.getCommandStack().execute(command);
        this._select(this._mobileWidget);
    },
	
	_getCreateCommand: function(args) {
		if(this._data.length !== 2){
			return;
		}

		var dataList = this._data[0];
		var comboBox = this._data[1];
		
		if(!this._context.loadRequires(dataList.type,true) ||
			!this._context.loadRequires(comboBox.type,true)){
			return;
		}
	
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
		
		if(args.position){
			var absoluteWidgetsZindex = this._context.getPreference('absoluteWidgetsZindex');
			command.add(new StyleCommand(comboBoxWidget, [{position:'absolute'},{'z-index':absoluteWidgetsZindex}]));
			command.add(new MoveCommand(comboBoxWidget, args.position.x, args.position.y));
		}
		args.size = this._getInititalSize(comboBoxWidget, args);
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
		data[0] = storeData;
		data[1] = this._data;
		this._data = data;
		command.add( this._getCreateCommand(args));
		return this._mobileWidget;
	}

});

});