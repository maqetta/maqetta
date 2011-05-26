dojo.provide("dojox.layout.ExpandoPane");
dojo.experimental("dojox.layout.ExpandoPane"); // just to show it can be done?

dojo.require("dijit.layout.ContentPane");
dojo.require("dijit._Templated");
dojo.require("dijit._Contained");

dojo.declare("dojox.layout.ExpandoPane",
	[dijit.layout.ContentPane, dijit._Templated, dijit._Contained, dijit._Container],
	{
	// summary: An experimental collapsing-pane for dijit.layout.BorderContainer
	//
	// description:
	//		Works just like a ContentPane inside of a borderContainer. Will expand/collapse on
	//		command, and supports having Layout Children as direct descendants
	//

	//maxHeight: "",
	//maxWidth: "",
	//splitter: false,
	attributeMap: dojo.delegate(dijit.layout.ContentPane.prototype.attributeMap, {
	        title: { node: "titleNode", type: "innerHTML" }
	}),
	
	templateString: dojo.cache("dojox.layout","resources/ExpandoPane.html"),

	// easeOut: String|Function
	//		easing function used to hide pane
	easeOut: "dojo._DefaultEasing",
	
	// easeIn: String|Function
	//		easing function use to show pane
	easeIn: "dojo._DefaultEasing",
	
	// duration: Integer
	//		duration to run show/hide animations
	duration: 420,

	// startExpanded: Boolean
	//		Does this widget start in an open (true) or closed (false) state
	startExpanded: true,

	// previewOpacity: Float
	//		A value from 0 .. 1 indicating the opacity to use on the container
	//		when only showing a preview
	previewOpacity: 0.75,
	
	// previewOnDblClick: Boolean
	//		If true, will override the default behavior of a double-click calling a full toggle.
	//		If false, a double-click will cause the preview to popup
	previewOnDblClick: false,

	baseClass: "dijitExpandoPane",

	postCreate: function(){
		this.inherited(arguments);
		this._animConnects = [];

		this._isHorizontal = true;
		
		if(dojo.isString(this.easeOut)){
			this.easeOut = dojo.getObject(this.easeOut);
		}
		if(dojo.isString(this.easeIn)){
			this.easeIn = dojo.getObject(this.easeIn);
		}
	
		var thisClass = "", rtl = !this.isLeftToRight();
		if(this.region){
			switch(this.region){
				case "trailing" :
				case "right" :
					thisClass = rtl ? "Left" : "Right";
					break;
				case "leading" :
				case "left" :
					thisClass = rtl ? "Right" : "Left";
					break;
				case "top" :
					thisClass = "Top";
					break;
				case "bottom" :
					thisClass = "Bottom";
					break;
			}
			dojo.addClass(this.domNode, "dojoxExpando" + thisClass);
			dojo.addClass(this.iconNode, "dojoxExpandoIcon" + thisClass);
			this._isHorizontal = /top|bottom/.test(this.region);
		}
		dojo.style(this.domNode, {
			overflow: "hidden",
			padding:0
		});
		
		this.connect(this.domNode, "ondblclick", this.previewOnDblClick ? "preview" : "toggle");
		
		if(this.previewOnDblClick){
			this.connect(this.getParent(), "_layoutChildren", dojo.hitch(this, function(){
				this._isonlypreview = false;
			}));
		}
		
	},
	
	_startupSizes: function(){
		
		this._container = this.getParent();
		this._closedSize = this._titleHeight = dojo.marginBox(this.titleWrapper).h;
		
		if(this.splitter){
			// find our splitter and tie into it's drag logic
			var myid = this.id;
			dijit.registry.filter(function(w){
				return w && w.child && w.child.id == myid;
			}).forEach(dojo.hitch(this,function(w){
				this.connect(w,"_stopDrag","_afterResize");
			}));
		}
		
		this._currentSize = dojo.contentBox(this.domNode);	// TODO: can compute this from passed in value to resize(), see _LayoutWidget for example
		this._showSize = this._currentSize[(this._isHorizontal ? "h" : "w")];
		this._setupAnims();

		if(this.startExpanded){
			this._showing = true;
		}else{
			this._showing = false;
			this._hideWrapper();
			this._hideAnim.gotoPercent(99,true);
		}
		
		this._hasSizes = true;
	},
	
	_afterResize: function(e){
		var tmp = this._currentSize;						// the old size
		this._currentSize = dojo.marginBox(this.domNode);	// the new size
		var n = this._currentSize[(this._isHorizontal ? "h" : "w")]
		if(n > this._titleHeight){
			if(!this._showing){
				this._showing = !this._showing;
				this._showEnd();
			}
			this._showSize = n;
			this._setupAnims();
		}else{
			this._showSize = tmp[(this._isHorizontal ? "h" : "w")];
			this._showing = false;
			this._hideWrapper();
			this._hideAnim.gotoPercent(89,true);
		}
		
	},
	
	_setupAnims: function(){
		// summary: Create the show and hide animations
		dojo.forEach(this._animConnects, dojo.disconnect);
		
		var _common = {
				node:this.domNode,
				duration:this.duration
			},
			isHorizontal = this._isHorizontal,
			showProps = {},
			hideProps = {},
			dimension = isHorizontal ? "height" : "width"
		;

		showProps[dimension] = {
			end: this._showSize
		};
		hideProps[dimension] = {
			end: this._closedSize
		};
		
		this._showAnim = dojo.animateProperty(dojo.mixin(_common,{
			easing:this.easeIn,
			properties: showProps
		}));
		this._hideAnim = dojo.animateProperty(dojo.mixin(_common,{
			easing:this.easeOut,
			properties: hideProps
		}));

		this._animConnects = [
			dojo.connect(this._showAnim, "onEnd", this, "_showEnd"),
			dojo.connect(this._hideAnim, "onEnd", this, "_hideEnd")
		];
	},
	
	preview: function(){
		// summary: Expand this pane in preview mode (does not affect surrounding layout)

		if(!this._showing){
			this._isonlypreview = !this._isonlypreview;
		}
		this.toggle();
	},

	toggle: function(){
		// summary: Toggle this pane's visibility
		if(this._showing){
			this._hideWrapper();
			this._showAnim && this._showAnim.stop();
			this._hideAnim.play();
		}else{
			this._hideAnim && this._hideAnim.stop();
			this._showAnim.play();
		}
		this._showing = !this._showing;
	},
	
	_hideWrapper: function(){
		// summary: Set the Expando state to "closed"
		dojo.addClass(this.domNode, "dojoxExpandoClosed");
		
		dojo.style(this.cwrapper,{
			visibility: "hidden",
			opacity: "0",
			overflow: "hidden"
		});
	},
	
	_showEnd: function(){
		// summary: Common animation onEnd code - "unclose"
		dojo.style(this.cwrapper, {
			opacity: 0,
			visibility:"visible"
		});
		dojo.anim(this.cwrapper, {
			opacity: this._isonlypreview ? this.previewOpacity : 1
		}, 227);
		dojo.removeClass(this.domNode, "dojoxExpandoClosed");
		if(!this._isonlypreview){
			setTimeout(dojo.hitch(this._container, "layout"), 15);
		}else{
			this._previewShowing = true;
			this.resize();
		}
	},
	
	_hideEnd: function(){
		// summary: Callback for the hide animation - "close"

		// every time we hide, reset the "only preview" state
		if(!this._isonlypreview){
			setTimeout(dojo.hitch(this._container, "layout"), 25);
		}else{
			this._previewShowing = false;
		}
		this._isonlypreview = false;
		
	},
	
	resize: function(/* Object? */newSize){
		// summary:
		//		we aren't a layout widget, but need to act like one:
		// newSize: Object
		//		The size object to resize to

		if(!this._hasSizes){ this._startupSizes(newSize); }
		
		// compute size of container (ie, size left over after title bar)
		var currentSize = dojo.marginBox(this.domNode);
		this._contentBox = {
			w: newSize && "w" in newSize ? newSize.w : currentSize.w,
			h: (newSize && "h" in newSize ? newSize.h : currentSize.h) - this._titleHeight
		};
		dojo.style(this.containerNode, "height", this._contentBox.h + "px");

		if(newSize){
			dojo.marginBox(this.domNode, newSize);
		}

		this._layoutChildren();
	},
	
	_trap: function(e){
		// summary: Trap stray events
		dojo.stopEvent(e);
	}

});
