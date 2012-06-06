define(["dojo/_base/declare", "dojo/_base/lang", "dijit/registry", "dojo/dom-attr", "dojo/dom-geometry", "dojo/dom-style", "dijit/_WidgetBase", "dijit/_Container", "dijit/_Contained", "dojo/_base/array", "dojo/query", "../layout/utils", "./_ScrollableMixin"], 
function(declare, lang, registry, dattr, domGeometry, domStyle, WidgetBase, Container, Contained, array, query, layoutUtils, ScrollableMixin){
	return declare("dojox.app.widgets.Container", [WidgetBase, Container, Contained, ScrollableMixin], {
		buildRendering: function(){
			//set default region="center"
			if(!this.region){
				this.region = "center";
				dattr.set(this.srcNodeRef, "region", "center");
			}
			this.inherited(arguments);

			//fix slide transition issue on tablet
			domStyle.set(this.domNode, "overflow-x", "hidden");
			domStyle.set(this.domNode, "overflow-y", "auto");

			// build scrollable container if scrollable=true
			if(this.scrollable && this.scrollable == "true"){
				this.inherited(arguments);
				this.domNode.style.position = "absolute";
				this.domNode.style.width = "100%";
				this.domNode.style.height = "100%";
			}
		},

		startup: function(){
			if(this._started){
				return;
			}
			// startup scrollable container if scrollable=true
			if(this.scrollable && (this.scrollable == "true")){
				this.inherited(arguments);
			}
			this._started = true;
		},

		resize: function(changeSize, resultSize){
			// summary:
			//		Call this to resize a widget, or after its size has changed.
			// description:
			//		Change size mode:
			//			When changeSize is specified, changes the marginBox of this widget
			//			and forces it to re-layout its contents accordingly.
			//			changeSize may specify height, width, or both.
			//
			//			If resultSize is specified it indicates the size the widget will
			//			become after changeSize has been applied.
			//
			//		Notification mode:
			//			When changeSize is null, indicates that the caller has already changed
			//			the size of the widget, or perhaps it changed because the browser
			//			window was resized.  Tells widget to re-layout its contents accordingly.
			//
			//			If resultSize is also specified it indicates the size the widget has
			//			become.
			//
			//		In either mode, this method also:
			//			1. Sets this._borderBox and this._contentBox to the new size of
			//				the widget.  Queries the current domNode size if necessary.
			//			2. Calls layout() to resize contents (and maybe adjust child widgets).
			//
			// changeSize: Object?
			//		Sets the widget to this margin-box size and position.
			//		May include any/all of the following properties:
			//	|	{w: int, h: int, l: int, t: int}
			//
			// resultSize: Object?
			//		The margin-box size of this widget after applying changeSize (if
			//		changeSize is specified).  If caller knows this size and
			//		passes it in, we don't need to query the browser to get the size.
			//	|	{w: int, h: int}

			var node = this.domNode;

			// set margin box size, unless it wasn't specified, in which case use current size
			if(changeSize){
				domGeometry.setMarginBox(node, changeSize);
			}

			// If either height or width wasn't specified by the user, then query node for it.
			// But note that setting the margin box and then immediately querying dimensions may return
			// inaccurate results, so try not to depend on it.
			var mb = resultSize || {};
			lang.mixin(mb, changeSize || {});	// changeSize overrides resultSize
			if( !("h" in mb) || !("w" in mb) ){
				mb = lang.mixin(domGeometry.getMarginBox(node), mb);	// just use domGeometry.marginBox() to fill in missing values
			}

			// Compute and save the size of my border box and content box
			// (w/out calling domGeometry.getContentBox() since that may fail if size was recently set)
			var cs = domStyle.getComputedStyle(node);
			var me = domGeometry.getMarginExtents(node, cs);
			var be = domGeometry.getBorderExtents(node, cs);
			var bb = (this._borderBox = {
				w: mb.w - (me.w + be.w),
				h: mb.h - (me.h + be.h)
			});
			var pe = domGeometry.getPadExtents(node, cs);
			this._contentBox = {
				l: domStyle.toPixelValue(node, cs.paddingLeft),
				t: domStyle.toPixelValue(node, cs.paddingTop),
				w: bb.w - pe.w,
				h: bb.h - pe.h
			};

			// Callback for widget to adjust size of its children
			this.layout();
		},

		layout: function(){
			// summary:
			//		layout container

			children = query("> [region]", this.domNode).map(function(node){
				var w = registry.getEnclosingWidget(node);
				if (w){return w;}

				return {
					domNode: node,
					region: dattr.get(node,"region")
				}
			});

			if(this._contentBox){
				layoutUtils.layoutChildren(this.domNode, this._contentBox, children);
			}
			array.forEach(this.getChildren(), function(child){
				if(!child._started && child.startup){
					child.startup();
				}
			});
		}
	});
});
