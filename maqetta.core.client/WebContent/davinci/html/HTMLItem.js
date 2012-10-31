/**  
 * @class davinci.html.HTMLItem
 * @constructor 
 * @extends davinci.model.Model
 */
define([
	"dojo/_base/declare",
	"davinci/html/HTMLModel"
], function(declare, HTMLModel) {

return declare("davinci.html.HTMLItem", HTMLModel, {

	constructor: function() {
		this.elementType = "HTMLItem"; 
	},

	getLabel: function() {
		return this.getText({indent: 0});
	},

	onChange: function(arg) {
		// called when the model changes
		//debugger;
		if (this.parent) {
			if (arg) {
				this.parent.onChange(arg);
			}
		}
	},

	_addWS: function(lines, indent) {
		lines = lines || 0;
		indent = indent || 0;
		var res = [];
		for (var i=0; i<lines; i++) {
			res.push("\n");
		}
		res.push("                                          ".substring(0, indent));
		return res.join("");
	},

	close: function() {
		for(var i = 0; i<this.children.length; i++) {
			this.children[i].close();
		}
	},

	getID: function() {
		return this.parent.getID() + ":" + this.startOffset + ":" + this.getLabel();
	},

	getHTMLFile: function() { 
		var element = this;
		while (element && element.elementType != "HTMLFile") {
			element = element.parent;
		}
		return element;
	}

});
});


