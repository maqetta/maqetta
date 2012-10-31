define([
	"dojo/_base/declare",
	"davinci/ve/actions/ContextAction"
], function(declare, ContextAction){

return declare("davinci.ve.actions.EditPropertiesAction", [ContextAction], {

	run: function(context){
		context = this.fixupContext(context);
		if(context && context.editor && context.editor.editorContainer && context.editor.editorContainer.hideShowProperties){
			context.editor.editorContainer.hideShowProperties();
		}
	},


	/**
	 * Enable this command if this command would actually make a change to the document.
	 * Otherwise, disable.
	 */
	isEnabled: function(context){
		context = this.fixupContext(context);
		return true;
	}

});
});
