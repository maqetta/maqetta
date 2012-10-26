define([
	"davinci/ve/widget",
	"davinci/ve/commands/AddCommand"
], function(Widget, AddCommand) {

	return {
		// override CreateTool.create() to force the DataList to the top of the HTML file under the root
		// this prevents the DataStore from being referenced before it has been instantiated
		create: function(args) {
			// insert at beginning of HTML
			args.index = 0;
			
			// force parent to be the HTML root node
			args.target = Widget.getEnclosingWidget(this._context.rootNode);
			
			this.inherited(arguments);
		},
		
		_create: function(args) {
			if(!this._data){
				return;
			}
			
			var dataList = this._data;
			
			if(!this._context.loadRequires(dataList.type,true)){
				return;
			}
		
			var dataListId = Widget.getUniqueObjectId(dataList.type, this._context.getDocument());
			if(!dataList.properties){
				dataList.properties = {};
			}
			dataList.properties.id = dataListId;
			dataList.properties['data-dojo-props'] = 'id:"'+dataListId+'"';
			dataList.context = this._context;
			
			var dataListWidget,
				dj = this._context.getDojo();
			dojo.withDoc(this._context.getDocument(), function(){
				dataListWidget = Widget.createWidget(dataList);
			});
			
			if(!dataListWidget){
				console.error(this.declaredClass + 'Error creating widgets');
				return;
			}
			dataListWidget.domNode.style.display = 'none';
		
			var index = args.index,
				command = new AddCommand( dataListWidget, args.parent, index);
		
			this._context.getCommandStack().execute(command);
		}
	};
});