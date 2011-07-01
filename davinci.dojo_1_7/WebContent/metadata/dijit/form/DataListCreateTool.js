dojo.provide("davinci.libraries.dojo.dijit.form.DataListCreateTool");

dojo.require("davinci.ve.widget");
dojo.require("davinci.ve.tools.CreateTool");

dojo.declare("davinci.libraries.dojo.dijit.form.DataListCreateTool", davinci.ve.tools.CreateTool, {
    // override CreateTool.create() to force the DataStore to the top of the HTML file under the root
    // this prevents the DataStore from being referenced before it has been instantiated
    create: function(args) {
    	debugger;
        // insert at beginning of HTML
        args.index = 0;
        
        // force parent to be the HTML root node
        args.target = davinci.ve.widget.getEnclosingWidget(this._context.rootNode);
        
        this.inherited(arguments);
    },
    
	_create: function(args){
		
		debugger;
		
		if(!this._data){
			return;
		}
		
		var dataList = this._data;
		
		if(!this._context.loadRequires(dataList.type,true)){
			return;
		}
	
		var dataListId = davinci.ve.widget.getUniqueObjectId(dataList.type, this._context.getDocument());
		if(!dataList.properties){
			dataList.properties = {};
		}
		debugger;
		dataList.properties.id = dataListId;
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
		
	
		var dataListWidget = undefined;
		
		var dj = this._context.getDojo();
		dojo.withDoc(this._context.getDocument(), function(){
			dataListWidget = davinci.ve.widget.createWidget(dataList);
		});
		
		if(!dataListWidget){
			console.error(this.declaredClass + 'Error creating widgets')
			return;
		}
		dataListWidget.domNode.style.display = 'none';
	
//		var command = new davinci.commands.CompoundCommand();
		var index = args.index;
		dojo.parser.parse(dataListWidget.domNode);	
//		command.add(new davinci.ve.commands.AddCommand(/*dataList*/ dataListWidget, args.parent, index));
		var command = new davinci.ve.commands.AddCommand(/*dataList*/ dataListWidget, args.parent, index);
			

		
		this._context.getCommandStack().execute(command);
		var dj = this._context.getDojo();
		var list = dj.byId(dataListId);
		try{
		dj.parser.parse(list);
		}catch (e){
			debugger;
		}
		var dt = this._context.getDijit();
		var list2 = dt.byId(dataListId);
		debugger;
	//	this._select(comboBoxWidget);
		
	}

});