dojo.provide("davinci.libraries.dojo.dojox.mobile.ComboBoxCreateTool");

dojo.require("davinci.ve.widget");
dojo.require("davinci.commands.CompoundCommand");
dojo.require("davinci.ve.commands.AddCommand");
dojo.require("davinci.ve.commands.MoveCommand");
dojo.require("davinci.ve.commands.ResizeCommand");
dojo.require("davinci.libraries.dojo.dojox.mobile.MobileCreateTool");

dojo.declare("davinci.libraries.dojo.dojox.mobile.ComboBoxCreateTool", davinci.libraries.dojo.dojox.mobile.MobileCreateTool, {
	constructor: function(data){
		
		this._resizable = "both";
	},
	
	_create: function(args){
		
		
		if(this._data.length !== 2){
			return;
		}

		var dataList = this._data[0];
		var comboBox = this._data[1];
		
		if(!this._context.loadRequires(dataList.type,true) ||
			!this._context.loadRequires(comboBox.type,true)){
			return;
		}
	
		var dataListId = davinci.ve.widget.getUniqueObjectId(dataList.type, this._context.getDocument());
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
		var dataListWidget = undefined;
		var comboBoxWidget = undefined;
		
		//var dj = this._context.getDojo();
		dojo.withDoc(this._context.getDocument(), function(){
			dataListWidget = davinci.ve.widget.createWidget(dataList);
			comboBoxWidget = davinci.ve.widget.createWidget(comboBox);
		});
		
		if(!dataListWidget || !comboBoxWidget){
			console.error(this.declaredClass + 'Error creating widgets');
			return;
		}
		comboBoxWidget.dijitWidget.store = dataListWidget.dijitWidget;
		
		var command = new davinci.commands.CompoundCommand();
		var index = args.index;
		//var store = comboBoxWidget.dijitWidget.store;
		// always put datalists as first element under body, to ensure they are constructed by dojo before they are used
		var bodyWidget = davinci.ve.widget.getWidget(this._context.rootNode);
		command.add(new davinci.ve.commands.AddCommand( dataListWidget, bodyWidget , 0 ));
		index = (index !== undefined && index >= 0 ? index + 1 : undefined);
		command.add(new davinci.ve.commands.AddCommand(comboBoxWidget, args.parent, index));
		
		if(args.position){
			command.add(new davinci.ve.commands.MoveCommand(comboBoxWidget, args.position.x, args.position.y));
		}
		if(args.size){
			command.add(new davinci.ve.commands.ResizeCommand(comboBoxWidget, args.size.w, args.size.h));
		}
		
		this._context.getCommandStack().execute(command);
		this._select(comboBoxWidget);
		
	}
	

});
