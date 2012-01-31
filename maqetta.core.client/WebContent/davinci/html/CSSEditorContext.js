define([
	"dojo/_base/declare",
	"davinci/html/CSSEditorWidget"
], function(declare, CSSEditorWidget) {

return declare("davinci.html.CSSEditorContext", null, {

	constructor : function(editor) {
		this.editor = editor;
		this.connects = [];
		this.subscriptions = [];
		this.subscriptions.push(dojo.subscribe("/davinci/ui/selectionChanged", this, this._selection));

	},

	_selection : function(selection)
	{
		if (selection[0] && selection[0].model) {
			var model = selection[0].model;
			var cssModel;

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

	getSelection : function() {
		if (this.selectedWidget) {
			return [this.selectedWidget];
		}
		return [];
	},

	onSelectionChange : function() {
	}

});
});
