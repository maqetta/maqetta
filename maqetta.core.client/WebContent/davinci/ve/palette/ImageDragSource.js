define([
	"dojo/_base/declare",
	"davinci/ve/tools/CreateTool",
	"davinci/ui/dnd/DragManager",
	"davinci/ve/metadata",
	"davinci/model/Path",
	"davinci/Workbench",
], function(declare, CreateTool, dragManager, metadata, Path, Workbench){

return declare("davinci.ve.palette.ImageDragSource", null, {
	
	constructor: function(data){
		this.data = data;
	},
	
	initDrag: function(){
		var editor = Workbench.getOpenEditor();
		if (editor && editor.currentEditor && editor.currentEditor.context)	{
			this.context=editor.currentEditor.context;
			dragManager.document = this.context.getDocument();
			var frameNode = this.context.frameNode;
			if(frameNode){
				var coords = dojo.coords(frameNode);
				var containerNode = this.context.getContainerNode();
				dragManager.documentX = coords.x - containerNode.scrollLeft;
				dragManager.documentY = coords.y - containerNode.scrollTop;
			}
		} else {
			this.context=null;
		}
	},
	dragStart: function(){
		
		if (this.context){
			var createData,
				targetPath = this.context.getPath(),
				imagePath = new Path(this.data.getPath()),
				relativepath = imagePath.relativeTo(targetPath, true).toString();
			
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

            metadata.getHelper(createData.type, 'tool').then(function(ToolCtor) {
				var tool = new (ToolCtor || CreateTool)(createData);
				this.context.setActiveTool(tool);
            }.bind(this));
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