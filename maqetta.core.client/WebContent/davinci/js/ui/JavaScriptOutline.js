define([
	"dojo/_base/declare",
	"davinci/js/ui/JSOutlineModel",
	"davinci/ui/widgets/DavinciModelTreeModel"
], function(declare, JSOutlineModel, DavinciModelTreeModel) {

return declare("davinci.js.ui.JavaScriptOutline", null, {

	constructor: function(model) {
		this._jsModel = model;
	},
	
	getModel: function() {
		this._model = new JSOutlineModel(this._jsModel);
		return this._model;
	}

});
});
