dojo.provide("dojox.layout.ResizeHandle");
dojo.experimental("dojox.layout.ResizeHandle"); 

dojo.require("dijit._Widget");
dojo.require("dijit._Templated"); 
dojo.require("dojo.fx"); 
dojo.require("dojo.window");

dojo.declare("dojox.layout.ResizeHandle",
	[dijit._Widget, dijit._Templated],
	{
	// summary: A dragable handle used to resize an attached node.
	//
	// description:
	//	The handle on the bottom-right corner of FloatingPane or other widgets that allows
	//	the widget to be resized.
	//	Typically not used directly.
	//
	// targetId: String
	//	id of the Widget OR DomNode that I will size
	targetId: "",
	
	// targetContainer: DomNode
	//	over-ride targetId and attch this handle directly to a reference of a DomNode
	targetContainer: null, 
	
	// resizeAxis: String
	//	one of: x|y|xy limit resizing to a single axis, default to xy ... 
	resizeAxis: "xy",
	
	// activeResize: Boolean
	// 	if true, node will size realtime with mouse movement, 
	//	if false, node will create virtual node, and only resize target on mouseUp
	activeResize: false,
	
	// activeResizeClass: String
	//	css class applied to virtual resize node. 
	activeResizeClass: "dojoxResizeHandleClone",
	
	// animateSizing: Boolean
	//	only applicable if activeResize = false. onMouseup, animate the node to the
	//	new size
	animateSizing: true,
	
	// animateMethod: String
	// 	one of "chain" or "combine" ... visual effect only. combine will "scale" 
	// 	node to size, "chain" will alter width, then height
	animateMethod: "chain",

	// animateDuration: Integer
	//	time in MS to run sizing animation. if animateMethod="chain", total animation 
	//	playtime is 2*animateDuration
	animateDuration: 225,

	// minHeight: Integer
	//	smallest height in px resized node can be
	minHeight: 100,

	// minWidth: Integer
	//	smallest width in px resize node can be
	minWidth: 100,

	// constrainMax: Boolean
	//	Toggle if this widget cares about the maxHeight and maxWidth 
	//	parameters. 
	constrainMax: false,

	// maxHeight: Integer
	//	Largest height size in px the resize node can become. 
	maxHeight:0, 
	
	// maxWidth: Integer
	//	Largest width size in px the reize node can become.
	maxWidth:0,

	// fixedAspect: Boolean
	//		Toggle to enable this widget to maintain the aspect 
	//		ratio of the attached node. 
	fixedAspect: false,

	// intermediateChanges: Boolean
	//		Toggle to enable/disable this widget from firing onResize
	//		events at every step of a resize. If `activeResize` is true,
	//		and this is false, onResize only fires _after_ the drop 
	//		operation. Animated resizing is not affected by this setting.
	intermediateChanges: false,

	// startTopic: String
	//		The name of the topic this resizehandle publishes when resize is starting
	startTopic: "/dojo/resize/start",
	
	// endTopic: String
	//		The name of the topic this resizehandle publishes when resize is complete
	endTopic:"/dojo/resize/stop",

	templateString: '<div dojoAttachPoint="resizeHandle" class="dojoxResizeHandle"><div></div></div>',

	postCreate: function(){
		// summary: setup our one major listener upon creation
		this.connect(this.resizeHandle, "onmousedown", "_beginSizing");
		if(!this.activeResize){ 
			// there shall be only a single resize rubberbox that at the top
			// level so that we can overlay it on anything whenever the user
			// resizes something. Since there is only one mouse pointer he
			// can't at once resize multiple things interactively.
			this._resizeHelper = dijit.byId('dojoxGlobalResizeHelper');
			if(!this._resizeHelper){
				this._resizeHelper = new dojox.layout._ResizeHelper({ 
						id: 'dojoxGlobalResizeHelper'
				}).placeAt(dojo.body());
				dojo.addClass(this._resizeHelper.domNode, this.activeResizeClass);
			}
		}else{ this.animateSizing = false; } 	

		if(!this.minSize){ 
			this.minSize = { w: this.minWidth, h: this.minHeight };
		}
		
		if(this.constrainMax){
			this.maxSize = { w: this.maxWidth, h: this.maxHeight }
		}
		
		// should we modify the css for the cursor hover to n-resize nw-resize and w-resize?
		this._resizeX = this._resizeY = false;
		var addClass = dojo.partial(dojo.addClass, this.resizeHandle); 
		switch(this.resizeAxis.toLowerCase()){
			case "xy" : 
				this._resizeX = this._resizeY = true; 
				// FIXME: need logic to determine NW or NE class to see
				// based on which [todo] corner is clicked
				addClass("dojoxResizeNW"); 
				break; 
			case "x" : 
				this._resizeX = true; 
				addClass("dojoxResizeW");
				break;
			case "y" : 
				this._resizeY = true; 
				addClass("dojoxResizeN");
				break;
		}
	},

	_beginSizing: function(/*Event*/ e){
		// summary: setup movement listeners and calculate initial size
		
		if(this._isSizing){ return false; }

		dojo.publish(this.startTopic, [ this ]);
		this.targetWidget = dijit.byId(this.targetId);

		this.targetDomNode = this.targetWidget ? this.targetWidget.domNode : dojo.byId(this.targetId);
		if(this.targetContainer){ this.targetDomNode = this.targetContainer; }
		if(!this.targetDomNode){ return false; }

		if(!this.activeResize){
			var c = dojo.position(this.targetDomNode, true);
			console.log(c);
			console.log(dojo.window.getBox());
			this._resizeHelper.resize({l: c.x, t: c.y, w: c.w, h: c.h});
			this._resizeHelper.show();
		}

		this._isSizing = true;
		this.startPoint  = { x:e.clientX, y:e.clientY};

		// FIXME: this is funky: marginBox adds height, contentBox ignores padding (expected, but foo!)
		var mb = this.targetWidget ? dojo.marginBox(this.targetDomNode) : dojo.contentBox(this.targetDomNode);  
		this.startSize  = { w:mb.w, h:mb.h };
		
		if(this.fixedAspect){
			var max, val;
			if(mb.w > mb.h){
				max = "w";
				val = mb.w / mb.h
			}else{
				max = "h";
				val = mb.h / mb.w
			}
			this._aspect = { prop: max };
			this._aspect[max] = val;
		}

		this._pconnects = []; 
		this._pconnects.push(dojo.connect(dojo.doc,"onmousemove",this,"_updateSizing")); 
		this._pconnects.push(dojo.connect(dojo.doc,"onmouseup", this, "_endSizing"));
		
		dojo.stopEvent(e); 
	},

	_updateSizing: function(/*Event*/ e){
		// summary: called when moving the ResizeHandle ... determines 
		//	new size based on settings/position and sets styles.

		if(this.activeResize){
			this._changeSizing(e);
		}else{
			var tmp = this._getNewCoords(e);
			if(tmp === false){ return; }
			this._resizeHelper.resize(tmp);
		}
		e.preventDefault();
	},

	_getNewCoords: function(/* Event */ e){
		
		// On IE, if you move the mouse above/to the left of the object being resized,
		// sometimes clientX/Y aren't set, apparently.  Just ignore the event.
		try{
			if(!e.clientX  || !e.clientY){ return false; }
		}catch(e){
			// sometimes you get an exception accessing above fields...
			return false;
		}
		this._activeResizeLastEvent = e; 

		var dx = (this.isLeftToRight()? this.startPoint.x - e.clientX: e.clientX - this.startPoint.x),
			dy = this.startPoint.y - e.clientY,
			newW = this.startSize.w - (this._resizeX ? dx : 0),
			newH = this.startSize.h - (this._resizeY ? dy : 0)
		;
			
		return this._checkConstraints(newW, newH); // Object
	},
	
	_checkConstraints: function(newW, newH){
		// summary: filter through the various possible constaint possibilities.
				
		// minimum size check
		if(this.minSize){
			var tm = this.minSize;
			if(newW < tm.w){
				newW = tm.w;
			}
			if(newH < tm.h){
				newH = tm.h;
			}
		}
		
		// maximum size check:
		if(this.constrainMax && this.maxSize){
			var ms = this.maxSize;
			if(newW > ms.w){
				newW = ms.w;
			}
			if(newH > ms.h){
				newH = ms.h;
			}
		}
		
		if(this.fixedAspect){
			var ta = this._aspect[this._aspect.prop];
			if(newW < newH){
				newH = newW * ta;
			}else if(newH < newW){
				newW = newH * ta;
			}
		}
		
		return { w: newW, h: newH }; // Object
	},
		
	_changeSizing: function(/*Event*/ e){
		// summary: apply sizing information based on information in (e) to attached node
		var tmp = this._getNewCoords(e);
		if(tmp === false){ return; }

		if(this.targetWidget && dojo.isFunction(this.targetWidget.resize)){ 
			this.targetWidget.resize(tmp);
		}else{
			if(this.animateSizing){
				var anim = dojo.fx[this.animateMethod]([
					dojo.animateProperty({
						node: this.targetDomNode,
						properties: { 
							width: { start: this.startSize.w, end: tmp.w } 
						},	
						duration: this.animateDuration
					}),
					dojo.animateProperty({
						node: this.targetDomNode,
						properties: { 
							height: { start: this.startSize.h, end: tmp.h }
						},
						duration: this.animateDuration
					})
				]);
				anim.play();
			}else{
				dojo.style(this.targetDomNode,{
					width: tmp.w + "px",
					height: tmp.h + "px"
				});
			}
		}
		if(this.intermediateChanges){
			this.onResize(e);
		}	
	},

	_endSizing: function(/*Event*/ e){
		// summary: disconnect listenrs and cleanup sizing
		dojo.forEach(this._pconnects, dojo.disconnect);
		var pub = dojo.partial(dojo.publish, this.endTopic, [ this ]);
		if(!this.activeResize){
			this._resizeHelper.hide();
			this._changeSizing(e);
			setTimeout(pub, this.animateDuration + 15);
		}else{
			pub();
		}
		this._isSizing = false;
		this.onResize(e);
	},
	
	onResize: function(e){
		// summary: Stub fired when sizing is done. Fired once 
		//	after resize, or often when `intermediateChanges` is 
		//	set to true. 
	}
	
});

dojo.declare("dojox.layout._ResizeHelper",
	dijit._Widget,
	{
	// summary: A global private resize helper shared between any 
	//		`dojox.layout.ResizeHandle` with activeSizing off.
	
	show: function(){
		// summary: show helper to start resizing
		dojo.fadeIn({ 
			node: this.domNode, 
			duration: 120, 
			beforeBegin: function(n){ dojo.style(n, "display", "") }
		}).play();
	},
	
	hide: function(){
		// summary: hide helper after resizing is complete
		dojo.fadeOut({ 
			node: this.domNode, 
			duration: 250,
			onEnd: function(n){ dojo.style(n, "display", "none") }
		}).play();
	},
	
	resize: function(/* Object */dim){
		// summary: size the widget and place accordingly

		// FIXME: this is off when padding present
		dojo.marginBox(this.domNode, dim);
	}
	
});
