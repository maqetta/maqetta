define([
    "dojo/_base/declare",
    "davinci/workbench/ViewPart"
], function(declare, ViewPart) {

return declare("davinci.workbench.PropertyEditor", ViewPart, {

	propertyProvider:null,
	
	constructor: function(params, srcNodeRef){
		this.subscribe("/davinci/ui/editorSelected", this.editorChanged);
		this.subscribe("/davinci/ui/selectionChanged", this.selectionChanged);
	},

	editorChanged: function(changeEvent){
		var editor=changeEvent.editor;
	
		if (this.currentEditor) {
			if (this.currentEditor==editor) {
				return;
			}
			this.removeContent();
			this.propertyProvider=null;
		}
		this.currentEditor=editor;
		if (!editor) {
			return;
		}
	
		if (editor.getProperties) {
			this.propertyProvider=editor.getPropertiesProvider();
		}
		if (!this.propertyProvider) {
			this.containerNode.innerHTML="Properties are not available";
			return;
		}
		
		this.setContent(this.outlineTree);
		this.outlineTree.startup();
	},
	
	selectionChanged: function(selection) {
	}
});
});
