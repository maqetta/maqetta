dojo.provide("dojox.layout.DragPane");

dojo.require("dijit._Widget");

dojo.declare("dojox.layout.DragPane",
	dijit._Widget, {
	//
	// summary: Makes a pane's content dragable by/within it's surface
	//
	// description:
	//		A small widget which takes a node with overflow:auto and
	//		allows dragging to position the content. Useful with images,
	//		or for just adding "something" to a overflow-able div.
	//
	// invert: Boolean
	//		Naturally, the behavior is to invert the axis of the drag.
	//		Setting invert:false will make the pane drag in the same
	//		direction as the mouse.
	invert:true,
	
	postCreate: function(){

		this.inherited(arguments);
		this.connect(this.domNode,"onmousedown","_down");
		this.connect(this.domNode,"onmouseup","_up");
	},
	
	_down: function(e){
		// summary: mousedown handler, start the dragging
		var t = this.domNode;
		dojo.style(t,"cursor","move");
		this._x = e.pageX;
		this._y = e.pageY;
		if ((this._x < t.offsetLeft + t.clientWidth) &&
			(this._y < t.offsetTop + t.clientHeight)) {
			dojo.setSelectable(t,false);
			this._mover = this.connect(t,"onmousemove","_move");
		}
	},
	
	_up: function(e){
		// summary: mouseup handler, stop the dragging
		
		dojo.setSelectable(this.domNode,true);
		dojo.style(this.domNode,"cursor","pointer");
		this.disconnect(this._mover);
	},
	
	_move: function(e){
		// summary: mousemove listener, offset the scroll amount by the delta
		//		since our last call.
		
		var mod = this.invert ? 1 : -1;
		this.domNode.scrollTop += (this._y - e.pageY) * mod;
		this.domNode.scrollLeft += (this._x - e.pageX) * mod;
		this._x = e.pageX;
		this._y = e.pageY;
		
	}
	
});
