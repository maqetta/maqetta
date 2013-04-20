define([
    "dojo/_base/declare",
    "davinci/Runtime"
], function(declare, Runtime) {

return declare("davinci.commands.SourceChangeCommand", null, {
	name: "SourceChange",

	/**
	 * args.model => pointer to HTML model
	 * args.oldText => old source text for the model (what gets restored with undo)
	 * args.newText => new source text for the model
	 */
	constructor: function(args){
		this._model = args.model;
		this._oldText = args.oldText;
		this._newText = args.newText;
	},
	
	incrementalUpdate: function(args){
		this._newText = args.newText;
	},

	execute: function(){
		this._model.setText(this._newText);
		var changeEvent = {
			newModel: this._model
		};
		dojo.publish("/davinci/ui/modelChanged", [changeEvent]);
		var editor = Runtime.currentEditor;
		if(editor.declaredClass == 'davinci.ve.PageEditor' && editor.handleChange){
			require(["davinci/ve/PageEditor"], function(PageEditor){
				PageEditor.prototype._srcChanged.call(editor, this._newText);
			}.bind(this));
		}

		if (!this.established) {
			this.established = true;
			return true; // do not trigger events to redraw on initial user action			
		}
	},

	undo: function(){
		this._model.setText(this._oldText);
		var changeEvent = {
			newModel: this._model
		};
		dojo.publish("/davinci/ui/modelChanged", [changeEvent]);
		var editor = Runtime.currentEditor;
		if(editor.declaredClass == 'davinci.ve.PageEditor' && editor.handleChange){
			require(["davinci/ve/PageEditor"], function(PageEditor){
				PageEditor.prototype._srcChanged.call(editor, this._oldText);
			}.bind(this));
		}
	}
});
});