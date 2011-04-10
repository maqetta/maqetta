dojo.provide("dojox.grid.enhanced.dnd._DndBuilder");
dojo.declare("dojox.grid.enhanced.dnd._DndBuilder", null, {
	//summary:
	//		This class declaration is used to be mixed in to dojox.grid._Builder
	//		to enable the _Builder to handle mouse up event for DND feature
	
	domouseup:function(e){
	//summary:
	//		Handle when there is a mouse up event 
	//e: Event
	//		The mouse up event
		if(this.grid.select.isInSelectingMode("col")) {
			this.grid.nestedSorting ? this.grid.focus.focusSelectColEndingHeader(e) : this.grid.focus.focusHeaderNode(e.cellIndex);
		}
		if (e.cellNode)
			this.grid.onMouseUp(e);
		this.grid.onMouseUpRow(e)
	}
});

dojo.declare("dojox.grid.enhanced.dnd._DndHeaderBuilder", null, {
	//summary:
	//		This class declaration is used to be mixed in to dojox.grid._HeadBuilder
	//		to enable the _HeadBuilder to handle mouse up event for DND feature
	
	domouseup: function(e){
		//summary:
		//		Handle when there is a mouse up event 
		//e: Event
		//		The mouse up event
		if(this.grid.select.isInSelectingMode("col")) {
			this.grid.nestedSorting ? this.grid.focus.focusSelectColEndingHeader(e) : this.grid.focus.focusHeaderNode(e.cellIndex);
		}
		this.grid.onMouseUp(e);
	}
});
