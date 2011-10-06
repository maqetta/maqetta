define("davinci/ve/HTMLWidget", ["davinci/ve/_Widget"], function() {

/*return*/ dojo.declare("davinci.ve.HTMLWidget", davinci.ve._Widget, {

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
            if (d && options.serialize) {
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
                var w = davinci.ve.widget.byNode(node);
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
				if(!properties[name]) {
					node.removeAttribute(name);
				} else {
				    if (!modelOnly) {
				        node[name] = properties[name];
				    }
		//			dojo.attr(node,name,properties[name]);
				}
			}
		}
		this.inherited(arguments);
	},

	 getContainerNode: function() {
		// summary:
		//		Returns the passed node itself if the node is allowed to have childNodes.
		//		Otherwise returns undefined.
		//

//FIXME: This isn't right. This info should be table-driven and not hard-coded.
//Better to put a 'isContainer' or 'canHaveChildren' property in widget metadata.
//That way, it would apply to OAWidgets, also.
//But actually, we probably need something more elaborate where we not only say
//whether an element can have children, we also want to say which children are
//allowed. For example, a TR should only have TD or TH children. Similarly,
//certain Dojo widget can only have certain Dojo widgets as children.
//Also, some widgets (e.g., TabContainer) should not accept children via drag/drop
//or rearrangement in Outline palette. Instead, that widget should only add/delete
//children via special controller logic.
//Maybe put some of this "children allowed" info in davinci.Runtime.widgetTable?

		var tagName = this.getTagName();
		switch(tagName) {
		case "input":
		case "img":
		case "hr":
		case "br":
		case "script":
			return undefined;
		default:
			return this.domNode;
		}
	},

	getChildren: function() {
		var dvWidget = function(child) {
			return child._dvWidget;
		};

		return dojo.map(dojo.filter(this.domNode.children, dvWidget), dvWidget);
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

	_getWidget: function() {
		return this.domNode;
	},

	getTagName: function() {
		return this.domNode.nodeName.toLowerCase();
	}
});

});
