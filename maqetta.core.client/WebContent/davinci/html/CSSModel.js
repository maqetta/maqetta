define([
	"dojo/_base/declare",
	"davinci/model/Model",
], function(declare, Model) {

var CSSModel = declare("davinci.html.CSSModel", Model, {});

CSSModel.shorthand = [['border', 'background', 'padding', 'margin','border-radius', '-moz-border-radius'],
                      ['border-top', 'border-right', 'border-left', 'border-bottom'],
                      ['border-color', 'border-width', 'border-style']
];

return CSSModel;

});