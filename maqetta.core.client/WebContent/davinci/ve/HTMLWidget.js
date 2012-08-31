define([
        "dojo/_base/declare",
        "./_Widget"
], function(declare, _Widget) {

return declare("davinci.ve.HTMLWidget", _Widget, {

	isHtmlWidget: true,

	constructor: function (params,node) {
		this.type = "html."+node.tagName.toLowerCase();
		this.acceptsHTMLChildren = true;
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
		try{
			// this won't work on an SVG element in FireFox
			dojo.addClass(this.domNode, "HtmlWidget");
		}catch(e) {
			console.debug("Error in davinci.ve.helpers.loadHtmlWidget.buildRendering: "+e);
		}
	},

    _getChildrenData: function(options) {
        function getTextContent(node) {
            var d = node.nodeValue.trim();
            if (d /*&& options.serialize*/) { // #2349
                d = davinci.html.escapeXml(d);
            }
            return d;
        }
        
        var domNode = this.domNode;
        
        if (! domNode.hasChildNodes()) {
            return null;
        }
        
        // Check if text node is the only child. If so, return text content as
        // the child data. We do this to match up with the code in
        // davinci.ve.widget.createWidget(), which can take child data either
        // as an array or as a string (representing the innerHTML of a node).
        if (domNode.childNodes.length === 1 && domNode.firstChild.nodeType === 3) {
            return getTextContent(domNode.firstChild);
        }

        var data = [];
        dojo.forEach(domNode.childNodes, function(node) {
            var d;
            switch (node.nodeType) {
            case 1: // Element
                var w = require("davinci/ve/widget").byNode(node);
                if (w) {
                    d = w.getData(options);
                }
                break;
            case 3: // Text
                d = getTextContent(node);
                break;
            case 8: // Comment
                d = "<!--" + node.nodeValue + "-->";
                break;
            }
            if (d) {
                data.push(d);
            }
        });
        return data;
    },

	setProperties: function(properties, modelOnly) {

        var node = this.domNode;
        modelOnly = modelOnly || false; // default modelOnly to false

		for(var name in properties) {
			if (name === 'style') { // needed for position absolute
				dojo.style(node, properties[name]);
			} else {
			    if (!modelOnly) {
					var property = properties[name];
					// The following check on "property" will result in false value for empty strings
					if(property || typeof property == "boolean" || typeof property == "number") {
					    node.setAttribute(name, property);
					} else {
						node.removeAttribute(name);
					}
			    }
			}
		}
		this.inherited(arguments);
	},

	// pass resize along to any child widgets who know how to resize... currently a dijit-only concept.
	// should this method be defined on the _Widget base class?
	resize: function() {
		this.getChildren().forEach(function(widget){
			if (widget.resize) {
				widget.resize();
			}
		});
	},

	_attr: function (name,value) {
		if (arguments.length > 1) {
			this.domNode[name] = value;
		} else {
			return this.domNode[name];
		}
	},

	getTagName: function() {
		return this.domNode.nodeName.toLowerCase();
	}
});

});
