/**
 * @class davinci.js.Debugger
 * @extends davinci.js.JSElement
 * @constructor
 */
define([
	"dojo/_base/declare",
	"davinci/js/JSElement"
], function(declare, JSElement) {

return declare("davinci.js.JSCase", JSElement, {

	constructor: function(statement) {
		this.elementType = "JSDebugger";
	},

	getText: function(context) {
		var s = "";
		if (this.comment) {
			s += this.printNewLine(context) + this.comment.getText(context);
		}
		if (this.label) {
			s += this.printNewLine(context) + this.label.getText(context);
		}
		return s + "debugger";
	}

});
});