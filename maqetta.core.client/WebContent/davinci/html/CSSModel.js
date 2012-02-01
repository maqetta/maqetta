define([
	"dojo/_base/declare",
	"davinci/model/Model",
], function(declare, Model) {

var CSSModel = {};

return declare("davinci.html.CSSModel", Model, {

	constructor: function() {
		CSSModel.shorthand = [['border', 'background', 'padding', 'margin','border-radius', '-moz-border-radius'],
		                      ['border-top', 'border-right', 'border-left', 'border-bottom'],
		                      ['border-color', 'border-width', 'border-style']
		];
	}
});
});