dojo.provide("dijit.Dialog");

dojo.require("dojo.dnd.move");
dojo.require("dojo.dnd.TimedMoveable");
dojo.require("dojo.fx");
dojo.require("dojo.window");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit._CssStateMixin");
dojo.require("dijit.form._FormMixin");
dojo.require("dijit._DialogMixin");
dojo.require("dijit.DialogUnderlay");
dojo.require("dijit.layout.ContentPane");
dojo.requireLocalization("dijit", "common");

/*=====
dijit._underlay = function(kwArgs){
	// summary:
	//		A shared instance of a `dijit.DialogUnderlay`
	//
	// description:
	//		A shared instance of a `dijit.DialogUnderlay` created and
	//		used by `dijit.Dialog`, though never created until some Dialog
	//		or subclass thereof is shown.
};
=====*/

dojo.declare(
	"dijit._DialogBase",
	[dijit._Templated, dijit.form._FormMixin, dijit._DialogMixin, dijit._CssStateMixin],
	{
		// summary:
		//		A modal dialog Widget
		//
		// description:
		//		Pops up a modal dialog window, blocking access to the screen
		//		and also graying out the screen Dialog is extended from
		//		ContentPane so it supports all the same parameters (href, etc.)
		//
		// example:
		// |	<div dojoType="dijit.Dialog" href="test.html"></div>
		//
		// example:
		// |	var foo = new dijit.Dialog({ title: "test dialog", content: "test content" };
		// |	dojo.body().appendChild(foo.domNode);
		// |	foo.startup();

		templateString: dojo.cache("dijit", "templates/Dialog.html"),
		
		baseClass: "dijitDialog",
		
		cssStateNodes: {
			closeButtonNode: "dijitDialogCloseIcon"
		},

		attributeMap: dojo.delegate(dijit._Widget.prototype.attributeMap, {
			title: [
				{ node: "titleNode", type: "innerHTML" },
				{ node: "titleBar", type: "attribute" }
			],
			"aria-describedby":""
		}),

		// open: Boolean
		//		True if Dialog is currently displayed on screen.
		open: false,

		// duration: Integer
		//		The time in milliseconds it takes the dialog to fade in and out
		duration: dijit.defaultDuration,

		// refocus: Boolean
		// 		A Toggle to modify the default focus behavior of a Dialog, which
		// 		is to re-focus the element which had focus before being opened.
		//		False will disable refocusing. Default: true
		refocus: true,

		// autofocus: Boolean
		// 		A Toggle to modify the default focus behavior of a Dialog, which
		// 		is to focus on the first dialog element after opening the dialog.
		//		False will disable autofocusing. Default: true
		autofocus: true,

		// _firstFocusItem: [private] [readonly] DomNode
		//		The pointer to the first focusable node in the dialog.
		//		Set by `dijit._DialogMixin._getFocusItems`.
		_firstFocusItem: null,

		// _lastFocusItem: [private] [readonly] DomNode
		//		The pointer to which node has focus prior to our dialog.
		//		Set by `dijit._DialogMixin._getFocusItems`.
		_lastFocusItem: null,

		// doLayout: [protected] Boolean
		//		Don't change this parameter from the default value.
		//		This ContentPane parameter doesn't make sense for Dialog, since Dialog
		//		is never a child of a layout container, nor can you specify the size of
		//		Dialog in order to control the size of an inner widget.
		doLayout: false,

		// draggable: Boolean
		//		Toggles the moveable aspect of the Dialog. If true, Dialog
		//		can be dragged by it's title. If false it will remain centered
		//		in the viewport.
		draggable: true,

		//aria-describedby: String
		//		Allows the user to add an aria-describedby attribute onto the dialog.   The value should
		//		be the id of the container element of text that describes the dialog purpose (usually
		//		the first text in the dialog).
		//		<div dojoType="dijit.Dialog" aria-describedby="intro" .....>
		//			<div id="intro">Introductory text</div>
		//			<div>rest of dialog contents</div>
		//		</div>
		"aria-describedby":"",

		postMixInProperties: function(){
			var _nlsResources = dojo.i18n.getLocalization("dijit", "common");
			dojo.mixin(this, _nlsResources);
			this.inherited(arguments);
		},

		postCreate: function(){
			dojo.style(this.domNode, {
				display: "none",
				position:"absolute"
			});
			dojo.body().appendChild(this.domNode);

			this.inherited(arguments);

			this.connect(this, "onExecute", "hide");
			this.connect(this, "onCancel", "hide");
			this._modalconnects = [];
		},

		onLoad: function(){
			// summary:
			//		Called when data has been loaded from an href.
			//		Unlike most other callbacks, this function can be connected to (via `dojo.connect`)
			//		but should *not* be overriden.
			// tags:
			//		callback

			// when href is specified we need to reposition the dialog after the data is loaded
			// and find the focusable elements
			this._position();
			if(this.autofocus){
				this._getFocusItems(this.domNode);
				dijit.focus(this._firstFocusItem);
			}
			this.inherited(arguments);
		},

		_endDrag: function(e){
			// summary:
			//		Called after dragging the Dialog. Saves the position of the dialog in the viewport.
			// tags:
			//		private
			if(e && e.node && e.node === this.domNode){
				this._relativePosition = dojo.position(e.node);
			}
		},

		_setup: function(){
			// summary:
			//		Stuff we need to do before showing the Dialog for the first
			//		time (but we defer it until right beforehand, for
			//		performance reasons).
			// tags:
			//		private

			var node = this.domNode;

			if(this.titleBar && this.draggable){
				this._moveable = (dojo.isIE == 6) ?
					new dojo.dnd.TimedMoveable(node, { handle: this.titleBar }) :	// prevent overload, see #5285
					new dojo.dnd.Moveable(node, { handle: this.titleBar, timeout: 0 });
				dojo.subscribe("/dnd/move/stop",this,"_endDrag");
			}else{
				dojo.addClass(node,"dijitDialogFixed");
			}

			this.underlayAttrs = {
				dialogId: this.id,
				"class": dojo.map(this["class"].split(/\s/), function(s){ return s+"_underlay"; }).join(" ")
			};

			this._fadeIn = dojo.fadeIn({
				node: node,
				duration: this.duration,
				beforeBegin: dojo.hitch(this, function(){
					var underlay = dijit._underlay;
					if(!underlay){
						underlay = dijit._underlay = new dijit.DialogUnderlay(this.underlayAttrs);
					}else{
						underlay.set(this.underlayAttrs);
					}

					var ds = dijit._dialogStack,
						zIndex = 948 + ds.length*2;
					if(ds.length == 1){	// first dialog
						underlay.show();
					}
					dojo.style(dijit._underlay.domNode, 'zIndex', zIndex);
					dojo.style(this.domNode, 'zIndex', zIndex + 1);
				}),
				onEnd: dojo.hitch(this, function(){
					if(this.autofocus){
						// find focusable Items each time dialog is shown since if dialog contains a widget the
						// first focusable items can change
						this._getFocusItems(this.domNode);
						dijit.focus(this._firstFocusItem);
					}
				})
			 });

			this._fadeOut = dojo.fadeOut({
				node: node,
				duration: this.duration,
				onEnd: dojo.hitch(this, function(){
					node.style.display = "none";

					// Restore the previous dialog in the stack, or if this is the only dialog
					// then restore to original page
					var ds = dijit._dialogStack;
					if(ds.length == 0){
						dijit._underlay.hide();
					}else{
						dojo.style(dijit._underlay.domNode, 'zIndex', 948 + ds.length*2);
						dijit._underlay.set(ds[ds.length-1].underlayAttrs);
					}

					// Restore focus to wherever it was before this dialog was displayed
					if(this.refocus){
						var focus = this._savedFocus;

						// If we are returning control to a previous dialog but for some reason
						// that dialog didn't have a focused field, set focus to first focusable item.
						// This situation could happen if two dialogs appeared at nearly the same time,
						// since a dialog doesn't set it's focus until the fade-in is finished.
						if(ds.length > 0){
							var pd = ds[ds.length-1];
							if(!dojo.isDescendant(focus.node, pd.domNode)){
								pd._getFocusItems(pd.domNode);
								focus = pd._firstFocusItem;
							}
						}

						dijit.focus(focus);
					}
				})
			 });
		},

		uninitialize: function(){
			var wasPlaying = false;
			if(this._fadeIn && this._fadeIn.status() == "playing"){
				wasPlaying = true;
				this._fadeIn.stop();
			}
			if(this._fadeOut && this._fadeOut.status() == "playing"){
				wasPlaying = true;
				this._fadeOut.stop();
			}
			
			// Hide the underlay, unless the underlay widget has already been destroyed
			// because we are being called during page unload (when all widgets are destroyed)
			if((this.open || wasPlaying) && !dijit._underlay._destroyed){
				dijit._underlay.hide();
			}

			if(this._moveable){
				this._moveable.destroy();
			}
			this.inherited(arguments);
		},

		_size: function(){
			// summary:
			// 		If necessary, shrink dialog contents so dialog fits in viewport
			// tags:
			//		private

			this._checkIfSingleChild();

			// If we resized the dialog contents earlier, reset them back to original size, so
			// that if the user later increases the viewport size, the dialog can display w/out a scrollbar.
			// Need to do this before the dojo.marginBox(this.domNode) call below.
			if(this._singleChild){
				if(this._singleChildOriginalStyle){
					this._singleChild.domNode.style.cssText = this._singleChildOriginalStyle;
				}
				delete this._singleChildOriginalStyle;
			}else{
				dojo.style(this.containerNode, {
					width:"auto",
					height:"auto"
				});
			}

			var mb = dojo.marginBox(this.domNode);
			var viewport = dojo.window.getBox();
			if(mb.w >= viewport.w || mb.h >= viewport.h){
				// Reduce size of dialog contents so that dialog fits in viewport

				var w = Math.min(mb.w, Math.floor(viewport.w * 0.75)),
					h = Math.min(mb.h, Math.floor(viewport.h * 0.75));

				if(this._singleChild && this._singleChild.resize){
					this._singleChildOriginalStyle = this._singleChild.domNode.style.cssText;
					this._singleChild.resize({w: w, h: h});
				}else{
					dojo.style(this.containerNode, {
						width: w + "px",
						height: h + "px",
						overflow: "auto",
						position: "relative"	// workaround IE bug moving scrollbar or dragging dialog
					});
				}
			}else{
				if(this._singleChild && this._singleChild.resize){
					this._singleChild.resize();
				}
			}
		},

		_position: function(){
			// summary:
			//		Position modal dialog in the viewport. If no relative offset
			//		in the viewport has been determined (by dragging, for instance),
			//		center the node. Otherwise, use the Dialog's stored relative offset,
			//		and position the node to top: left: values based on the viewport.
			// tags:
			//		private
			if(!dojo.hasClass(dojo.body(),"dojoMove")){
				var node = this.domNode,
					viewport = dojo.window.getBox(),
					p = this._relativePosition,
					bb = p ? null : dojo._getBorderBox(node),
					l = Math.floor(viewport.l + (p ? p.x : (viewport.w - bb.w) / 2)),
					t = Math.floor(viewport.t + (p ? p.y : (viewport.h - bb.h) / 2))
				;
				dojo.style(node,{
					left: l + "px",
					top: t + "px"
				});
			}
		},

		_onKey: function(/*Event*/ evt){
			// summary:
			//		Handles the keyboard events for accessibility reasons
			// tags:
			//		private

			var ds = dijit._dialogStack;
			if(ds[ds.length-1] != this){
				// console.debug(this.id + ': skipping because', this, 'is not the active dialog');
				return;
			}

			if(evt.charOrCode){
				var dk = dojo.keys;
				var node = evt.target;
				if(evt.charOrCode === dk.TAB){
					this._getFocusItems(this.domNode);
				}
				var singleFocusItem = (this._firstFocusItem == this._lastFocusItem);
				// see if we are shift-tabbing from first focusable item on dialog
				if(node == this._firstFocusItem && evt.shiftKey && evt.charOrCode === dk.TAB){
					if(!singleFocusItem){
						dijit.focus(this._lastFocusItem); // send focus to last item in dialog
					}
					dojo.stopEvent(evt);
				}else if(node == this._lastFocusItem && evt.charOrCode === dk.TAB && !evt.shiftKey){
					if(!singleFocusItem){
						dijit.focus(this._firstFocusItem); // send focus to first item in dialog
					}
					dojo.stopEvent(evt);
				}else{
					// see if the key is for the dialog
					while(node){
						if(node == this.domNode || dojo.hasClass(node, "dijitPopup")){
							if(evt.charOrCode == dk.ESCAPE){
								this.onCancel();
							}else{
								return; // just let it go
							}
						}
						node = node.parentNode;
					}
					// this key is for the disabled document window
					if(evt.charOrCode !== dk.TAB){ // allow tabbing into the dialog for a11y
						dojo.stopEvent(evt);
					// opera won't tab to a div
					}else if(!dojo.isOpera){
						try{
							this._firstFocusItem.focus();
						}catch(e){ /*squelch*/ }
					}
				}
			}
		},

		show: function(){
			// summary:
			//		Display the dialog
			if(this.open){ return; }

			// first time we show the dialog, there's some initialization stuff to do
			if(!this._alreadyInitialized){
				this._setup();
				this._alreadyInitialized=true;
			}

			if(this._fadeOut.status() == "playing"){
				this._fadeOut.stop();
			}

			this._modalconnects.push(dojo.connect(window, "onscroll", this, "layout"));
			this._modalconnects.push(dojo.connect(window, "onresize", this, function(){
				// IE gives spurious resize events and can actually get stuck
				// in an infinite loop if we don't ignore them
				var viewport = dojo.window.getBox();
				if(!this._oldViewport ||
						viewport.h != this._oldViewport.h ||
						viewport.w != this._oldViewport.w){
					this.layout();
					this._oldViewport = viewport;
				}
			}));
			this._modalconnects.push(dojo.connect(dojo.doc.documentElement, "onkeypress", this, "_onKey"));

			dojo.style(this.domNode, {
				opacity:0,
				display:""
			});

			this.open = true;
			this._onShow(); // lazy load trigger

			this._size();
			this._position();
			dijit._dialogStack.push(this);
			this._fadeIn.play();

			this._savedFocus = dijit.getFocus(this);
		},

		hide: function(){
			// summary:
			//		Hide the dialog

			// if we haven't been initialized yet then we aren't showing and we can just return
			// or if we aren't the active dialog, don't allow us to close yet
			var ds = dijit._dialogStack;
			if(!this._alreadyInitialized || this != ds[ds.length-1]){
				return;
			}

			if(this._fadeIn.status() == "playing"){
				this._fadeIn.stop();
			}

			// throw away current active dialog from stack -- making the previous dialog or the node on the original page active
			ds.pop();

			this._fadeOut.play();

			if(this._scrollConnected){
				this._scrollConnected = false;
			}
			dojo.forEach(this._modalconnects, dojo.disconnect);
			this._modalconnects = [];

			if(this._relativePosition){
				delete this._relativePosition;
			}
			this.open = false;

			this.onHide();
		},

		layout: function(){
			// summary:
			//		Position the Dialog and the underlay
			// tags:
			//		private
			if(this.domNode.style.display != "none"){
				if(dijit._underlay){	// avoid race condition during show()
					dijit._underlay.layout();
				}
				this._position();
			}
		},

		destroy: function(){
			dojo.forEach(this._modalconnects, dojo.disconnect);
			if(this.refocus && this.open){
				setTimeout(dojo.hitch(dijit,"focus",this._savedFocus), 25);
			}
			this.inherited(arguments);
		}
	}
);

dojo.declare(
	"dijit.Dialog",
	[dijit.layout.ContentPane, dijit._DialogBase],
	{}
);

// Stack of currenctly displayed dialogs, layered on top of each other
dijit._dialogStack = [];

// For back-compat.  TODO: remove in 2.0
dojo.require("dijit.TooltipDialog");
