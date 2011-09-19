dojo.provide("davinci.workbench.PropertyEditor");


 


dojo.declare("davinci.workbench.PropertyEditor", davinci.workbench.ViewPart, {
	
	propertyProvider:null,
	
	constructor: function(params, srcNodeRef){
		this.subscribe("/davinci/ui/editorSelected", this.editorChanged);
		this.subscribe("/davinci/ui/selectionChanged", this.selectionChanged);
	},
	editorChanged : function(changeEvent){
		
		try {
			var editor=changeEvent.editor;
		
			if (this.currentEditor)
			{
				if (this.currentEditor==editor)
					return;
				this.removeContent();
				this.propertyProvider=null;
			}
			this.currentEditor=editor;
			if (!editor) return;
		
			if (editor.getProperties) {
				this.propertyProvider=editor.getPropertiesProvider();
			}
			if (this.propertyProvider)
			{
			}
			else
			{
				this.containerNode.innerHTML="Properties are not available";
				return;
			}
			
			this.setContent(this.outlineTree);
			this.outlineTree.startup();
			
			
		}catch(e){
			console.log("FIXME: property view replace failed, error: " + e);
		}
	},
	
	selectionChanged : function(selection)
	{
		if (selection.length>0)
		{
			if (selection[0].model)
			{
			}
		}

	}

	
});