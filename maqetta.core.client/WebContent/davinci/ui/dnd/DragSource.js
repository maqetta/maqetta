define(["dojo/_base/declare",
        "dojo/fx"
   ],function(declare, Fx){
        	
	return declare("davinci.ui.dnd.DragSource", null, {
		disabled: false, // disable this drag source
		dragObject: null,
		dragClone: null,
		offsetParent: null,
		offsetParentCoords: null,
		parentCoords: null,
		refNode: null, // get information (position,top,left) from this node instead of domNode
		positioning: null, // CSS position property of this drag source. "absolute" or "static"
		useCurrentPositioning: true,
		targetShouldShowCaret: false,
		draggingMousePosition: "TopLeft", // "TopLeft" or "ClickedPosition"
		data: null, // any user data associated with this ds. (widget, etc.)
		returnCloneOnFailure: true,
	
		constructor: function(node, type, data, nodeToClone){
			this.data = data;
			var node = dojo.byId(node);
			node.dragSource = this; // [custom property]
			this.domNode = node;
			this.dragObject = nodeToClone ? nodeToClone : node;
			this.refNode = node;
			this.type = type;
			this.offsetParent = dojo.doc.body;
		},
	
		onDragDown: function(e){
			if(this.useCurrentPositioning){
				this.positioning = dojo.style(this.refNode, "position");
			}
			this.storeMouseDownInfo(e);
			this.initDrag(e);
		},
	
		onDragStart: function(e){
			// Adds this.dragClone as side effect
			this.createDragClone(e);
			// Add dragClone pointer to event object so that it can be accessed by
			// higher level routines, particularly Palette.js (widget palette)
			e._dragClone = this.dragClone;
			return this.dragClone;
		},
	
		onDragMove: function(e){
			if(this.draggingMousePosition == "TopLeft"){
				this.dragClone.style.top = e.pageY + 4 + (e.documentY || 0)+ "px";
				this.dragClone.style.left = e.pageX + 4 + (e.documentX || 0)+ "px";
			}else if(this.draggingMousePosition == "ClickedPosition"){
				this.dragClone.style.top = e.pageY - this.dragOffset.y + (e.documentY || 0) + "px";
				this.dragClone.style.left = e.pageX - this.dragOffset.x + (e.documentX || 0) + "px";
			}
			if(this.dragClone.style.display == "none"){
				this.dragClone.style.display = "";
			}
		},
	
		onDragEnd: function(e){
			if(e.dragStatus == "dropSuccess" || !this.returnCloneOnFailure){
				this.removeClone();
			}else if(e.dragStatus == "dropFailure"){
				this.returnClone();
			}else{
				console.error("DragSource#onDragEnd: internal error: e.dragStatus is not set");
			}
			this.cleanupDrag();
		},
	
		unregister: function(){
			this.domNode.dragSource = null; // [custom property]
			this.cleanupDrag();
		},
	
		reregister: function(){
			this.domNode.dragSource = this; // [custom property]
			this.initDrag();
		},
	
	
		storeMouseDownInfo: function(e){
			if(dojo.isIE){
				// take border width into account
				this.layerX = e.layerX + dojo._getBorderExtents(this.domNode).l; //TODO: is this really correct?
				this.layerY = e.layerY + dojo._getBorderExtents(this.domNode).t; //TODO: is this really correct?
			}else{
				this.layerX = e.layerX - 1;
				this.layerY = e.layerY - 1;
			}
			this.pageX = e.pageX;
			this.pageY = e.pageY;
			this.scrollOffset = dojo._docScroll();
			this.dragStartPosition = dojo.position(this.refNode, true); // {x:#, y:#}
			this.dragStartCssPosition = {
				y: this.refNode.offsetTop,
				x: this.refNode.offsetLeft
			};
			this.dragOffset = {
				y: e.pageY - this.dragStartPosition.y,
				x: e.pageX - this.dragStartPosition.x
			};
			this.offsetParentCoords = dojo.position(this.offsetParent, true); // {x:#, y:#}
	
			var parentPosition = dojo.position(this.domNode.parentNode, true);
			this.parentCoords = {
				y: parentPosition.y - this.offsetParentCoords.y,
				x: parentPosition.x - this.offsetParentCoords.x
			};
	
			// Users of the DragSource may want to fix the mouse down info
			if(this.fixMouseDownInfo){
				this.fixMouseDownInfo(this);
			}
		},
	
		initDrag: function(){
			if(dojo.isIE){
				dojo._event_listener.add(this.domNode, "ondragstart", this.cancelEvent);
			}
		},
	
		cleanupDrag: function(){
			if(dojo.isIE){
				dojo._event_listener.remove(this.domNode, "ondragstart", this.cancelEvent);			
			}
		},
	
		createDragClone: function(e){
			var dragClone;
			if (e.dragSource.dragHandler && e.dragSource.dragHandler.createDragClone) {
				// If dragHandler has a custom createDragClone, invoke it
				//    (Note: tracing through code, drag/drop image from Files palette onto canvas uses this logic)
				dragClone = e.dragSource.dragHandler.createDragClone();
			} else {
				// Default action: simply clone the original DIV whose dragStart handler
				// (ie, mousedown) initiated the drag operation
				//     (Note: tracing through code, drag/drop from Widgets palette onto canvas uses this logic)
				dragClone = this.dragObject.cloneNode(true);
			}
			this.dragClone = dragClone;
			dojo.style(dragClone, 'opacity', 0.5);
			dragClone.style.zIndex = 1001000;
	
			var box = dojo.contentBox(this.dragObject);
		    dragClone.style.width = box.w + "px";
		    dragClone.style.height = box.h + "px";
		    dragClone.style.top = this.dragObject.offsetTop + 4 + "px";
		    dragClone.style.left = this.dragObject.offsetLeft + 4 + "px";
		    dragClone.style.position = "absolute";
		    dragClone.style.clear = "both";
			dragClone.style.display = "none";
			this.offsetParent.appendChild(dragClone);
		},
	
		setDragTarget: function(node){
			this.dragObject = node;
		},
	
		cancelEvent: function(e){
			e.stopPropagation();
			e.preventDefault();
		},
	
		removeClone: function(){
			// Use setTime to ensure that any methods that are connected to onDragEnd
			// can safely access the dragClone before the actual removal is performed.
			setTimeout(dojo.hitch(this, "removeClone_1"), 0);
		},
	
		removeClone_1: function(){
			this.dragClone.parentNode.removeChild(this.dragClone);
			this.dragClone = null;
		},
	
		returnClone: function(){
			var startCoords = dojo.position(this.dragClone, true); // {x, y}
			var endCoords = this.dragStartPosition; // {x, y}
	//		var endCoords = {
	//			left: this.dragStartPosition.x,
	//			top: this.dragStartPosition.y
	//		};
			var overrunCoords = {
				x: startCoords.x > endCoords.x ? endCoords.x - 10 : endCoords.x + 10,
				y: startCoords.y > endCoords.y ? endCoords.y - 10 : endCoords.y + 10
			}
	
			var _this = this;
			Fx.slideTo({ node: this.dragClone, top: overrunCoords.y, left: overrunCoords.x, duration: 400,
				onEnd: function(){
					Fx.slideTo({ node: _this.dragClone, top: endCoords.y, left: endCoords.x, duration: 100,
						onEnd: function(){
							_this.dragClone.parentNode.removeChild(_this.dragClone);
							_this.dragClone = null;
							_this.onCloneReturned();
						}
					}).play();
				}
			}).play();
		},
	
		onCloneReturned: function(){
		},
	
		globalChangeCursor: function(cursor){
			var sheet = dojo.doc.styleSheets[0];
			if(!sheet){ return; }
			if(cursor){
				if(this._showingCursor){
					if(this._showingCursor == cursor){ return; } // already showing
					this.globalChangeCursor(null);
				}
				this._showingCursor = cursor;
				if(dojo.isIE){
					this._ruleIndex = sheet.rules.length;
					sheet.addRule("*", "{cursor:"+cursor+" ! important;}", sheet.rules.length);
					this._prevCursor = dojo.doc.body.style.cursor;
					dojo.doc.body.style.cursor = null; // workaround to update cursor immediately
				}else {
					this._ruleIndex = sheet.cssRules.length;
					sheet.insertRule("*" + "{cursor:"+cursor+" ! important;}", sheet.cssRules.length);
				}
			}else{
				if(!this._showingCursor){ return; }
				this._showingCursor = null;
				if(dojo.isIE){
					sheet.removeRule(this._ruleIndex);
					dojo.doc.body.style.cursol = this._prevCursor != null ? this._prevCursor : 'auto';
				}else {
					sheet.deleteRule(this._ruleIndex);
				}
			}
		}
	});
});