define("davinci/ve/DijitWidget", ["davinci/ve/_Widget", "davinci/ve/metadata"], function() {

/*return*/ dojo.declare("davinci.ve.DijitWidget", davinci.ve._Widget, {

	isDijitWidget: true,

	constructor: function(mixin, node, dijitWidget, metadata, srcElement) {
	
		if (dojo.isString(dijitWidget)) {
			var c = davinci.ve.widget._dojo(node).getObject(dijitWidget);
			// create the instance (follow parser.js)
			// XXX Bug 7674 - This whole code should be replaced with call to dojo.parser.parse()
			dojo.attr(node, "dojoType", dijitWidget);
			if(srcElement) {
				srcElement.addAttribute("dojoType", dijitWidget);
			}
			
            // carry over node attributes to params that are passed in to constructor
            var proto = c.prototype, params = {};
            for (var prop in proto) {
                var val = node.hasAttribute(prop) ? node.getAttribute(prop) : null;
                if (!val) {
                    continue;
                }
                switch(typeof proto[prop]) {
                case "string":
                    params[prop] = val;
                    break;
                case "number":
                    params[prop] = +val;
                    break;
                case "boolean":
                    params[prop] = !!val;
                    break;
                case "object":
                    params[prop] = dojo.fromJson(val);
                }
            }
            params["class"] = node.className;
            params["style"] = node.style && node.style.cssText;

            // mixin other properties into params; 'mixin' takes precedence
            dojo.mixin(params, mixin);

            // Bug 7675 - Some widgets (i.e. dojox.mobile.IconItem) require a parent node.
            var parentNode = node.parentNode, didCreateParent = false;
            if (!parentNode) {
                parentNode = node.ownerDocument.createElement("div");
                parentNode.appendChild(node);
                didCreateParent = true;
            }

            var markupFactory = c["markupFactory"];
			if(!markupFactory && c["prototype"]) {
				markupFactory = c.prototype["markupFactory"];
			}
			try {
				var dijitWidget = markupFactory ? markupFactory(params, node, c) : new c(params, node);
				this.domNode=dijitWidget.domNode;
				dijitWidget.domNode._dvWidget=this;
				if (dijitWidget.containerNode) {
					dijitWidget.containerNode._dvWidget=this;
				}
				this.isLayoutContainer=dijitWidget.isLayoutContainer;

                // clean up -- "unwrap" incoming node from created DIV (bug 7675)
                if (didCreateParent && parentNode.firstChild) {
                    node = parentNode.removeChild(parentNode.firstChild);
                }
			} catch (e) {
				console.error(e);
				throw e;
				//debugger;
			}
		}else{
			this.type=dijitWidget.declaredClass;
		}

		var allowedChild = davinci.ve.metadata.getAllowedChild(this.type);
		this.acceptsHTMLChildren = allowedChild[0] === 'ANY' ||
								   allowedChild.indexOf('HTML') !== -1;
		this.dijitWidget=dijitWidget;
		this.containerNode=dijitWidget.containerNode;
		this.styleNode=dijitWidget.styleNode;
		this.id=dijitWidget.id;

		var helper = this.getHelper();
		if(helper && helper.create && srcElement) {
			helper.create(this, srcElement);
		}
	},
	getParent: function()
	{
		var widget;
		do{
			widget = davinci.ve.widget.getEnclosingWidget(this.dijitWidget.domNode.parentNode);
		}while(widget && widget.dijitWidget && widget.dijitWidget.declaredClass.split(".").pop().charAt(0) == "_");
			// skip intermediates, like _AccordionInnerContentPane
			//TODO: use widget.getParent() and have it support this behavior?
		return widget;
	},

	_getChildren: function(attach) {
        if (this.acceptsHTMLChildren) {
            return this.inherited(arguments);
        }

		var children=[];

		if (davinci.ve.metadata.getAllowedChild(this.type)[0] !== 'NONE') {
			this.dijitWidget.getChildren().forEach(function(child) {
				if (attach) {
					children.push(davinci.ve.widget.getWidget(child.domNode));
				} else {
                    var widget = child.domNode && child.domNode._dvWidget;
                    if (widget) {
                        children.push(widget);
                    }
                }
			});
		}
		return children;
	},

	_getContainerNode: function() {
		return this.containerNode || this.domNode;
	},

	selectChild: function(widget)
	{
		if (this.dijitWidget.selectChild) {
			this.dijitWidget.selectChild(widget.dijitWidget);
		}
	},
	
	addChild: function(child, index) {
	    if (this.dijitWidget.addChild && child.dijitWidget) {
	        if (typeof index === 'number' && index >= 0) {
				var children = this.getChildren();
				if(index < children.length) {
                    this._srcElement.insertBefore(child._srcElement,
                            children[index]._srcElement);
				}else{
					this._srcElement.addChild(child._srcElement);
				}
                if (! this.acceptsHTMLChildren) {
				this.dijitWidget.addChild(child.dijitWidget, index);
                } else {
                    // See comment for _addChildHooked() for more info.
                    this._addChildHooked(child.dijitWidget, index);
			}
		} else {
                this._srcElement.addChild(child._srcElement);
                this.dijitWidget.addChild(child.dijitWidget);
            }
        } else {
			this.inherited(arguments);
		}
	},

    // #514, #741, #856 - Some Dojox Mobile containers mixin dijit._Container
    // (thereby adding addChild()), yet still allow HTML (non-Dojo)
    // children. We still need to call addChild() when the child is another
    // Dijit/Dojox widget, but there is a problem -- internally, the Dojo
    // code only returns children which are Dijit/Dojox widgets, ignoring
    // any of our HTML widgets. To work around this, we temporarily replace
    // the Dijit/Dojox widget's getChildren() with our own, which returns all
    // Maqetta managed children.
    _addChildHooked: function(widget, index) {
        var parentWidget = this.dijitWidget,
            _getChildren = parentWidget.getChildren;
        parentWidget.getChildren = dojo.hitch(this, this.getChildren);
        parentWidget.addChild(widget, index);
        parentWidget.getChildren = _getChildren;
    },

    removeChild: function(/*Widget*/child) {
        if (!child) {
            return;
        }

        if (this.dijitWidget.removeChild && child.dijitWidget) {
            this.dijitWidget.removeChild(child.dijitWidget);
            this._srcElement.removeChild(child._srcElement);
        } else {
            this.inherited(arguments);
        }
    },

	_getWidget: function() {
		return this.dijitWidget;
	},
	startup: function()
	{
		this.dijitWidget.startup();

	},
	isLayout: function()
	{
		return this.dijitWidget.isInstanceOf(dijit.layout._LayoutWidget);
	},
	resize: function()
	{
		if (this.dijitWidget.resize) {
			this.dijitWidget.resize();
		}
	},

	renderWidget: function() {
		if(this.dijitWidget.render) {
			this.dijitWidget.render();
		}else if(this.dijitWidget.chart) { // TODO: move to helper
			var box = dojo.marginBox(this.dijitWidget.domNode);
			this.dijitWidget.resize(box);
		}
		if (this.domNode.parentNode._dvWidget && this.domNode.parentNode._dvWidget.isDijitWidget) {
			this._refresh(this.domNode.parentNode);
		}
	},

	_refresh: function(node) {
		/* if the widget is a child of a dijitContainer widget
		 * we may need to refresh the parent to make it all look correct in page editor
		 */
		var parentNode = node.parentNode;
		if (parentNode._dvWidget && parentNode._dvWidget.isDijitWidget) {
			this._refresh(parentNode);
		} else if (node._dvWidget.resize) {
			node._dvWidget.resize(); // this step may not be needed
		}
	},

	_attr: function (name,value)
	{
		return this.dijitWidget.get.apply(this.dijitWidget, arguments);
	}
});

});
