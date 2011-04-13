dojo.provide("dojox.grid.enhanced.dnd._DndMover");

dojo.require("dojo.dnd.move");

dojo.declare("dojox.grid.enhanced.dnd._DndMover", dojo.dnd.Mover, {
	
	onMouseMove: function(e){
		// summary:
		//		Overwritten, see dojo.dnd.Mover.onMouseMove()
		dojo.dnd.autoScroll(e);
		var m = this.marginBox;
		this.host.onMove(this, {l: m.l + e.pageX, t: m.t + e.pageY}, {x:e.pageX, y:e.pageY});
		dojo.stopEvent(e);
	}
});

dojo.declare("dojox.grid.enhanced.dnd._DndBoxConstrainedMoveable", dojo.dnd.move.boxConstrainedMoveable, {
	//movingType: String
	//		Row moving - 'row' or column moving - 'col'
	movingType: 'row',
	
	constructor: function(node, params){
		if(!params || !params.movingType){ return; }
		this.movingType = params.movingType;
	},
	
	onFirstMove: function(/* dojo.dnd.Mover */ mover){
		// summary:
		//		Overwritten, see dojo.dnd.move.constrainedMoveable.onFirstMove()
		this.inherited(arguments);
		if(this.within){
			var c = this.constraintBox, mb = dojo.marginBox(mover.node);
			if(this.movingType == 'row'){
				c.r += mb.w;	
			}else if(this.movingType == 'col'){
				c.b += mb.h;
			}
		}
	}
});
