//FIXME: This routine doesn't seem to be used by anything. Delete?
define([
	"dojo/_base/declare",
	"davinci/ve/tools/CreateTool",
	"davinci/ve/widget",
	"davinci/commands/CompoundCommand",
	"davinci/ve/commands/AddCommand",
	"davinci/ve/commands/MoveCommand",
	"davinci/ve/commands/ResizeCommand"
], function(
	declare,
	CreateTool,
	Widget,
	CompoundCommand,
	AddCommand,
	MoveCommand,
	ResizeCommand
) {

return declare("dojo.metadata.dijit.OptionsCreateTool", CreateTool, {

	constructor: function(data){
		this._resizable = "both";
	},

	_create: function(args){
		if(this._data.length !== 2){
			console.error("unexpected?");
			return;
		}
		
		var storeData = this._data[0],
			widgetData = this._data[1];
		
		if(!this._context.loadRequires(storeData.type,true) || !this._context.loadRequires(widgetData.type,true)){
			return;
		}

		var storeId = Widget.getUniqueObjectId(storeData.type, this._context.getDocument());
		if(!storeData.properties){
			storeData.properties = {};
		}
		storeData.properties.jsId = storeId;
		storeData.properties.id = storeId;
		
		var data = storeData.properties.data;
		var items = data.items;
		
		// Kludge to workaround lack of support for frames in dojo's ItemFileReadStore.
		// Replaces objects and arrays in metadata that were created with the
		// top context with ones created in the frame context.
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
		widgetData.context = this._context;

		var store,
			widget;
		
		var dj = this._context.getDojo();
		dojo.withDoc(this._context.getDocument(), function(){
			store = Widget.createWidget(storeData);
			widgetData.properties.store = dj.getObject(storeId);
			widget = Widget.createWidget(widgetData);
		});
		
		if (!store || !widget) {
			console.error("store or widget undefined!");
			return;
		}

		var command = new CompoundCommand();
		var index = args.index;
		// Always put store and model as first element under body, to ensure
		// they are constructed by dojo before they are used.
        var bodyWidget = Widget.getWidget(this._context.rootNode);
        command.add(new AddCommand(store, bodyWidget, 0));
		index = (index !== undefined && index >= 0 ? index + 1 : undefined);
		command.add(new AddCommand(widget, args.parent, index));
		
		if(args.position){
			command.add(new MoveCommand(widget, args.position.x, args.position.y));
		}
		if(args.size){
			command.add(new ResizeCommand(widget, args.size.w, args.size.h));
		}
		
		this._context.getCommandStack().execute(command);

		this._context.select(widget);
	}

});

});