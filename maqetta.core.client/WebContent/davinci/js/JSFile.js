/**
 * @class davinci.js.JSFile
 * @constructor
 * @extends davinci.js.JSElement
 */
define([
	"dojo/_base/declare",
	"davinci/js/JSElement"
], function(declare, JSElement) {

return declare("davinci.js.JSFile", JSElement, {

	constructor: function(origin) {
		this.elementType = "JSFile";
		this.nosemicolon = true;
		this._textContent = "";
		// id only, never loaded
		if (origin) {
			this.origin = origin;
		}
	},

	getText: function(context) {
		return this._textContent;
	},

	setText: function(text) {
		this._textContent = text;
	},

	getLabel: function() {
		return this.fileName;
	},

	getID: function() {
		return this.fileName;
	},

	visit: function(visitor) {
		var dontVisitChildren;

		dontVisitChildren = visitor.visit(this);
		if (!dontVisitChildren) {
			for ( var i = 0; i < this.children.length; i++ ) {
				this.children[i].visit(visitor);
			}
		}
		if (visitor.endVisit) {
			visitor.endVisit(this);
		}
	}

});
});