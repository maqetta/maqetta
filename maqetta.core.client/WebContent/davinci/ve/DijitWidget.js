define([
	"dojo/_base/declare",
	"dojo/_base/window",
	"dojo/_base/lang",
	"dojo/dom-attr",
	"dojo/parser",
	"./_Widget",
	"./metadata"
//	"./widget"
], function(
	declare,
	dwindow,
	dlang,
	domAttr,
	parser,
	_Widget,
	metadata
) {

var SCRATCHSPACE = '__DijitWidgetScratchSpace';

return declare("davinci.ve.DijitWidget", _Widget, {

	isDijitWidget: true,

	constructor: function(mixin, node, dijitWidget, metadata, srcElement) {
		if (typeof dijitWidget === 'string') {
			// XXX we should just add dojo type in metadata and remove this code
			// add dojo type to node
			var type = domAttr.get(node, 'data-dojo-type') || domAttr.get(node, 'dojoType');
			if (!type) {
				domAttr.set(node, 'data-dojo-type', dijitWidget);
			}
			if (srcElement) {
				srcElement.addAttribute('data-dojo-type', dijitWidget);
			}

			var doc = node.ownerDocument,
				win = doc.defaultView,
				ss = doc[SCRATCHSPACE];
			if (!ss) {
				// Since node is sometimes completely replaced by the Dojo parser,
				// it needs a parent. Create (and cache) a DIV to use as the
				// temporary parent.
				ss = doc[SCRATCHSPACE] = doc.createElement('div');
			}
			ss.appendChild(node);

			// instantiate widget, in context of editor iframe
			var instances = win.require('dojo/parser').instantiate(
				[{
					type: dijitWidget,
					node: node
				}],
				mixin,
				// Don't allow `instantiate()` to call the widget's `startup()`;
				// it's called later by Maqetta.
				{
					noStart: true
				}
			);
			dijitWidget = instances[0];

			// remove from scratch space
			node = ss.removeChild(ss.firstChild);

			// XXX move this block after `if`?
			this.domNode = dijitWidget.domNode;
			dijitWidget.domNode._dvWidget = this;
			if (dijitWidget.containerNode) {
				dijitWidget.containerNode._dvWidget = this;
			}
			this.isLayoutContainer = dijitWidget.isLayoutContainer;
		} else {
			this.type = dijitWidget.declaredClass;
		}

		var allowedChild = davinci.ve.metadata.getAllowedChild(this.type);
		this.acceptsHTMLChildren = allowedChild[0] === 'ANY' ||
								   allowedChild.indexOf('HTML') !== -1;
		this.dijitWidget=dijitWidget;
		this.containerNode=dijitWidget.containerNode;
		this.styleNode=dijitWidget.styleNode;
		this.id=dijitWidget.id;
	},

	getParent: function() {
		var widget;
		do{
			widget = require("davinci/ve/widget").getEnclosingWidget(this.dijitWidget.domNode.parentNode);
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
					children.push(require("davinci/ve/widget").getWidget(child.domNode));
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
            		//AWE TODO this.dijitWidget.addChild(child.dijitWidget, index);
            		this._addChildHelper(child.dijitWidget, index);
                } else {
                    // See comment for _addChildHooked() for more info.
                    this._addChildHooked(child.dijitWidget, index);
                }
	        } else {
                this._srcElement.addChild(child._srcElement);
                //AWE TODOthis.dijitWidget.addChild(child.dijitWidget);
                this._addChildHelper(child.dijitWidget);
            }
        } else {
			this.inherited(arguments);
		}
	},
	
	_addChildHelper: function(dijitWidget, index) {
		//AWE TODO
		var helper = this.getHelper();
		if (helper && helper.addChild) {
			helper.addChild(this, dijitWidget, index);
		} else {
			this.dijitWidget.addChild(dijitWidget, index);
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


    _getPropertyValue: function(name) {
        return this.dijitWidget.get(name);
    },

	startup: function() {
		this.dijitWidget.startup();
	},

	isLayout: function() {
		return this.dijitWidget.isInstanceOf(dijit.layout._LayoutWidget);
	},

	resize: function() {
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
