dojo.provide("dojox.grid.enhanced.dnd._DndEvents");

dojo.declare("dojox.grid.enhanced.dnd._DndEvents", null, {
	//summary:
	//		This class declaration is used to be mixed in to dojox.grid._Event
	//		to enable the _Event to handle several events for DND feature

	//rowActiveClass: String
	// 		css class to apply to grid rows when activated(mouse down)	
	rowBarActiveClass: 'dojoxGridRowBarActive',
		
	onMouseUp: function(e){
		// summary:
		//		Event fired when mouse is up inside grid.
		// e: Event
		//		Decorated event object that contains reference to grid, cell, and rowIndex		
		e.rowIndex == -1 ? this.onHeaderCellMouseUp(e) : this.onCellMouseUp(e);
		this.select.resetStartPoint();
		this.select.clearInSelectingMode();
		!isNaN(e.rowIndex) && e.cellIndex == -1 && this.focus.focusRowBarNode(e.rowIndex);
	},
	
	onMouseUpRow: function(e){
		// summary:
		//		Event fired when mouse is up inside grid row
		// e: Event
		//		Decorated event object that contains reference to grid, cell, and rowIndex
		if (this.dndSelectable) {
			//waiting ...
		} else if(e.rowIndex != -1)
			this.onRowMouseUp(e);
	},
	
	onCellMouseUp: function(e){
		// summary:
		//		Event fired when mouse is up in a cell.
		// e: Event
		// 		Decorated event object which contains reference to grid, cell, and rowIndex
		if (e.cellIndex > this.select.exceptColumnsTo) {
			this.select.setInSelectingMode("cell", true);
		}
	},

	onRowHeaderMouseDown: function(e) {		
		//summary:
		//		Handle when there is a mouse down event on row header (row bar), 
		//		Call the dnd select to add the row to select
		//e: Event
		//		The mouse down event
		//blur column header focus
		this.focus._colHeadNode = this.focus._colHeadFocusIdx = null;
		this.focus.focusRowBarNode(e.rowIndex);	
		if(e.button == 2) {
			return;//alwarys return for oncontextmenu event to only show menu
		}
		this.select.setInSelectingMode("row", true);
		this.select.keepState = e.ctrlKey && !this.pluginMgr.inSingleSelection();
		this.select.extendSelect = e.shiftKey;
		this.select.setDrugStartPoint(-1, e.rowIndex);
		if(this.select.extendSelect && !this.pluginMgr.inSingleSelection()){
			this.select.restorLastDragPoint();
		} 
		this.select.drugSelectRow(e.rowIndex);
		dojo.addClass(e.rowNode, this.rowBarActiveClass);
		dojo.stopEvent(e);
	},
	
	onRowHeaderMouseUp: function(e) {
		//summary:
		//		Handle when there is a mouse up event on row header (row bar), 
		//e: Event
		//		The mouse up event
		this.onMouseUp(e);
		dojo.removeClass(e.rowNode, this.rowBarActiveClass);
	},
	
	onRowMouseUp: function(e){
		// summary:
		//		Event fired when mouse is up in a row.
		// e: Event
		// 		Decorated event object which contains reference to grid, cell, and rowIndex
		this.select.setInSelectingMode("row", false);
	}
});
