dojo.provide("dojox.grid.enhanced.dnd._DndGrid");
dojo.require("dojox.grid.enhanced.dnd._DndEvents");
dojo.declare("dojox.grid.enhanced.dnd._DndGrid", dojox.grid.enhanced.dnd._DndEvents, {
	//summary:
	//		This class declaration is used to be mixed in to dojox.grid._Grid
	//		to enable DND feature in _Grid.
	
		//select: _DndSelectingManager
		//		handle the DND selecting operation
	    select: null, 
		
		//dndSelectable: Boolean
		//		whether the DND feature is enabled for the grid
		dndSelectable: true,
		
		constructor: function(dndManager){
			//summary:
			//		constructor, store the reference of the instance of_DndSelectingManager
			this.select = dndManager;
		},
		
		domousedown: function(e){
			//summary:
			//		handle the mouse down event
			//e: Event
			//		the mouse down event on grid			
			if(!e.cellNode){
				this.onRowHeaderMouseDown(e);
			}
		},
		
		domouseup: function(e){
			//summary:
			//		handle the mouse up event
			//e: Event
			//		the mouse up event on grid			
			if(!e.cellNode){
				this.onRowHeaderMouseUp(e);
			}
		}
});
