dojo.provide("dijit.layout.AccordionContainer");

dojo.require("dojo.fx");

dojo.require("dijit._Container");
dojo.require("dijit._Templated");
dojo.require("dijit._CssStateMixin");
dojo.require("dijit.layout.StackContainer");
dojo.require("dijit.layout.ContentPane");

dojo.require("dijit.layout.AccordionPane");	// for back compat, remove for 2.0

dojo.declare(
	"dijit.layout.AccordionContainer",
	dijit.layout.StackContainer,
	{
		// summary:
		//		Holds a set of panes where every pane's title is visible, but only one pane's content is visible at a time,
		//		and switching between panes is visualized by sliding the other panes up/down.
		// example:
		//	| 	<div dojoType="dijit.layout.AccordionContainer">
		//	|		<div dojoType="dijit.layout.ContentPane" title="pane 1">
		//	|		</div>
		//	|		<div dojoType="dijit.layout.ContentPane" title="pane 2">
		//	|			<p>This is some text</p>
		//	|		</div>
		//	|	</div>

		// duration: Integer
		//		Amount of time (in ms) it takes to slide panes
		duration: dijit.defaultDuration,

		// buttonWidget: [const] String
		//		The name of the widget used to display the title of each pane
		buttonWidget: "dijit.layout._AccordionButton",

		// _verticalSpace: Number
		//		Pixels of space available for the open pane
		//		(my content box size minus the cumulative size of all the title bars)
		_verticalSpace: 0,

		baseClass: "dijitAccordionContainer",

		postCreate: function(){
			this.domNode.style.overflow = "hidden";
			this.inherited(arguments);
			dijit.setWaiRole(this.domNode, "tablist");
		},

		startup: function(){
			if(this._started){ return; }
			this.inherited(arguments);
			if(this.selectedChildWidget){
				var style = this.selectedChildWidget.containerNode.style;
				style.display = "";
				style.overflow = "auto";
				this.selectedChildWidget._wrapperWidget.set("selected", true);
			}
		},

		_getTargetHeight: function(/* Node */ node){
			// summary:
			//		For the given node, returns the height that should be
			//		set to achieve our vertical space (subtract any padding
			//		we may have).
			//
			//		This is used by the animations.
			//
			//		TODO: I don't think this works correctly in IE quirks when an elements
			//		style.height including padding and borders
			var cs = dojo.getComputedStyle(node);
			return Math.max(this._verticalSpace - dojo._getPadBorderExtents(node, cs).h - dojo._getMarginExtents(node, cs).h, 0);
		},

		layout: function(){
			// Implement _LayoutWidget.layout() virtual method.
			// Set the height of the open pane based on what room remains.

			var openPane = this.selectedChildWidget;
			
			if(!openPane){ return;}

			var openPaneContainer = openPane._wrapperWidget.domNode,
				openPaneContainerMargin = dojo._getMarginExtents(openPaneContainer),
				openPaneContainerPadBorder = dojo._getPadBorderExtents(openPaneContainer),
				mySize = this._contentBox;

			// get cumulative height of all the unselected title bars
			var totalCollapsedHeight = 0;
			dojo.forEach(this.getChildren(), function(child){
	            if(child != openPane){
					totalCollapsedHeight += dojo.marginBox(child._wrapperWidget.domNode).h;
				}
			});
			this._verticalSpace = mySize.h - totalCollapsedHeight - openPaneContainerMargin.h 
			 	- openPaneContainerPadBorder.h - openPane._buttonWidget.getTitleHeight();

			// Memo size to make displayed child
			this._containerContentBox = {
				h: this._verticalSpace,
				w: this._contentBox.w - openPaneContainerMargin.w - openPaneContainerPadBorder.w
			};

			if(openPane){
				openPane.resize(this._containerContentBox);
			}
		},

		_setupChild: function(child){
			// Overrides _LayoutWidget._setupChild().
			// Put wrapper widget around the child widget, showing title

			child._wrapperWidget = new dijit.layout._AccordionInnerContainer({
				contentWidget: child,
				buttonWidget: this.buttonWidget,
				id: child.id + "_wrapper",
				dir: child.dir,
				lang: child.lang,
				parent: this
			});

			this.inherited(arguments);
		},

		addChild: function(/*dijit._Widget*/ child, /*Integer?*/ insertIndex){	
			if(this._started){
				// Adding a child to a started Accordion is complicated because children have
				// wrapper widgets.  Default code path (calling this.inherited()) would add
				// the new child inside another child's wrapper.

				// First add in child as a direct child of this AccordionContainer
				dojo.place(child.domNode, this.containerNode, insertIndex);

				if(!child._started){
					child.startup();
				}
				
				// Then stick the wrapper widget around the child widget
				this._setupChild(child);

				// Code below copied from StackContainer	
				dojo.publish(this.id+"-addChild", [child, insertIndex]);
				this.layout();
				if(!this.selectedChildWidget){
					this.selectChild(child);
				}
			}else{
				// We haven't been started yet so just add in the child widget directly,
				// and the wrapper will be created on startup()
				this.inherited(arguments);
			}
		},

		removeChild: function(child){
			// Overrides _LayoutWidget.removeChild().

			// destroy wrapper widget first, before StackContainer.getChildren() call
			child._wrapperWidget.destroy();
			delete child._wrapperWidget;
			dojo.removeClass(child.domNode, "dijitHidden");

			this.inherited(arguments);
		},

		getChildren: function(){
			// Overrides _Container.getChildren() to return content panes rather than internal AccordionInnerContainer panes
			return dojo.map(this.inherited(arguments), function(child){
				return child.declaredClass == "dijit.layout._AccordionInnerContainer" ? child.contentWidget : child;
			}, this);
		},

		destroy: function(){
			dojo.forEach(this.getChildren(), function(child){
				child._wrapperWidget.destroy();
			});
			this.inherited(arguments);
		},

		_transition: function(/*dijit._Widget?*/newWidget, /*dijit._Widget?*/oldWidget, /*Boolean*/ animate){
			// Overrides StackContainer._transition() to provide sliding of title bars etc.

//TODO: should be able to replace this with calls to slideIn/slideOut
			if(this._inTransition){ return; }
			var animations = [];
			var paneHeight = this._verticalSpace;
			if(newWidget){
				newWidget._wrapperWidget.set("selected", true);

				this._showChild(newWidget);	// prepare widget to be slid in

				// Size the new widget, in case this is the first time it's being shown,
				// or I have been resized since the last time it was shown.
				// Note that page must be visible for resizing to work.
				if(this.doLayout && newWidget.resize){
					newWidget.resize(this._containerContentBox);
				}

				var newContents = newWidget.domNode;
				dojo.addClass(newContents, "dijitVisible");
				dojo.removeClass(newContents, "dijitHidden");
				
				if(animate){
					var newContentsOverflow = newContents.style.overflow;
					newContents.style.overflow = "hidden";
					animations.push(dojo.animateProperty({
						node: newContents,
						duration: this.duration,
						properties: {
							height: { start: 1, end: this._getTargetHeight(newContents) }
						},
						onEnd: function(){
							newContents.style.overflow = newContentsOverflow;

							// Kick IE to workaround layout bug, see #11415
							if(dojo.isIE){
								setTimeout(function(){
									dojo.removeClass(newContents.parentNode, "dijitAccordionInnerContainerFocused");
									setTimeout(function(){
										dojo.addClass(newContents.parentNode, "dijitAccordionInnerContainerFocused");
									}, 0);
								}, 0);
							}
						}
					}));
				}
			}
			if(oldWidget){
				oldWidget._wrapperWidget.set("selected", false);
				var oldContents = oldWidget.domNode;
				if(animate){
					var oldContentsOverflow = oldContents.style.overflow;
					oldContents.style.overflow = "hidden";
					animations.push(dojo.animateProperty({
						node: oldContents,
						duration: this.duration,
						properties: {
							height: { start: this._getTargetHeight(oldContents), end: 1 }
						},
						onEnd: function(){
							dojo.addClass(oldContents, "dijitHidden");
							dojo.removeClass(oldContents, "dijitVisible");
							oldContents.style.overflow = oldContentsOverflow;
							if(oldWidget.onHide){
								oldWidget.onHide();
							}
						}
					}));
				}else{
					dojo.addClass(oldContents, "dijitHidden");
					dojo.removeClass(oldContents, "dijitVisible");
					if(oldWidget.onHide){
						oldWidget.onHide();
					}
				}
			}

			if(animate){
				this._inTransition = true;
				var combined = dojo.fx.combine(animations);
				combined.onEnd = dojo.hitch(this, function(){
					delete this._inTransition;
				});
				combined.play();
			}			
		},

		// note: we are treating the container as controller here
		_onKeyPress: function(/*Event*/ e, /*dijit._Widget*/ fromTitle){
			// summary:
			//		Handle keypress events
			// description:
			//		This is called from a handler on AccordionContainer.domNode
			//		(setup in StackContainer), and is also called directly from
			//		the click handler for accordion labels
			if(this._inTransition || this.disabled || e.altKey || !(fromTitle || e.ctrlKey)){
				if(this._inTransition){
					dojo.stopEvent(e);
				}
				return;
			}
			var k = dojo.keys,
				c = e.charOrCode;
			if((fromTitle && (c == k.LEFT_ARROW || c == k.UP_ARROW)) ||
					(e.ctrlKey && c == k.PAGE_UP)){
				this._adjacent(false)._buttonWidget._onTitleClick();
				dojo.stopEvent(e);
			}else if((fromTitle && (c == k.RIGHT_ARROW || c == k.DOWN_ARROW)) ||
					(e.ctrlKey && (c == k.PAGE_DOWN || c == k.TAB))){
				this._adjacent(true)._buttonWidget._onTitleClick();
				dojo.stopEvent(e);
			}
		}
	}
);

