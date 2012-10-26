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
			
			this._context.loadRequires(dataList.type, true).then(function(){
				var dataListId = Widget.getUniqueObjectId(dataList.type, this._context.getDocument());
				if(!dataList.properties){
					dataList.properties = {};
				}
				dataList.properties.id = dataListId;
				dataList.properties['data-dojo-props'] = 'id:"'+dataListId+'"';
				dataList.context = this._context;
				
				var dataListWidget;
				dojo.withDoc(this._context.getDocument(), function(){
					dataListWidget = Widget.createWidget(dataList);
				});
				
				if(!dataListWidget){
					throw new Error(this.declaredClass + 'Error creating widgets');
				}
				dataListWidget.domNode.style.display = 'none';
			
				var command = new AddCommand(dataListWidget, args.parent, args.index);
			
				this._context.getCommandStack().execute(command);
			}.bind(this));
		}
	};
});