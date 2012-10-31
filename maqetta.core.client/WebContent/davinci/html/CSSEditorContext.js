define([
	"dojo/_base/declare",
	"davinci/html/CSSEditorWidget"
], function(declare, CSSEditorWidget) {

return declare("davinci.html.CSSEditorContext", null, {

	constructor: function(editor) {
		this.editor = editor;
		this.connects = [];
		this.subscriptions = [];
		this.subscriptions.push(dojo.subscribe("/davinci/ui/selectionChanged", this, this._selection));
	},

	_selection: function(selection)
	{
		if (selection[0] && selection[0].model) {
			var model = selection[0].model;
			var cssModel;

			if (model._edit_context) {
				// if it has _edit_context, it's a visual editor...
				// FIXME: make sure the selection event is targeted at this editor instance
				return;
			}

			if (model.elementType.substring(0,3) == 'CSS') {
				var rule = model.getCSSRule();
				var fire = rule != this.selectedRule;
				if (rule) {
					this.selectedWidget = new CSSEditorWidget(this);
				} else {
					this.selectedWidget = null;
				}
				this.selectedRule = rule;
				if (fire) {
					this.onSelectionChange();
				}
			}
		}
	},

	getSelection: function() {
		if (this.selectedWidget) {
			return [this.selectedWidget];
		}
		return [];
	},

	onSelectionChange: function() {
	}

});
});
