dojo.provide("davinci.libraries.dojo.dijit.form.DataListCreateTool");

dojo.require("davinci.ve.widget");
dojo.require("davinci.ve.tools.CreateTool");

dojo.declare("davinci.libraries.dojo.dijit.form.DataListCreateTool", davinci.ve.tools.CreateTool, {
    // override CreateTool.create() to force the DataList to the top of the HTML file under the root
    // this prevents the DataStore from being referenced before it has been instantiated
    create: function(args) {
        // insert at beginning of HTML
        args.index = 0;
        
        // force parent to be the HTML root node
        args.target = davinci.ve.widget.getEnclosingWidget(this._context.rootNode);
        
        this.inherited(arguments);
    },
    
	_create: function(args){
		
		
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
		dataList.properties.id = dataListId;
		dataList.properties['data-dojo-props'] = 'id:"'+dataListId+'"';
		dataList.context = this._context;
		
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
	
		var index = args.index;
	
		var command = new davinci.ve.commands.AddCommand( dataListWidget, args.parent, index);
	
		this._context.getCommandStack().execute(command);
		
	}

});