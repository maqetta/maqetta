define([
	"require",
	"dojo/_base/declare",
	"dojo/_base/window",
	"dojo/_base/lang",
	"dojo/dom-attr",
	"dojo/parser",
	"./_Widget",
	"./metadata"
//	"./widget"
], function(
	require,
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

	//FIXME: Horrible constructor design.
	//For CreateTool, all 6 params are passed in, but dijitWidget and widgetType have same value
	//For file opening, only dijitWidget (3rd param) and widgetType (6th param) are passed in.
	constructor: function(mixin, node, dijitWidget, metadata, srcElement, widgetType) {
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
				[node],
				mixin,
				// Don't allow `instantiate()` to call the widget's `startup()`;
				// it's called later by Maqetta.
				{
					noStart: true
				}
			);
			dijitWidget = instances[0];

			if (ss.firstChild) {
				// remove from scratch space
				// - some widget (i.e. Dialog) get added to special locations,
				//   not to the parent of the incoming `node`.  Therefore, we
				//   need to check before removing child from `ss`.
				ss.removeChild(ss.firstChild);
			}

			// XXX move this block after `if`?
			this.domNode = dijitWidget.domNode;
			dijitWidget.domNode._dvWidget = this;
			this.isLayoutContainer = dijitWidget.isLayoutContainer;
		} else {
			if(!widgetType){
				this.type = dijitWidget.declaredClass.replace(/\./g, "/"); //FIXME: not a safe association;
			}else{
				this.type = widgetType.replace(/\./g, "/");
			}
		}

		var allowedChild = davinci.ve.metadata.getAllowedChild(this.type);
		this.acceptsHTMLChildren = allowedChild[0] === 'ANY' ||
								   allowedChild.toString().toUpperCase().indexOf('HTML') !== -1;
		this.dijitWidget=dijitWidget;
		this.containerNode=dijitWidget.containerNode;
		this.styleNode=dijitWidget.styleNode;
		this.id=dijitWidget.id;
	},

	getParent: function() {
		if(!this.dijitWidget || !this.dijitWidget.domNode || !this.dijitWidget.domNode.parentNode){
			return;
		}
		var veWidget = require("davinci/ve/widget");
		var widget = this.dijitWidget;
		do{
			widget = veWidget.getEnclosingWidget(widget.domNode.parentNode);
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
				// The "_maqNotDVWidget" property on a Dijit indicates that even though
				// Dojo treats the given DOM node as a child, Maqetta should ignore it
				// This was necessary to deal with #3425 because Heading creates a real
				// widget (with data-dojo-type and everything) under the hood 
				// when the 'back' property gets a value. 
				// To use this feature, Helper functions on an ancestor
				// widget need to put this property on any child widgets that the Maqetta
				// page editor needs to ignore.
				// FIXME: There has to be a cleaner way of doing this.
				if(!child._maqNotDVWidget){
					if (attach) {
						children.push(require("davinci/ve/widget").getWidget(child.domNode));
					} else {
	                    var widget = child.domNode && child.domNode._dvWidget;
	                    if (widget) {
	                        children.push(widget);
	                    }
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
	
	_addChildToDom: function(child, index) {
		// Dijit's addChild() only works for widgets whose children are all Dijit
		// widgets themselves.  Therefore, we only call that function if the
		// widget does not accept HTML children.
		if (!this.acceptsHTMLChildren) {
			this.dijitWidget.addChild(child.dijitWidget, index);
		} else {
			this.inherited(arguments);

			// See impl of dijit._Container.addChild()
			var dw = child.dijitWidget;
			if (dw && this.dijitWidget._started && !dw._started) {
				child.startup();
			}
		}
	},

    _removeChildFromDom: function(/*Widget*/child) {
        if (this.dijitWidget.removeChild && child.dijitWidget) {
            this.dijitWidget.removeChild(child.dijitWidget);
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
		var context = this.getContext();
		// make sure we are comparing against the same two classes within same two documents
		var djit = context.getDijit();
		var retval = this.dijitWidget.isInstanceOf(djit.layout._LayoutWidget);
		return retval;
	},

	resize: function() {
		var helper = this.getHelper();
		if (helper && helper.resize) {
			helper.resize(this);
		} else {
			if (this.dijitWidget.resize) {
				this.dijitWidget.resize();
			}
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
