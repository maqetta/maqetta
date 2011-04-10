dojo.provide("dojox.layout.FloatingPane");
dojo.experimental("dojox.layout.FloatingPane"); 

dojo.require("dojo.window");

dojo.require("dijit._Templated"); 
dojo.require("dijit._Widget"); 
dojo.require("dojo.dnd.Moveable");

dojo.require("dojox.layout.ContentPane");
dojo.require("dojox.layout.ResizeHandle"); 

dojo.declare("dojox.layout.FloatingPane", 
	[ dojox.layout.ContentPane, dijit._Templated ],
	{
	// summary:
	//		A non-modal Floating window.
	//
	// description:
	// 		Makes a `dojox.layout.ContentPane` float and draggable by it's title [similar to TitlePane]
	// 		and over-rides onClick to onDblClick for wipeIn/Out of containerNode
	// 		provides minimize(dock) / show() and hide() methods, and resize [almost] 
	//
	// closable: Boolean
	//		Allow closure of this Node
	closable: true,

	// dockable: Boolean
	//		Allow minimizing of pane if true
	dockable: true,

	// resizable: Boolean
	//		Allow resizing of pane true if true
	resizable: false,

	// maxable: Boolean
	//		Horrible param name for "Can you maximize this floating pane?"
	maxable: false,

	// resizeAxis: String
	//		One of: x | xy | y to limit pane's sizing direction
	resizeAxis: "xy",

	// title: String
	//		Title to use in the header
	title: "",

	// dockTo: DomNode?
	//		if empty, will create private layout.Dock that scrolls with viewport
	//		on bottom span of viewport.	
	dockTo: "",

	// duration: Integer
	//		Time is MS to spend toggling in/out node
	duration: 400,

	/*=====
	// iconSrc: String
	//		[not implemented yet] will be either icon in titlepane to left
	//		of Title, and/or icon show when docked in a fisheye-like dock
	//		or maybe dockIcon would be better?
	iconSrc: null,
	=====*/

	// contentClass: String
	// 		The className to give to the inner node which has the content
	contentClass: "dojoxFloatingPaneContent",

	// animation holders for toggle
	_showAnim: null,
	_hideAnim: null, 
	// node in the dock (if docked)
	_dockNode: null,

	// privates:
	_restoreState: {},
	_allFPs: [],
	_startZ: 100,

	templateString: dojo.cache("dojox.layout","resources/FloatingPane.html"),
	
	attributeMap: dojo.delegate(dijit._Widget.prototype.attributeMap, {
		title: { type:"innerHTML", node:"titleNode" }
	}),
	
	postCreate: function(){
		this.inherited(arguments);
		new dojo.dnd.Moveable(this.domNode,{ handle: this.focusNode });
		//this._listener = dojo.subscribe("/dnd/move/start",this,"bringToTop"); 

		if(!this.dockable){ this.dockNode.style.display = "none"; } 
		if(!this.closable){ this.closeNode.style.display = "none"; } 
		if(!this.maxable){
			this.maxNode.style.display = "none";
			this.restoreNode.style.display = "none";
		}
		if(!this.resizable){
			this.resizeHandle.style.display = "none"; 	
		}else{
			this.domNode.style.width = dojo.marginBox(this.domNode).w + "px"; 
		}
		this._allFPs.push(this);
		this.domNode.style.position = "absolute";
		
		this.bgIframe = new dijit.BackgroundIframe(this.domNode);
		this._naturalState = dojo.coords(this.domNode);
	},
	
	startup: function(){
		if(this._started){ return; }
		
		this.inherited(arguments);

		if(this.resizable){
			if(dojo.isIE){
				this.canvas.style.overflow = "auto";
			}else{
				this.containerNode.style.overflow = "auto";
			}
			
			this._resizeHandle = new dojox.layout.ResizeHandle({ 
				targetId: this.id, 
				resizeAxis: this.resizeAxis 
			},this.resizeHandle);

		}

		if(this.dockable){ 
			// FIXME: argh.
			var tmpName = this.dockTo; 

			if(this.dockTo){
				this.dockTo = dijit.byId(this.dockTo); 
			}else{
				this.dockTo = dijit.byId('dojoxGlobalFloatingDock');
			}

			if(!this.dockTo){
				var tmpId, tmpNode;
				// we need to make our dock node, and position it against
				// .dojoxDockDefault .. this is a lot. either dockto="node"
				// and fail if node doesn't exist or make the global one
				// once, and use it on empty OR invalid dockTo="" node?
				if(tmpName){ 
					tmpId = tmpName;
					tmpNode = dojo.byId(tmpName); 
				}else{
					tmpNode = dojo.create('div', null, dojo.body());
					dojo.addClass(tmpNode,"dojoxFloatingDockDefault");
					tmpId = 'dojoxGlobalFloatingDock';
				}
				this.dockTo = new dojox.layout.Dock({ id: tmpId, autoPosition: "south" }, tmpNode);
				this.dockTo.startup(); 
			}
			
			if((this.domNode.style.display == "none")||(this.domNode.style.visibility == "hidden")){
				// If the FP is created dockable and non-visible, start up docked.
				this.minimize();
			} 
		} 		
		this.connect(this.focusNode,"onmousedown","bringToTop");
		this.connect(this.domNode,	"onmousedown","bringToTop");

		// Initial resize to give child the opportunity to lay itself out
		this.resize(dojo.coords(this.domNode));
		
		this._started = true;
	},

	setTitle: function(/* String */ title){
		// summary: Update the Title bar with a new string
		dojo.deprecated("pane.setTitle", "Use pane.attr('title', someTitle)", "2.0");
		this.set("title", title);
		// this.setTitle = dojo.hitch(this, "setTitle") ?? 
	},
		
	close: function(){
		// summary: Close and destroy this widget
		if(!this.closable){ return; }
		dojo.unsubscribe(this._listener);
		this.hide(dojo.hitch(this,function(){
			this.destroyRecursive();
		})); 
	},

	hide: function(/* Function? */ callback){
		// summary: Close, but do not destroy this FloatingPane
		dojo.fadeOut({
			node:this.domNode,
			duration:this.duration,
			onEnd: dojo.hitch(this,function() { 
				this.domNode.style.display = "none";
				this.domNode.style.visibility = "hidden"; 
				if(this.dockTo && this.dockable){
					this.dockTo._positionDock(null);
				}
				if(callback){
					callback();
				}
			})
		}).play();
	},

	show: function(/* Function? */callback){
		// summary: Show the FloatingPane
		var anim = dojo.fadeIn({node:this.domNode, duration:this.duration,
			beforeBegin: dojo.hitch(this,function(){
				this.domNode.style.display = ""; 
				this.domNode.style.visibility = "visible";
				if (this.dockTo && this.dockable) { this.dockTo._positionDock(null); }
				if (typeof callback == "function") { callback(); }
				this._isDocked = false;
				if (this._dockNode) { 
					this._dockNode.destroy();
					this._dockNode = null;
				}
			})
		}).play();
		this.resize(dojo.coords(this.domNode));
	},

	minimize: function(){
		// summary: Hide and dock the FloatingPane
		if(!this._isDocked){ this.hide(dojo.hitch(this,"_dock")); } 
	},

	maximize: function(){
		// summary: Make this FloatingPane full-screen (viewport)	
		if(this._maximized){ return; }
		this._naturalState = dojo.position(this.domNode);
		if(this._isDocked){
			this.show();
			setTimeout(dojo.hitch(this,"maximize"),this.duration);
		}
		dojo.addClass(this.focusNode,"floatingPaneMaximized");
		this.resize(dojo.window.getBox());
		this._maximized = true;
	},

	_restore: function(){
		if(this._maximized){
			this.resize(this._naturalState);
			dojo.removeClass(this.focusNode,"floatingPaneMaximized");
			this._maximized = false;
		}	
	},

	_dock: function(){
		if(!this._isDocked && this.dockable){
			this._dockNode = this.dockTo.addNode(this);
			this._isDocked = true;
		}
	},
	
	resize: function(/* Object */dim){
		// summary: Size the FloatingPane and place accordingly
		dim = dim || this._naturalState;
		this._currentState = dim;

		// From the ResizeHandle we only get width and height information
		var dns = this.domNode.style;
		if("t" in dim){ dns.top = dim.t + "px"; }
		if("l" in dim){ dns.left = dim.l + "px"; }
		dns.width = dim.w + "px"; 
		dns.height = dim.h + "px";

		// Now resize canvas
		var mbCanvas = { l: 0, t: 0, w: dim.w, h: (dim.h - this.focusNode.offsetHeight) };
		dojo.marginBox(this.canvas, mbCanvas);

		// If the single child can resize, forward resize event to it so it can
		// fit itself properly into the content area
		this._checkIfSingleChild();
		if(this._singleChild && this._singleChild.resize){
			this._singleChild.resize(mbCanvas);
		}
	},
	
	bringToTop: function(){
		// summary: bring this FloatingPane above all other panes
		var windows = dojo.filter(
			this._allFPs,
			function(i){
				return i !== this;
			}, 
		this);
		windows.sort(function(a, b){
			return a.domNode.style.zIndex - b.domNode.style.zIndex;
		});
		windows.push(this);
		
		dojo.forEach(windows, function(w, x){
			w.domNode.style.zIndex = this._startZ + (x * 2);
			dojo.removeClass(w.domNode, "dojoxFloatingPaneFg");
		}, this);
		dojo.addClass(this.domNode, "dojoxFloatingPaneFg");
	},
	
	destroy: function(){
		// summary: Destroy this FloatingPane completely
		this._allFPs.splice(dojo.indexOf(this._allFPs, this), 1);
		if(this._resizeHandle){
			this._resizeHandle.destroy();
		}
		this.inherited(arguments);
	}
});


