dojo.provide("dojo.metadata.dijit.OptionsCreateTool");

dojo.require("davinci.ve.widget");
dojo.require("davinci.commands.CompoundCommand");
dojo.require("davinci.ve.commands.AddCommand");
dojo.require("davinci.ve.commands.MoveCommand");
dojo.require("davinci.ve.commands.ResizeCommand");
dojo.require("davinci.ve.tools.CreateTool");

dojo.declare("dojo.metadata.dijit.OptionsCreateTool", davinci.ve.tools.CreateTool, {

	constructor: function(data){
		this._resizable = "both";
	},

	_create: function(args){
		if(this._data.length !== 2){
			debugger;
			return;
		}
		
		var storeData = this._data[0]
		var widgetData = this._data[1];
		
		if(!this._context.loadRequires(storeData.type,true) || !this._context.loadRequires(widgetData.type,true)){
			return;
		}

		var storeId = davinci.ve.widget.getUniqueObjectId(storeData.type, this._context.getDocument());
		if(!storeData.properties){
			storeData.properties = {};
		}
		storeData.properties.jsId = storeId;
		storeData.properties.id = storeId;
		
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
		
		if(!widgetData.properties){
			widgetData.properties = { };
		}
		// <hack> Added to make new ve code happy, davinci.ve.widget.createWidget requires id in properties or context on data, but id didn't work when dragging second widget onto canvas so switched to context:
		// node.id= (data.properties && data.properties.id) || data.context.getUniqueID(srcElement); 
		widgetData.context = this._context;
		// </hack>

		var store = undefined;
		var widget = undefined;
		
		var dj = this._context.getDojo();
		dojo.withDoc(this._context.getDocument(), function(){
			store = davinci.ve.widget.createWidget(storeData);
			widgetData.properties.store = dj.getObject(storeId);
			widget = davinci.ve.widget.createWidget(widgetData);
		});
		
		if(!store || !widget){
			debugger;
			return;
		}

		var command = new davinci.commands.CompoundCommand();
		var index = args.index;
		
		command.add(new davinci.ve.commands.AddCommand(store, args.parent, index));
		index = (index !== undefined && index >= 0 ? index + 1 : undefined);
		command.add(new davinci.ve.commands.AddCommand(widget, args.parent, index));
		
		if(args.position){
			command.add(new davinci.ve.commands.MoveCommand(widget, args.position.x, args.position.y));
		}
		if(args.size){
			command.add(new davinci.ve.commands.ResizeCommand(widget, args.size.w, args.size.h));
		}
		
		this._context.getCommandStack().execute(command);

		this._context.select(widget);
	}

});
