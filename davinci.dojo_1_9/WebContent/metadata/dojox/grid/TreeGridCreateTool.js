define([
	"dojo/_base/declare",
	"davinci/ve/tools/CreateTool",
	"davinci/ve/widget",
	"davinci/commands/CompoundCommand",
	"davinci/ve/commands/AddCommand",
	"davinci/ve/commands/MoveCommand",
	"davinci/ve/commands/ResizeCommand",
	"davinci/ve/commands/StyleCommand",
	"dojo/promise/all"
], function(
	declare,
	CreateTool,
	Widget,
	CompoundCommand,
	AddCommand,
	MoveCommand,
	ResizeCommand,
	StyleCommand,
	all
) {

return declare(CreateTool, {

	constructor: function(data) {
		this._resizable = "both";
	},
	
	_create: function(args) {
		if(this._data.length !== 2){
			return;
		}
		
		var storeData = this._data[0],
			dataGridData = this._data[1];
		
		all([
		    this._context.loadRequires(storeData.type,true), /*|| !this._context.loadRequires(modelData.type,true)*/
			this._context.loadRequires(dataGridData.type,true)
		]).then(function() {
			var storeId = Widget.getUniqueObjectId(storeData.type, this._context.getDocument());
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
				dataGrid = Widget.createWidget(dataGridData);
			});
			
			if(!store || !dataGrid){
				return;
			}
		
			var command = new CompoundCommand();
			var index = args.index;
			
			command.add(new AddCommand(store, args.parent, index));
			index = (index !== undefined && index >= 0 ? index + 1 : undefined);
			command.add(new AddCommand(dataGrid, args.parent, index));
	        
			// If preference says to add new widgets to the current custom state,
			// then add appropriate StyleCommands
			CreateTool.prototype.checkAddToCurrentState(command, dataGrid);	
						
			if(args.position){
				var absoluteWidgetsZindex = this._context.getPreference('absoluteWidgetsZindex');
				command.add(new StyleCommand(dataGrid, [{position:'absolute'},{'z-index':absoluteWidgetsZindex}]));
				command.add(new MoveCommand(dataGrid, args.position.x, args.position.y));
			}
			args.size = this._getInitialSize(dataGrid, args);
			if(args.size){
				command.add(new ResizeCommand(dataGrid, args.size.w, args.size.h));
			}
			
			this._context.getCommandStack().execute(command);
			this._select(dataGrid);
		}.bind(this));
	}
});

});