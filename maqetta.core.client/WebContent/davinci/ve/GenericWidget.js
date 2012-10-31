define([
        "dojo/_base/declare",
        "./_Widget"
//        "./widget"
], function(declare, _Widget) {

return declare("davinci.ve.GenericWidget", _Widget, {
	isGenericWidget: true,
	constructor: function (params,node,type,metadata,srcElement) {
		dojo.attr(node, "dvwidget", type);
		if(srcElement) {
			srcElement.addAttribute("dvwidget", type);
		}
	},
	buildRendering: function() {
//		if(this.srcNodeRef) {
//			this.domNode = this.srcNodeRef;
//		}else{
//			this.domNode = dojo.doc.createElement("div");
//		}
		this.containerNode = this.domNode; // for getDescendants()
		if(this._params) {
			for(var name in this._params) {
				this.domNode.setAttribute(name, this._params[name]);
			}
			this._params = undefined;
		}
/*REMOVE THIS
		try{
			// this won't work on an SVG element in FireFox
			dojo.addClass(this.domNode, "HtmlWidget");
		}catch(e) {
			console.debug("Error in davinci.ve.helpers.loadHtmlWidget.buildRendering: "+e);
		}
*/
	},
	_getChildrenData: function(options) {
		var childrenData = [];
		var childNodes = this.domNode.childNodes;
		for(var i = 0; i < childNodes.length; i++) {
			var n = childNodes[i];
			var d;
			switch(n.nodeType) {
			case 1: // Element
				var w = require("davinci/ve/widget").byNode(n);
				if(w) {
					d = w.getData( options);
				}
				break;
			case 3: // Text
				d = n.nodeValue.trim();
				if(d && options.serialize) {
					d = davinci.html.escapeXml(d);
				}
				break;
			case 8: // Comment
				d = "<!--" + n.nodeValue + "-->";
				break;
			}
			if(d) {
				childrenData.push(d);
			}
		}
		if(childrenData.length === 0) {
			return undefined;
		}
		return childrenData;
	},

	setProperties: function(properties) {
		var node = this.domNode;

		for(var name in properties) {
			if (name === 'style') { // needed for position absolute
				dojo.style(node, properties[name]);
			} else {
				if(!properties[name]) {
					node.removeAttribute(name);
				} else {
					node[name]= properties[name];
		//			dojo.attr(node,name,properties[name]);
				}
			}

		}
		this.inherited(arguments);
	},

	_attr: function(name,value) {
		if (arguments.length>1) {
			this.domNode.setAttribute(name, value);
		} else {
			return this.domNode.getAttribute(name);
		}
	},

	getTagName: function() {
		return this.domNode.nodeName.toLowerCase();
	}
});

});
