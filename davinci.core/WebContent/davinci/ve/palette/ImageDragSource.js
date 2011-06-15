dojo.provide("davinci.ve.palette.ImageDragSource");

dojo.require("davinci.ve.tools.CreateTool");
dojo.require("davinci.ui.dnd.DragSource");

dojo.declare("davinci.ve.palette.ImageDragSource", null, {
	constructor: function(data){
			this.data = data;
		},
		
		initDrag : function()
		{
			var editor=davinci.Workbench.getOpenEditor();
			if (editor && editor.currentEditor && editor.currentEditor.context)
			{
				this.context=editor.currentEditor.context;
				davinci.ui.dnd.dragManager.document = this.context.getDocument();
				var frameNode = this.context.getFrameNode();
				if(frameNode){
					var coords = dojo.coords(frameNode);
					var containerNode = this.context.getContainerNode();
					davinci.ui.dnd.dragManager.documentX = coords.x - containerNode.scrollLeft;
					davinci.ui.dnd.dragManager.documentY = coords.y - containerNode.scrollTop
				}
			}
			else 
				this.context=null;
		},
		dragStart : function()
		{
			if (this.context)
			{
			    var createData;
			    if (this.data.getExtension() === "json")
			    {
			        createData={
		                type: "dojo.data.ItemFileWriteStore",
		                properties: {
			                jsId: "myDataStore",
			                url: this.data.getPath()
		                }
			        };
			    } else
			    {
				    createData={
						children : [],
						properties : {
						   src : this.data.getPath()
						},
						type: "html.img"
					};
			    }
			    var metadata = davinci.ve.metadata.query(createData.type);
			    var tool;
			    createData.fileDragCreate = true; 
		        if (metadata && metadata.tool) {
//		            dojo["require"](data.tool);
		            dojo._loadUri(davinci.resource.findResource(
		                    './' + metadata.tool.replace(/\./g, "/") + ".js").getURL());
		            var ctor = dojo.getObject(metadata.tool);
		            tool = new ctor(createData);
		        } else {
		            tool = new davinci.ve.tools.CreateTool(createData);
		        }
				this.context.setActiveTool(tool);
					
			}
		},
		dragEnd : function()
		{
			if (this.context)
				this.context.setActiveTool(null);
		}
});