/**  
 * @class davinci.html.CSSFragment
   * @constructor 
   * @extends davinci.html.CSSFile
 */
define([
	"dojo/_base/declare",
	"davinci/html/CSSFile"
], function(declare, CSSFile) {

return declare("davinci.html.CSSFragment", CSSFile, {

constructor: function(args) {
	this.elementType = "CSSFile";
	dojo.mixin(this, args);
	if (!this.options) {
		this.options = {
			xmode : 'style',
			css : true,
			expandShorthand : false
		};
	}
	var txt = null;

	if (this.url && this.loader) {
		txt = this.loader(this.url);
	} else if (this.url) {
		var file = this.getResource();
		if (file)
			txt = file.getText();
	}
	if (txt) {
		this.setText(txt);
	}
}

});
});
