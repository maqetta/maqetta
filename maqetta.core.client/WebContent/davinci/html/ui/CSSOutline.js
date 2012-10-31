define([
	"dojo/_base/declare",
	"davinci/html/ui/CSSOutlineModel"
], function(declare, CSSOutlineModel){
	
return declare("davinci.html.ui.CSSOutline", null, {

	constructor : function(model) {
		this._cssModel = model;
	},

	getModel : function() {
		this._model = new CSSOutlineModel(this._cssModel);
		return this._model;
	}

});
});