dojo.declare("dijit.layout._AccordionInnerContainer",
	[dijit._Widget, dijit._CssStateMixin], {
		// summary:
		//		Internal widget placed as direct child of AccordionContainer.containerNode.
		//		When other widgets are added as children to an AccordionContainer they are wrapped in
		//		this widget.
		
		// buttonWidget: String
		//		Name of class to use to instantiate title
		//		(Wish we didn't have a separate widget for just the title but maintaining it
		//		for backwards compatibility, is it worth it?)
/*=====
		 buttonWidget: null,
=====*/
		// contentWidget: dijit._Widget
		//		Pointer to the real child widget
/*=====
	 	contentWidget: null,
=====*/

		baseClass: "dijitAccordionInnerContainer",

		// tell nested layout widget that we will take care of sizing
		isContainer: true,
		isLayoutContainer: true,

		buildRendering: function(){			
			// Create wrapper div, placed where the child is now
			this.domNode = dojo.place("<div class='" + this.baseClass + "'>", this.contentWidget.domNode, "after");
			
			// wrapper div's first child is the button widget (ie, the title bar)
			var child = this.contentWidget,
				cls = dojo.getObject(this.buttonWidget);
			this.button = child._buttonWidget = (new cls({
				contentWidget: child,
				label: child.title,
				title: child.tooltip,
				dir: child.dir,
				lang: child.lang,
				iconClass: child.iconClass,
				id: child.id + "_button",
				parent: this.parent
			})).placeAt(this.domNode);
			
			// and then the actual content widget (changing it from prior-sibling to last-child)
			dojo.place(this.contentWidget.domNode, this.domNode);
		},

		postCreate: function(){
			this.inherited(arguments);
			this.connect(this.contentWidget, 'set', function(name, value){
				var mappedName = {title: "label", tooltip: "title", iconClass: "iconClass"}[name];
				if(mappedName){
					this.button.set(mappedName, value);
				}
			}, this);
		},

		_setSelectedAttr: function(/*Boolean*/ isSelected){
			this.selected = isSelected;
			this.button.set("selected", isSelected);
			if(isSelected){
				var cw = this.contentWidget;
				if(cw.onSelected){ cw.onSelected(); }
			}
		},

		startup: function(){
			// Called by _Container.addChild()
			this.contentWidget.startup();
		},

		destroy: function(){
			this.button.destroyRecursive();
			
			delete this.contentWidget._buttonWidget;
			delete this.contentWidget._wrapperWidget;

			this.inherited(arguments);
		},
		
		destroyDescendants: function(){
			// since getChildren isn't working for me, have to code this manually
			this.contentWidget.destroyRecursive();
		}
});

