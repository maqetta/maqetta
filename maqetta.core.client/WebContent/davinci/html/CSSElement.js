/**  
 * @class davinci.html.CSSElement
 * @constructor 
 * @extends davinci.model.Model
 */
define([
	"dojo/_base/declare",
	"davinci/model/Model"
], function(declare, Model) {

return declare("davinci.html.CSSElement", Model, {

	constructor: function() {
		if (typeof pushComment != 'undefined' && pushComment !== null) {
			this.comment = pushComment;
			pushComment = null;

		}
		this.elementType = "CSSElement";
	},

	getLabel: function() {
		context= { indent: 0, noComments: true};
		return this.getText(context);
	},
	
	onChange: function(arg) {
		if (this.parent) {
			if (arg){ 
				this.parent.onChange(arg);
			} else {
				this.parent.onChange(this);
			}
		}

	},
	
	close: function(includeImports) {

		for(var i = 0;i<this.children;i++) {
			this.children[i].close();
		}
	},

	getCSSFile: function() {
		var rule = this.getCSSRule();
		if (rule) {
			return rule.parent;
		}
	},

	getCSSRule: function() {},

	_convertNode: function(domNode) {
		if (dojo.isArray(domNode)) { 
			return domNode;
		}
		var nodes = [];
		while (domNode && domNode.tagName != 'HTML') {
			nodes.push({
				tagName : domNode.tagName,
				id : domNode.id,
				classes : (domNode.className && domNode.className.split(" "))
			});
			domNode = domNode.parentNode;
		}
		return nodes;
	},

	getID: function() {
		return this.parent.getID()+":"+this.startOffset+":"+this.getLabel();
	}

});
});
