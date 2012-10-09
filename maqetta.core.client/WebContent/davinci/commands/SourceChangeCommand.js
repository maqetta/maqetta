define([
    "dojo/_base/declare"
], function(declare, Widget, States) {

return declare("davinci.commands.SourceChangeCommand", null, {
	name: "SourceChange",

	/**
	 * args.model => pointer to HTML model
	 * args.newText => new source text for the model
	 */
	constructor: function(args){
		if(!args || !args.model || typeof args.newText != 'string'){
			return;
		}
		this._model = args.model;
		this._newText = args.newText;
		this._oldText = this._model.getText();
	},
	
	incrementalUpdate: function(args){
		if(!args || !args.model || typeof args.newText != 'string' || this._model !== args.model){
			return;
		}
		this._newText = args.newText;
	},

	execute: function(){
		if(!this._model || typeof this._newText != 'string'){
			return;
		}
		
		this._model.setText(this._newText);
		var changeEvent = {
			newModel: this._model
		};
		dojo.publish("/davinci/ui/modelChanged", [changeEvent]);
		var editor = davinci.Runtime.currentEditor;
		if(editor.declaredClass == 'davinci.ve.PageEditor' && editor.handleChange){
			davinci.ve.PageEditor.prototype._srcChanged.call(editor, this._newText);
		}
	},

	undo: function(){
		if(!this._model || typeof this._oldText != 'string'){
			return;
		}
		this._model.setText(this._oldText);
		var changeEvent = {
			newModel: this._model
		};
		dojo.publish("/davinci/ui/modelChanged", [changeEvent]);
		var editor = davinci.Runtime.currentEditor;
		if(editor.declaredClass == 'davinci.ve.PageEditor' && editor.handleChange){
			davinci.ve.PageEditor.prototype._srcChanged.call(editor, this._oldText);
		}
	}

});
});