define([
	"dojo/_base/declare",
	"davinci/ve/tools/CreateTool",
	"davinci/ui/dnd/DragSource"
], function(declare, CreateTool, DragSource){

return declare("davinci.ve.palette.ImageDragSource", null, {
	
	constructor: function(data){
		this.data = data;
	},
	
	initDrag: function(){
		var editor=davinci.Workbench.getOpenEditor();
		if (editor && editor.currentEditor && editor.currentEditor.context)	{
			this.context=editor.currentEditor.context;
			davinci.ui.dnd.dragManager.document = this.context.getDocument();
			var frameNode = this.context.frameNode;
			if(frameNode){
				var coords = dojo.coords(frameNode);
				var containerNode = this.context.getContainerNode();
				davinci.ui.dnd.dragManager.documentX = coords.x - containerNode.scrollLeft;
				davinci.ui.dnd.dragManager.documentY = coords.y - containerNode.scrollTop;
			}
		}
		else
		{
			this.context=null;
		}
	},
	dragStart: function(){
		
		if (this.context){
			var createData;
			var targetPath = this.context.getPath();
			var imagePath = new davinci.model.Path(this.data.getPath());
			var relativepath = (imagePath.relativeTo(targetPath, true)).toString();
			
			if (this.data.getExtension() === "json"){
				createData={
					type: "dojo.data.ItemFileWriteStore",
					properties: {
						jsId: "myDataStore",
						url: relativepath
					}
				};
			} else {
				createData={
					children : [],
					properties : {
					   src : relativepath
					},
					type: "html.img"
				};
			}
            createData.fileDragCreate = true; 

			var toolCtor = davinci.ve.metadata.getHelper(createData.type, 'tool') ||
						   davinci.ve.tools.CreateTool,
				tool = new toolCtor(createData);
			this.context.setActiveTool(tool);
		}
	},

	dragEnd: function()
	{
		if (this.context) {
			this.context.setActiveTool(null);
		}
	},

	createDragClone: function()
	{
		// Browser doesn't know size of IMG until loaded
		var img = dojo.create("img", {src: this.data.getURL()});
		dojo.connect(img, 'onload', dojo.hitch(this, function(e) {
			var image = e.target;
			var style = image.style;
			style.width = image.naturalWidth+'px';
			style.height = image.naturalHeight+'px';
		}));
		return img;
	}
});
});