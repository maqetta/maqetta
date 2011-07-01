dojo.provide("davinci.libraries.dojo.dojox.mobile.ComboBoxCreateTool");

dojo.require("davinci.ve.widget");
dojo.require("davinci.commands.CompoundCommand");
dojo.require("davinci.ve.commands.AddCommand");
dojo.require("davinci.ve.commands.MoveCommand");
dojo.require("davinci.ve.commands.ResizeCommand");
dojo.require("davinci.ve.tools.CreateTool");

dojo.declare("davinci.libraries.dojo.dojox.mobile.ComboBoxCreateTool", davinci.ve.tools.CreateTool, {
	constructor: function(data){
		
		this._resizable = "both";
	},
	
	_create: function(args){
		
		debugger;
		
		if(this._data.length !== 2){
			return;
		}
		
		//var storeData = this._data[0]
		var dataList = this._data[0]
		//var dataGridData = this._data[1];
		var comboBox = this._data[1];
		
		if(!this._context.loadRequires(dataList.type,true) ||
			!this._context.loadRequires(comboBox.type,true)){
			return;
		}
	
		var dataListId = davinci.ve.widget.getUniqueObjectId(dataList.type, this._context.getDocument());
		if(!dataList.properties){
			dataList.properties = {};
		}
		//storeData.properties.jsId = storeId;
		dataList.properties.id = dataListId;
		debugger;
		dataList.properties['data-dojo-props'] = 'id:"'+dataListId+'"';
		//dataList.properties.style = "display: none;"
		dataList.context = this._context;
		
		//var data = dataList.properties.data;
		//var items = data.items;
		
		// Kludge to workaround lack of support for frames in dojo's ItemFileReadStore
		// Replaces objects and arrays in metadata that were created with the top context with ones created in the frame context
/*		var copyUsingFrameObject = dojo.hitch(this, function (items) {
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
		data.items = copyUsingFrameObject(items);*/
		
		//var comboBoxId = davinci.ve.widget.getUniqueObjectId(comboBox.type, this._context.getDocument());
		if(!comboBox.properties){
			comboBox.properties = { };
		}
		// <hack> Added to make new ve code happy, davinci.ve.widget.createWidget requires id in properties or context on data, but id didn't work when dragging second tree onto canvas so switched to context:
		// node.id= (data.properties && data.properties.id) || data.context.getUniqueID(srcElement); 
		//treeData.properties.id = treeId;
		comboBox.context = this._context;
		//comboBox.properties.value = 'Item 1';
		comboBox.properties['data-dojo-props'] = 'value:"Item 1", list:"'+dataListId+'"';
		// </hack>
	
		var dataListWidget = undefined;
		var comboBoxWidget = undefined;
		
		var dj = this._context.getDojo();
		dojo.withDoc(this._context.getDocument(), function(){
			dataListWidget = davinci.ve.widget.createWidget(dataList);
			//dataGridData.properties.store = dj.getObject(dataListId);
			comboBoxWidget = davinci.ve.widget.createWidget(comboBox);
		});
		
		if(!dataListWidget || !comboBoxWidget){
			console.error(this.declaredClass + 'Error creating widgets')
			return;
		}
		comboBoxWidget.dijitWidget.store = dataListWidget.dijitWidget;
		//dataListWidget.domNode.style.display = 'none';
		//comboBoxWidget.domNode.style.display = '';

		
		var command = new davinci.commands.CompoundCommand();
		var index = args.index;
		var store = comboBoxWidget.dijitWidget.store;
		//var items = store.query(function(){return true;},{ignoreCase: true} );
		
		command.add(new davinci.ve.commands.AddCommand(/*dataList*/ dataListWidget, args.parent, index));
		index = (index !== undefined && index >= 0 ? index + 1 : undefined);
		command.add(new davinci.ve.commands.AddCommand(comboBoxWidget, args.parent, index));
		
		if(args.position){
			command.add(new davinci.ve.commands.MoveCommand(comboBoxWidget, args.position.x, args.position.y));
		}
		if(args.size){
			command.add(new davinci.ve.commands.ResizeCommand(comboBoxWidget, args.size.w, args.size.h));
		}
		
		this._context.getCommandStack().execute(command);
		
		var dj = this._context.getDojo();
		var localDijit = this._context.getDijit();
		var list = dj.byId(dataListId);
		// remove all registered widgets, some may be partly constructed.
//		localDijit.registry.forEach(function(w){
//			  w.destroy();			 
//		});
//		try{
//		dj.parser.parse(this._context.rootNode);
//		}catch (e){
//			debugger;
//		}
//		debugger;
//		list = localDijit.byId(dataListId);
//		this._context.attach(this._context.rootNode);
		
		//var list2 = dt.byId(dataListId);
//		this._select(comboBoxWidget);
		
	}
	

});
