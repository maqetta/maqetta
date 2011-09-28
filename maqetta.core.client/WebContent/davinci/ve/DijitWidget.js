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
	getChildren: function(attach)
	{
		var children=[];

		if (this.acceptsHTMLChildren) {
			var dvWidget = function(child) {
				return child._dvWidget;
			};

			// this.containerNode is a Dojo attachpoint. FIXME: Perhaps this detail should be abstracted by a helper?
			return dojo.map(dojo.filter((this.containerNode || this.domNode).children, dvWidget), dvWidget);
		} else if (davinci.ve.metadata.getAllowedChild(this.type)[0] !== 'NONE') {
			dojo.map(this.dijitWidget.getChildren(), function(widget) {
				if (!widget) { return; }
				if (attach && !widget.domNode._dvWidget)
				{
					davinci.ve.widget.getWidget(widget.domNode);
				}
				var child = widget.domNode && widget.domNode._dvWidget;
				if (child) {
					children.push(child);
				}
			});
		}
		return children;
	},
	selectChild: function(widget)
	{
		if (this.dijitWidget.selectChild) {
			this.dijitWidget.selectChild(widget.dijitWidget);
		}
	},
	addChild: function(child,index)
	{
		// #514 & #741 - Some Dojox Mobile containers mixin dijit._Container
		// (thereby adding addChild()), yet still allow HTML (non-Dojo)
		// children.  Therefore, we do a check here for 'acceptsHTMLChildren',
		// so it follows the generic path for those types of containers.
		if (this.dijitWidget.addChild && ! this.acceptsHTMLChildren) {
			if(index === undefined || index === -1) {
				this._srcElement.addChild(child._srcElement);
				this.dijitWidget.addChild(child.dijitWidget);
			}else {
				var children = this.getChildren();
				if(index < children.length) {
					this._srcElement.insertBefore(child._srcElement,children[index]._srcElement);
				}else{
					this._srcElement.addChild(child._srcElement);
				}
				this.dijitWidget.addChild(child.dijitWidget, index);
			}
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
	removeChild: function(/*Widget*/child) {
		if (!child) {
			return;
		}

		// #514 & #741 - Some Dojox Mobile containers mixin dijit._Container
		// (thereby adding addChild()), yet still allow HTML (non-Dojo)
		// children.  Therefore, we do a check here for 'acceptsHTMLChildren',
		// so it follows the generic path for those types of containers.
		if (this.dijitWidget.removeChild && ! this.acceptsHTMLChildren) {
			// it's a Widget and a Container
			this.dijitWidget.removeChild(child.dijitWidget);
			this._srcElement.removeChild(child._srcElement);
			return;
		}
		this.inherited(arguments);
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
