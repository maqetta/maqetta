define("dojox/gfx/Mover", ["dojo/_base/lang","dojo/_base/array", "dojo/_base/declare", "dojo/on", "dojo/_base/event"], 
  function(lang, arr, declare, on, evt){
	return declare("dojox.gfx.Mover", null, {
		constructor: function(shape, e, host){
			// summary:
			//		an object, which makes a shape follow the mouse,
			//		used as a default mover, and as a base class for custom movers
			// shape: dojox.gfx.Shape
			//		a shape object to be moved
			// e: Event
			//		a mouse event, which started the move;
			//		only clientX and clientY properties are used
			// host: Object?
			//		object which implements the functionality of the move,
			//		 and defines proper events (onMoveStart and onMoveStop)
			var eOrig = e;
			e = e.touches ? e.touches[0] : e;
			this.shape = shape;
			this.lastX = e.clientX
			this.lastY = e.clientY;
			var h = this.host = host, d = document,
				firstEvent = on(d, "mousemove", lang.hitch(this, "onFirstMove")),
				firstTouchEvent = on(d, "touchmove", lang.hitch(this, "onFirstMove"));
			this.events = [
				on(d, "mousemove", lang.hitch(this, "onMouseMove")),
				on(d, "mouseup",   lang.hitch(this, "destroy")),
				//Handle Touch Events.
				on(d, "touchmove", lang.hitch(this, "onMouseMove")),
				on(d, "touchend",  lang.hitch(this, "destroy")),
				// cancel text selection and text dragging
				on(d, "dragstart",   lang.hitch(evt, "stop")),
				on(d, "selectstart", lang.hitch(evt, "stop")),
				firstTouchEvent,
				firstEvent
			];
			// notify that the move has started
			if(h && h.onMoveStart){
				h.onMoveStart(this);
			}
		},
		// mouse event processors
		onMouseMove: function(e){
			// summary:
			//		event processor for onmousemove
			// e: Event
			//		mouse event
			var eOrig = e;
			e = e.touches ? e.touches[0] : e;
			var x = e.clientX;
			var y = e.clientY;
			this.host.onMove(this, {dx: x - this.lastX, dy: y - this.lastY});
			this.lastX = x;
			this.lastY = y;
			evt.stop(eOrig);
		},
		// utilities
		onFirstMove: function(){
			// summary:
			//		it is meant to be called only once
			this.host.onFirstMove(this);
			this.events.pop().remove();
		},
		destroy: function(){
			// summary:
			//		stops the move, deletes all references, so the object can be garbage-collected
			arr.forEach(this.events, function(h){h.remove();});
			// undo global settings
			var h = this.host;
			if(h && h.onMoveStop){
				h.onMoveStop(this);
			}
			// destroy objects
			this.events = this.shape = null;
		}
	});
});