dojo.declare("dijit.layout._AccordionButton",
	[dijit._Widget, dijit._Templated, dijit._CssStateMixin],
	{
	// summary:
	//		The title bar to click to open up an accordion pane.
	//		Internal widget used by AccordionContainer.
	// tags:
	//		private

	templateString: dojo.cache("dijit.layout", "templates/AccordionButton.html"),
	attributeMap: dojo.mixin(dojo.clone(dijit.layout.ContentPane.prototype.attributeMap), {
		label: {node: "titleTextNode", type: "innerHTML" },
		title: {node: "titleTextNode", type: "attribute", attribute: "title"},
		iconClass: { node: "iconNode", type: "class" }
	}),

	baseClass: "dijitAccordionTitle",

	getParent: function(){
		// summary:
		//		Returns the AccordionContainer parent.
		// tags:
		//		private
		return this.parent;
	},

	postCreate: function(){
		this.inherited(arguments);
		dojo.setSelectable(this.domNode, false);
		var titleTextNodeId = dojo.attr(this.domNode,'id').replace(' ','_');
		dojo.attr(this.titleTextNode, "id", titleTextNodeId+"_title");
		dijit.setWaiState(this.focusNode, "labelledby", dojo.attr(this.titleTextNode, "id"));
	},

	getTitleHeight: function(){
		// summary:
		//		Returns the height of the title dom node.
		return dojo.marginBox(this.domNode).h;	// Integer
	},

	// TODO: maybe the parent should set these methods directly rather than forcing the code
	// into the button widget?
	_onTitleClick: function(){
		// summary:
		//		Callback when someone clicks my title.
		var parent = this.getParent();
		if(!parent._inTransition){
			parent.selectChild(this.contentWidget, true);
			dijit.focus(this.focusNode);
		}
	},

	_onTitleKeyPress: function(/*Event*/ evt){
		return this.getParent()._onKeyPress(evt, this.contentWidget);
	},

	_setSelectedAttr: function(/*Boolean*/ isSelected){
		this.selected = isSelected;
		dijit.setWaiState(this.focusNode, "expanded", isSelected);
		dijit.setWaiState(this.focusNode, "selected", isSelected);
		this.focusNode.setAttribute("tabIndex", isSelected ? "0" : "-1");
	}
});