dojo.declare("dojox.layout.Dock",
	[dijit._Widget,dijit._Templated],
	{
	// summary:
	//		A widget that attaches to a node and keeps track of incoming / outgoing FloatingPanes
	// 		and handles layout

	templateString: '<div class="dojoxDock"><ul dojoAttachPoint="containerNode" class="dojoxDockList"></ul></div>',

	// private _docked: array of panes currently in our dock
	_docked: [],
	
	_inPositioning: false,
	
	autoPosition: false,
	
	addNode: function(refNode){
		// summary: Instert a dockNode refernce into the dock
		
		var div = dojo.create('li', null, this.containerNode),
			node = new dojox.layout._DockNode({ 
				title: refNode.title,
				paneRef: refNode 
			}, div)
		;
		node.startup();
		return node;
	},

	startup: function(){
				
		if (this.id == "dojoxGlobalFloatingDock" || this.isFixedDock) {
			// attach window.onScroll, and a position like in presentation/dialog
			this.connect(window, 'onresize', "_positionDock");
			this.connect(window, 'onscroll', "_positionDock");
			if(dojo.isIE){
				this.connect(this.domNode, "onresize", "_positionDock");
			}
		}
		this._positionDock(null);
		this.inherited(arguments);

	},
	
	_positionDock: function(/* Event? */e){
		if(!this._inPositioning){	
			if(this.autoPosition == "south"){
				// Give some time for scrollbars to appear/disappear
				setTimeout(dojo.hitch(this, function() {
					this._inPositiononing = true;
					var viewport = dojo.window.getBox();
					var s = this.domNode.style;
					s.left = viewport.l + "px";
					s.width = (viewport.w-2) + "px";
					s.top = (viewport.h + viewport.t) - this.domNode.offsetHeight + "px";
					this._inPositioning = false;
				}), 125);
			}
		}
	}


});

dojo.declare("dojox.layout._DockNode",
	[dijit._Widget,dijit._Templated],
	{
	// summary:
	//		dojox.layout._DockNode is a private widget used to keep track of
	//		which pane is docked.
	//
	// title: String
	// 		Shown in dock icon. should read parent iconSrc?	
	title: "",

	// paneRef: Widget
	//		reference to the FloatingPane we reprasent in any given dock
	paneRef: null,

	templateString:
		'<li dojoAttachEvent="onclick: restore" class="dojoxDockNode">'+
			'<span dojoAttachPoint="restoreNode" class="dojoxDockRestoreButton" dojoAttachEvent="onclick: restore"></span>'+
			'<span class="dojoxDockTitleNode" dojoAttachPoint="titleNode">${title}</span>'+
		'</li>',

	restore: function(){
		// summary: remove this dock item from parent dock, and call show() on reffed floatingpane
		this.paneRef.show();
		this.paneRef.bringToTop();
		if(!this.paneRef.isLoaded){ this.paneRef.refresh(); }
		this.destroy();
	}

});
