dojo.provide("dojox.grid.enhanced.dnd._DndRowSelector");
dojo.declare("dojox.grid.enhanced.dnd._DndRowSelector", null, {
	//summary:
	//		This class declaration is used to be mixed in to dojox.grid._RowSelector
	//		to enable DND feature in _RowSelector.

	domousedown: function(e){
	//summary:
	//		Handle when there is a mouse down event 
	//e: Event
	//		The mouse down event
		this.grid.onMouseDown(e);
	},
	
	domouseup: function(e){
	//summary:
	//		Handle when there is a mouse up event 
	//e: Event
	//		The mouse up event
		this.grid.onMouseUp(e);
	},
	
	dofocus:function(e){
	//summary:
	//		Handle when there is a focus event 
	//e: Event
	//		The focus event
		e.cellNode.style.border = "solid 1px";
	}
});
