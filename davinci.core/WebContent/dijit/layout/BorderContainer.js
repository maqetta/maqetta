dojo.provide("dijit.layout.BorderContainer");

dojo.require("dijit.layout._LayoutWidget");
dojo.require("dojo.cookie");

dojo.declare(
	"dijit.layout.BorderContainer",
	dijit.layout._LayoutWidget,
{
	// summary:
	//		Provides layout in up to 5 regions, a mandatory center with optional borders along its 4 sides.
	//
	// description:
	//		A BorderContainer is a box with a specified size, such as style="width: 500px; height: 500px;",
	//		that contains a child widget marked region="center" and optionally children widgets marked
	//		region equal to "top", "bottom", "leading", "trailing", "left" or "right".
	//		Children along the edges will be laid out according to width or height dimensions and may
	//		include optional splitters (splitter="true") to make them resizable by the user.  The remaining
	//		space is designated for the center region.
	//
	//		NOTE: Splitters must not be more than 50 pixels in width.
	//
	//		The outer size must be specified on the BorderContainer node.  Width must be specified for the sides
	//		and height for the top and bottom, respectively.  No dimensions should be specified on the center;
	//		it will fill the remaining space.  Regions named "leading" and "trailing" may be used just like
	//		"left" and "right" except that they will be reversed in right-to-left environments.
	//
	// example:
	// |	<div dojoType="dijit.layout.BorderContainer" design="sidebar" gutters="false"
	// |            style="width: 400px; height: 300px;">
	// |		<div dojoType="ContentPane" region="top">header text</div>
	// |		<div dojoType="ContentPane" region="right" splitter="true" style="width: 200px;">table of contents</div>
	// |		<div dojoType="ContentPane" region="center">client area</div>
	// |	</div>

	// design: String
	//		Which design is used for the layout:
	//			- "headline" (default) where the top and bottom extend
	//				the full width of the container
	//			- "sidebar" where the left and right sides extend from top to bottom.
	design: "headline",

	// gutters: Boolean
	//		Give each pane a border and margin.
	//		Margin determined by domNode.paddingLeft.
	//		When false, only resizable panes have a gutter (i.e. draggable splitter) for resizing.
	gutters: true,

	// liveSplitters: Boolean
	//		Specifies whether splitters resize as you drag (true) or only upon mouseup (false)
	liveSplitters: true,

	// persist: Boolean
	//		Save splitter positions in a cookie.
	persist: false,

	baseClass: "dijitBorderContainer",

	// _splitterClass: String
	// 		Optional hook to override the default Splitter widget used by BorderContainer
	_splitterClass: "dijit.layout._Splitter",

	postMixInProperties: function(){
		// change class name to indicate that BorderContainer is being used purely for
		// layout (like LayoutContainer) rather than for pretty formatting.
		if(!this.gutters){
			this.baseClass += "NoGutter";
		}
		this.inherited(arguments);
	},

	postCreate: function(){
		this.inherited(arguments);

		this._splitters = {};
		this._splitterThickness = {};
	},

	startup: function(){
		if(this._started){ return; }
		dojo.forEach(this.getChildren(), this._setupChild, this);
		this.inherited(arguments);
	},

	_setupChild: function(/*dijit._Widget*/ child){
		// Override _LayoutWidget._setupChild().

		var region = child.region;
		if(region){
			this.inherited(arguments);

			dojo.addClass(child.domNode, this.baseClass+"Pane");

			var ltr = this.isLeftToRight();
			if(region == "leading"){ region = ltr ? "left" : "right"; }
			if(region == "trailing"){ region = ltr ? "right" : "left"; }

			//FIXME: redundant?
			this["_"+region] = child.domNode;
			this["_"+region+"Widget"] = child;

			// Create draggable splitter for resizing pane,
			// or alternately if splitter=false but BorderContainer.gutters=true then
			// insert dummy div just for spacing
			if((child.splitter || this.gutters) && !this._splitters[region]){
				var _Splitter = dojo.getObject(child.splitter ? this._splitterClass : "dijit.layout._Gutter");
				var splitter = new _Splitter({
					id: child.id + "_splitter",
					container: this,
					child: child,
					region: region,
					live: this.liveSplitters
				});
				splitter.isSplitter = true;
				this._splitters[region] = splitter.domNode;
				dojo.place(this._splitters[region], child.domNode, "after");

				// Splitters arent added as Contained children, so we need to call startup explicitly
				splitter.startup();
			}
			child.region = region;
		}
	},

	_computeSplitterThickness: function(region){
		this._splitterThickness[region] = this._splitterThickness[region] ||
			dojo.marginBox(this._splitters[region])[(/top|bottom/.test(region) ? 'h' : 'w')];
	},

	layout: function(){
		// Implement _LayoutWidget.layout() virtual method.
		for(var region in this._splitters){ this._computeSplitterThickness(region); }
		this._layoutChildren();
	},

	addChild: function(/*dijit._Widget*/ child, /*Integer?*/ insertIndex){
		// Override _LayoutWidget.addChild().
		this.inherited(arguments);
		if(this._started){
			this.layout(); //OPT
		}
	},

	removeChild: function(/*dijit._Widget*/ child){
		// Override _LayoutWidget.removeChild().
		var region = child.region;
		var splitter = this._splitters[region];
		if(splitter){
			dijit.byNode(splitter).destroy();
			delete this._splitters[region];
			delete this._splitterThickness[region];
		}
		this.inherited(arguments);
		delete this["_"+region];
		delete this["_" +region+"Widget"];
		if(this._started){
			this._layoutChildren();
		}
		dojo.removeClass(child.domNode, this.baseClass+"Pane");
	},

	getChildren: function(){
		// Override _LayoutWidget.getChildren() to only return real children, not the splitters.
		return dojo.filter(this.inherited(arguments), function(widget){
			return !widget.isSplitter;
		});
	},

	getSplitter: function(/*String*/region){
		// summary:
		//		Returns the widget responsible for rendering the splitter associated with region
		var splitter = this._splitters[region];
		return splitter ? dijit.byNode(splitter) : null;
	},

	resize: function(newSize, currentSize){
		// Overrides _LayoutWidget.resize().

		// resetting potential padding to 0px to provide support for 100% width/height + padding
		// TODO: this hack doesn't respect the box model and is a temporary fix
		if(!this.cs || !this.pe){
			var node = this.domNode;
			this.cs = dojo.getComputedStyle(node);
			this.pe = dojo._getPadExtents(node, this.cs);
			this.pe.r = dojo._toPixelValue(node, this.cs.paddingRight);
			this.pe.b = dojo._toPixelValue(node, this.cs.paddingBottom);

			dojo.style(node, "padding", "0px");
		}

		this.inherited(arguments);
	},

	_layoutChildren: function(/*String?*/changedRegion, /*Number?*/ changedRegionSize){
		// summary:
		//		This is the main routine for setting size/position of each child.
		// description:
		//		With no arguments, measures the height of top/bottom panes, the width
		//		of left/right panes, and then sizes all panes accordingly.
		//
		//		With changedRegion specified (as "left", "top", "bottom", or "right"),
		//		it changes that region's width/height to changedRegionSize and
		//		then resizes other regions that were affected.
		// changedRegion:
		//		The region should be changed because splitter was dragged.
		//		"left", "right", "top", or "bottom".
		// changedRegionSize:
		//		The new width/height (in pixels) to make changedRegion

		if(!this._borderBox || !this._borderBox.h){
			// We are currently hidden, or we haven't been sized by our parent yet.
			// Abort.   Someone will resize us later.
			return;
		}

		var sidebarLayout = (this.design == "sidebar");
		var topHeight = 0, bottomHeight = 0, leftWidth = 0, rightWidth = 0;
		var topStyle = {}, leftStyle = {}, rightStyle = {}, bottomStyle = {},
			centerStyle = (this._center && this._center.style) || {};

		var changedSide = /left|right/.test(changedRegion);

		var layoutSides = !changedRegion || (!changedSide && !sidebarLayout);
		var layoutTopBottom = !changedRegion || (changedSide && sidebarLayout);

		// Ask browser for width/height of side panes.
		// Would be nice to cache this but height can change according to width
		// (because words wrap around).  I don't think width will ever change though
		// (except when the user drags a splitter).
		if(this._top){
			topStyle = (changedRegion == "top" || layoutTopBottom) && this._top.style;
			topHeight = changedRegion == "top" ? changedRegionSize : dojo.marginBox(this._top).h;
		}
		if(this._left){
			leftStyle = (changedRegion == "left" || layoutSides) && this._left.style;
			leftWidth = changedRegion == "left" ? changedRegionSize : dojo.marginBox(this._left).w;
		}
		if(this._right){
			rightStyle = (changedRegion == "right" || layoutSides) && this._right.style;
			rightWidth = changedRegion == "right" ? changedRegionSize : dojo.marginBox(this._right).w;
		}
		if(this._bottom){
			bottomStyle = (changedRegion == "bottom" || layoutTopBottom) && this._bottom.style;
			bottomHeight = changedRegion == "bottom" ? changedRegionSize : dojo.marginBox(this._bottom).h;
		}

		var splitters = this._splitters;
		var topSplitter = splitters.top, bottomSplitter = splitters.bottom,
			leftSplitter = splitters.left, rightSplitter = splitters.right;
		var splitterThickness = this._splitterThickness;
		var topSplitterThickness = splitterThickness.top || 0,
			leftSplitterThickness = splitterThickness.left || 0,
			rightSplitterThickness = splitterThickness.right || 0,
			bottomSplitterThickness = splitterThickness.bottom || 0;

		// Check for race condition where CSS hasn't finished loading, so
		// the splitter width == the viewport width (#5824)
		if(leftSplitterThickness > 50 || rightSplitterThickness > 50){
			setTimeout(dojo.hitch(this, function(){
				// Results are invalid.  Clear them out.
				this._splitterThickness = {};

				for(var region in this._splitters){
					this._computeSplitterThickness(region);
				}
				this._layoutChildren();
			}), 50);
			return false;
		}

		var pe = this.pe;

		var splitterBounds = {
			left: (sidebarLayout ? leftWidth + leftSplitterThickness: 0) + pe.l + "px",
			right: (sidebarLayout ? rightWidth + rightSplitterThickness: 0) + pe.r + "px"
		};

		if(topSplitter){
			dojo.mixin(topSplitter.style, splitterBounds);
			topSplitter.style.top = topHeight + pe.t + "px";
		}

		if(bottomSplitter){
			dojo.mixin(bottomSplitter.style, splitterBounds);
			bottomSplitter.style.bottom = bottomHeight + pe.b + "px";
		}

		splitterBounds = {
			top: (sidebarLayout ? 0 : topHeight + topSplitterThickness) + pe.t + "px",
			bottom: (sidebarLayout ? 0 : bottomHeight + bottomSplitterThickness) + pe.b + "px"
		};

		if(leftSplitter){
			dojo.mixin(leftSplitter.style, splitterBounds);
			leftSplitter.style.left = leftWidth + pe.l + "px";
		}

		if(rightSplitter){
			dojo.mixin(rightSplitter.style, splitterBounds);
			rightSplitter.style.right = rightWidth + pe.r +	"px";
		}

		dojo.mixin(centerStyle, {
			top: pe.t + topHeight + topSplitterThickness + "px",
			left: pe.l + leftWidth + leftSplitterThickness + "px",
			right: pe.r + rightWidth + rightSplitterThickness + "px",
			bottom: pe.b + bottomHeight + bottomSplitterThickness + "px"
		});

		var bounds = {
			top: sidebarLayout ? pe.t + "px" : centerStyle.top,
			bottom: sidebarLayout ? pe.b + "px" : centerStyle.bottom
		};
		dojo.mixin(leftStyle, bounds);
		dojo.mixin(rightStyle, bounds);
		leftStyle.left = pe.l + "px"; rightStyle.right = pe.r + "px"; topStyle.top = pe.t + "px"; bottomStyle.bottom = pe.b + "px";
		if(sidebarLayout){
			topStyle.left = bottomStyle.left = leftWidth + leftSplitterThickness + pe.l + "px";
			topStyle.right = bottomStyle.right = rightWidth + rightSplitterThickness + pe.r + "px";
		}else{
			topStyle.left = bottomStyle.left = pe.l + "px";
			topStyle.right = bottomStyle.right = pe.r + "px";
		}

		// More calculations about sizes of panes
		var containerHeight = this._borderBox.h - pe.t - pe.b,
			middleHeight = containerHeight - ( topHeight + topSplitterThickness + bottomHeight + bottomSplitterThickness),
			sidebarHeight = sidebarLayout ? containerHeight : middleHeight;

		var containerWidth = this._borderBox.w - pe.l - pe.r,
			middleWidth = containerWidth - (leftWidth + leftSplitterThickness + rightWidth + rightSplitterThickness),
			sidebarWidth = sidebarLayout ? middleWidth : containerWidth;

		// New margin-box size of each pane
		var dim = {
			top:	{ w: sidebarWidth, h: topHeight },
			bottom: { w: sidebarWidth, h: bottomHeight },
			left:	{ w: leftWidth, h: sidebarHeight },
			right:	{ w: rightWidth, h: sidebarHeight },
			center:	{ h: middleHeight, w: middleWidth }
		};

		if(changedRegion){
			// Respond to splitter drag event by changing changedRegion's width or height
			var child = this["_" + changedRegion + "Widget"],
				mb = {};
				mb[ /top|bottom/.test(changedRegion) ? "h" : "w"] = changedRegionSize;
			child.resize ? child.resize(mb, dim[child.region]) : dojo.marginBox(child.domNode, mb);
		}

		// Nodes in IE<8 don't respond to t/l/b/r, and TEXTAREA doesn't respond in any browser
		var janky = dojo.isIE < 8 || (dojo.isIE && dojo.isQuirks) || dojo.some(this.getChildren(), function(child){
			return child.domNode.tagName == "TEXTAREA" || child.domNode.tagName == "INPUT";
		});
		if(janky){
			// Set the size of the children the old fashioned way, by setting
			// CSS width and height

			var resizeWidget = function(widget, changes, result){
				if(widget){
					(widget.resize ? widget.resize(changes, result) : dojo.marginBox(widget.domNode, changes));
				}
			};

			if(leftSplitter){ leftSplitter.style.height = sidebarHeight; }
			if(rightSplitter){ rightSplitter.style.height = sidebarHeight; }
			resizeWidget(this._leftWidget, {h: sidebarHeight}, dim.left);
			resizeWidget(this._rightWidget, {h: sidebarHeight}, dim.right);

			if(topSplitter){ topSplitter.style.width = sidebarWidth; }
			if(bottomSplitter){ bottomSplitter.style.width = sidebarWidth; }
			resizeWidget(this._topWidget, {w: sidebarWidth}, dim.top);
			resizeWidget(this._bottomWidget, {w: sidebarWidth}, dim.bottom);

			resizeWidget(this._centerWidget, dim.center);
		}else{
			// Calculate which panes need a notification that their size has been changed
			// (we've already set style.top/bottom/left/right on those other panes).
			var notifySides = !changedRegion || (/top|bottom/.test(changedRegion) && this.design != "sidebar"),
				notifyTopBottom = !changedRegion || (/left|right/.test(changedRegion) && this.design == "sidebar"),
				notifyList = {
					center: true,
					left: notifySides,
					right: notifySides,
					top: notifyTopBottom,
					bottom: notifyTopBottom
				};
			
			// Send notification to those panes that have changed size
			dojo.forEach(this.getChildren(), function(child){
				if(child.resize && notifyList[child.region]){
					child.resize(null, dim[child.region]);
				}
			}, this);
		}
	},

	destroy: function(){
		for(var region in this._splitters){
			var splitter = this._splitters[region];
			dijit.byNode(splitter).destroy();
			dojo.destroy(splitter);
		}
		delete this._splitters;
		delete this._splitterThickness;
		this.inherited(arguments);
	}
});

