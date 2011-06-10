dojo.provide("davinci.libraries.dojo.dojox.grid.DataGridCreateTool");

dojo.require("davinci.ve.widget");
dojo.require("davinci.commands.CompoundCommand");
dojo.require("davinci.ve.commands.AddCommand");
dojo.require("davinci.ve.commands.MoveCommand");
dojo.require("davinci.ve.commands.ResizeCommand");
dojo.require("davinci.ve.tools.CreateTool");

dojo.declare("davinci.libraries.dojo.dojox.grid.DataGridCreateTool", davinci.ve.tools.CreateTool, {
	constructor: function(data){
		
		this._resizable = "both";
	},
	
	_create: function(args){
		
		if(this._data.length !== 2){
			return;
		}
		
		var storeData = this._data[0]
		//var modelData = this._data[1];
		var dataGridData = this._data[1];
		
		if(!this._context.loadRequires(storeData.type,true) /*|| !this._context.loadRequires(modelData.type,true)*/ ||
			!this._context.loadRequires(dataGridData.type,true)){
			return;
		}
	
		var storeId = davinci.ve.widget.getUniqueObjectId(storeData.type, this._context.getDocument());
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
		
	//	var modelId = davinci.ve.widget.getUniqueObjectId(modelData.type, this._context.getDocument());
	//	if(!modelData.properties){
	//		modelData.properties = {};
	//	}
	//	modelData.properties.jsId = modelId;
	//	modelData.properties.id = modelId;
	//	modelData.context = this._context;
		
		var dataGridId = davinci.ve.widget.getUniqueObjectId(dataGridData.type, this._context.getDocument());
		if(!dataGridData.properties){
			dataGridData.properties = { };
		}
		// <hack> Added to make new ve code happy, davinci.ve.widget.createWidget requires id in properties or context on data, but id didn't work when dragging second tree onto canvas so switched to context:
		// node.id= (data.properties && data.properties.id) || data.context.getUniqueID(srcElement); 
		//treeData.properties.id = treeId;
		dataGridData.context = this._context;
		// </hack>
	
		var store = undefined;
		//var model = undefined;
		var dataGrid = undefined;
		
		var dj = this._context.getDojo();
		dojo.withDoc(this._context.getDocument(), function(){
			store = davinci.ve.widget.createWidget(storeData);
	//		modelData.properties.store = dj.getObject(storeId);
	//		model = davinci.ve.widget.createWidget(modelData);
			dataGridData.properties.store = dj.getObject(storeId);
			dataGrid = davinci.ve.widget.createWidget(dataGridData);
		});
		
		if(!store || !dataGrid){
			return;
		}
	
		var command = new davinci.commands.CompoundCommand();
		var index = args.index;
		
		command.add(new davinci.ve.commands.AddCommand(store, args.parent, index));
		index = (index !== undefined && index >= 0 ? index + 1 : undefined);
	//	command.add(new davinci.ve.commands.AddCommand(model, args.parent, index));
	//	index = (index !== undefined && index >= 0 ? index + 1 : undefined);
		command.add(new davinci.ve.commands.AddCommand(dataGrid, args.parent, index));
		
		if(args.position){
			command.add(new davinci.ve.commands.MoveCommand(dataGrid, args.position.x, args.position.y));
		}
		if(args.size){
			command.add(new davinci.ve.commands.ResizeCommand(dataGrid, args.size.w, args.size.h));
		}
		
		this._context.getCommandStack().execute(command);
	//	this._context._editor.visualEditor._pageEditor._srcChanged();
	//	this._srcChanged(storeId); // wdr 3-11
	//	var pageEditor = this._context._editor.visualEditor._pageEditor;
	//	pageEditor.setContent(pageEditor.fileName,pageEditor.htmlEditor.model);
	//	var containerNode = widget.getContainerNode();
	//	dataGrid._edit_context.containerNode
	//	var containerNode = dataGrid._edit_context.containerNode;
		//containerNode.addText(' ');
	//	var p = widget.getParent();
	//    dj["require"]("dojo.parser");
	//       dj.parser.parse(containerNode);
	//    this._context.attach(widget);
	//    widget.startup();
	//    widget.renderWidget();
		//this._context._attachChildren(containerNode);
		
	//	var doc = this._context.getDocument();
	//	var nodes;
	//	dojo.withDoc(doc,  function() {
	//		nodes = dojo.query('.dojoxGrid');
	//	  }, this);
	//	debugger;
	//	dataGrid = null;
	//	for (var n = 0; n < nodes.length; n++){
	//		var w = davinci.ve.widget.byId(nodes[n]);
	//		var sId = w._srcElement.getAttribute("store");
	//		if (sId === storeId){
	//			dataGrid = w;
	//			n= nodes.length; // bail out
	//		}
	//		debugger;
	//	}
		this._select(dataGrid);
		
	}
	
//	_srcChanged : function(storeId){
//		return;
//		if (!this._updateDesignTimer)
//		{
//			var self = this;
//			this._updateDesignTimer=setTimeout(function (){
//				var pageEditor = self._context._editor.visualEditor._pageEditor;
//				pageEditor.visualEditor.setContent(pageEditor.fileName,pageEditor.htmlEditor.model);
//				var doc = self._context.getDocument();
//				var nodes;
//				dojo.withDoc(doc,  function() {
//					nodes = dojo.query('.dojoxGrid');
//				  }, this);
//		
//				var dataGrid = null;
//				for (var n = 0; n < nodes.length; n++){
//					var w = davinci.ve.widget.byId(nodes[n]);
//					var sId = w._srcElement.getAttribute("store");
//					if (sId === storeId){
//						dataGrid = w;
//						n= nodes.length; // bail out
//					}
//					
//				}
//				self._select(dataGrid);
//				delete this._updateDesignTimer;
//			},100); //700
//		}
//		//this.isDirty=true;
//		//this.lastModifiedTime=new Date().getTime();
//		
//		
//	}

});
