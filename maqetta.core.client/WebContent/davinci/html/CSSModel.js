define([
	"dojo/_base/declare",
	"davinci/model/Model",
], function(declare, Model) {

var pushComment = null;

/* shorthand properties */
if(!davinci.html.css.shorthand){
	/* priority ordering of shorthand properties.  0 at start of attribute ... n at bottom */
	
	davinci.html.css.shorthand = [['border', 'background', 'padding', 'margin','border-radius', '-moz-border-radius'],
	                              ['border-top', 'border-right', 'border-left', 'border-bottom'],
	                              ['border-color', 'border-width', 'border-style']];
}

var c=new davinci.html.dd();

return declare("davinci.html.CSSModel", Model, {
});
});