// This argument can be specified for the children of a BorderContainer.
// Since any widget can be specified as a LayoutContainer child, mix it
// into the base widget class.  (This is a hack, but it's effective.)
dojo.extend(dijit._Widget, {
	// region: [const] String
	//		Parameter for children of `dijit.layout.BorderContainer`.
	//		Values: "top", "bottom", "leading", "trailing", "left", "right", "center".
	//		See the `dijit.layout.BorderContainer` description for details.
	region: '',

	// splitter: [const] Boolean
	//		Parameter for child of `dijit.layout.BorderContainer` where region != "center".
	//		If true, enables user to resize the widget by putting a draggable splitter between
	//		this widget and the region=center widget.
	splitter: false,

	// minSize: [const] Number
	//		Parameter for children of `dijit.layout.BorderContainer`.
	//		Specifies a minimum size (in pixels) for this widget when resized by a splitter.
	minSize: 0,

	// maxSize: [const] Number
	//		Parameter for children of `dijit.layout.BorderContainer`.
	//		Specifies a maximum size (in pixels) for this widget when resized by a splitter.
	maxSize: Infinity
});

dojo.require("dijit._Templated");

dojo.declare("dijit.layout._Splitter", [ dijit._Widget, dijit._Templated ],
{
	// summary:
	//		A draggable spacer between two items in a `dijit.layout.BorderContainer`.
	// description:
	//		This is instantiated by `dijit.layout.BorderContainer`.  Users should not
	//		create it directly.
	// tags:
	//		private

/*=====
 	// container: [const] dijit.layout.BorderContainer
 	//		Pointer to the parent BorderContainer
	container: null,

	// child: [const] dijit.layout._LayoutWidget
	//		Pointer to the pane associated with this splitter
	child: null,

	// region: String
	//		Region of pane associated with this splitter.
	//		"top", "bottom", "left", "right".
	region: null,
=====*/

	// live: [const] Boolean
	//		If true, the child's size changes and the child widget is redrawn as you drag the splitter;
	//		otherwise, the size doesn't change until you drop the splitter (by mouse-up)
	live: true,

	templateString: '<div class="dijitSplitter" dojoAttachEvent="onkeypress:_onKeyPress,onmousedown:_startDrag,onmouseenter:_onMouse,onmouseleave:_onMouse" tabIndex="0" waiRole="separator"><div class="dijitSplitterThumb"></div></div>',

	postCreate: function(){
		this.inherited(arguments);
		this.horizontal = /top|bottom/.test(this.region);
		dojo.addClass(this.domNode, "dijitSplitter" + (this.horizontal ? "H" : "V"));
//		dojo.addClass(this.child.domNode, "dijitSplitterPane");
//		dojo.setSelectable(this.domNode, false); //TODO is this necessary?

		this._factor = /top|left/.test(this.region) ? 1 : -1;

		this._cookieName = this.container.id + "_" + this.region;
		if(this.container.persist){
			// restore old size
			var persistSize = dojo.cookie(this._cookieName);
			if(persistSize){
				this.child.domNode.style[this.horizontal ? "height" : "width"] = persistSize;
			}
		}
	},

	_computeMaxSize: function(){
		// summary:
		//		Compute the maximum size that my corresponding pane can be set to

		var dim = this.horizontal ? 'h' : 'w',
			thickness = this.container._splitterThickness[this.region];
			
		// Get DOMNode of opposite pane, if an opposite pane exists.
		// Ex: if I am the _Splitter for the left pane, then get the right pane.
		var flip = {left:'right', right:'left', top:'bottom', bottom:'top', leading:'trailing', trailing:'leading'},
			oppNode = this.container["_" + flip[this.region]];
		
		// I can expand up to the edge of the opposite pane, or if there's no opposite pane, then to
		// edge of BorderContainer
		var available = dojo.contentBox(this.container.domNode)[dim] -
				(oppNode ? dojo.marginBox(oppNode)[dim] : 0) -
				20 - thickness * 2;

		return Math.min(this.child.maxSize, available);
	},

	_startDrag: function(e){
		if(!this.cover){
			this.cover = dojo.doc.createElement('div');
			dojo.addClass(this.cover, "dijitSplitterCover");
			dojo.place(this.cover, this.child.domNode, "after");
		}
		dojo.addClass(this.cover, "dijitSplitterCoverActive");

		// Safeguard in case the stop event was missed.  Shouldn't be necessary if we always get the mouse up.
		if(this.fake){ dojo.destroy(this.fake); }
		if(!(this._resize = this.live)){ //TODO: disable live for IE6?
			// create fake splitter to display at old position while we drag
			(this.fake = this.domNode.cloneNode(true)).removeAttribute("id");
			dojo.addClass(this.domNode, "dijitSplitterShadow");
			dojo.place(this.fake, this.domNode, "after");
		}
		dojo.addClass(this.domNode, "dijitSplitterActive");
		dojo.addClass(this.domNode, "dijitSplitter" + (this.horizontal ? "H" : "V") + "Active");
		if(this.fake){
			dojo.removeClass(this.fake, "dijitSplitterHover");
			dojo.removeClass(this.fake, "dijitSplitter" + (this.horizontal ? "H" : "V") + "Hover");
		}

		//Performance: load data info local vars for onmousevent function closure
		var factor = this._factor,
			max = this._computeMaxSize(),
			min = this.child.minSize || 20,
			isHorizontal = this.horizontal,
			axis = isHorizontal ? "pageY" : "pageX",
			pageStart = e[axis],
			splitterStyle = this.domNode.style,
			dim = isHorizontal ? 'h' : 'w',
			childStart = dojo.marginBox(this.child.domNode)[dim],
			region = this.region,
			splitterStart = parseInt(this.domNode.style[region], 10),
			resize = this._resize,
			childNode = this.child.domNode,
			layoutFunc = dojo.hitch(this.container, this.container._layoutChildren),
			de = dojo.doc;

		this._handlers = (this._handlers || []).concat([
			dojo.connect(de, "onmousemove", this._drag = function(e, forceResize){
				var delta = e[axis] - pageStart,
					childSize = factor * delta + childStart,
					boundChildSize = Math.max(Math.min(childSize, max), min);

				if(resize || forceResize){
					layoutFunc(region, boundChildSize);
				}
				splitterStyle[region] = factor * delta + splitterStart + (boundChildSize - childSize) + "px";
			}),
			dojo.connect(de, "ondragstart", dojo.stopEvent),
			dojo.connect(dojo.body(), "onselectstart", dojo.stopEvent),
			dojo.connect(de, "onmouseup", this, "_stopDrag")
		]);
		dojo.stopEvent(e);
	},

	_onMouse: function(e){
		var o = (e.type == "mouseover" || e.type == "mouseenter");
		dojo.toggleClass(this.domNode, "dijitSplitterHover", o);
		dojo.toggleClass(this.domNode, "dijitSplitter" + (this.horizontal ? "H" : "V") + "Hover", o);
	},

	_stopDrag: function(e){
		try{
			if(this.cover){
				dojo.removeClass(this.cover, "dijitSplitterCoverActive");
			}
			if(this.fake){ dojo.destroy(this.fake); }
			dojo.removeClass(this.domNode, "dijitSplitterActive");
			dojo.removeClass(this.domNode, "dijitSplitter" + (this.horizontal ? "H" : "V") + "Active");
			dojo.removeClass(this.domNode, "dijitSplitterShadow");
			this._drag(e); //TODO: redundant with onmousemove?
			this._drag(e, true);
		}finally{
			this._cleanupHandlers();
			delete this._drag;
		}

		if(this.container.persist){
			dojo.cookie(this._cookieName, this.child.domNode.style[this.horizontal ? "height" : "width"], {expires:365});
		}
	},

	_cleanupHandlers: function(){
		dojo.forEach(this._handlers, dojo.disconnect);
		delete this._handlers;
	},

	_onKeyPress: function(/*Event*/ e){
		// should we apply typematic to this?
		this._resize = true;
		var horizontal = this.horizontal;
		var tick = 1;
		var dk = dojo.keys;
		switch(e.charOrCode){
			case horizontal ? dk.UP_ARROW : dk.LEFT_ARROW:
				tick *= -1;
//				break;
			case horizontal ? dk.DOWN_ARROW : dk.RIGHT_ARROW:
				break;
			default:
//				this.inherited(arguments);
				return;
		}
		var childSize = dojo.marginBox(this.child.domNode)[ horizontal ? 'h' : 'w' ] + this._factor * tick;
		this.container._layoutChildren(this.region, Math.max(Math.min(childSize, this._computeMaxSize()), this.child.minSize));
		dojo.stopEvent(e);
	},

	destroy: function(){
		this._cleanupHandlers();
		delete this.child;
		delete this.container;
		delete this.cover;
		delete this.fake;
		this.inherited(arguments);
	}
});

dojo.declare("dijit.layout._Gutter", [dijit._Widget, dijit._Templated ],
{
	// summary:
	// 		Just a spacer div to separate side pane from center pane.
	//		Basically a trick to lookup the gutter/splitter width from the theme.
	// description:
	//		Instantiated by `dijit.layout.BorderContainer`.  Users should not
	//		create directly.
	// tags:
	//		private

	templateString: '<div class="dijitGutter" waiRole="presentation"></div>',

	postCreate: function(){
		this.horizontal = /top|bottom/.test(this.region);
		dojo.addClass(this.domNode, "dijitGutter" + (this.horizontal ? "H" : "V"));
	}
});
