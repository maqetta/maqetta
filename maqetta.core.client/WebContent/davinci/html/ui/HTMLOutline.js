define([
	"dojo/_base/declare",
	"davinci/html/ui/HTMLOutlineModel"
], function(declare, HTMLOutlineModel){
	
return declare("davinci/html/ui/HTMLOutline", null, {

	constructor : function(model) {
		this._htmlModel = model;
	},
	
	getModel : function() {
		this._model = new HTMLOutlineModel(this._htmlModel);
		return this._model;
	}

});
});
