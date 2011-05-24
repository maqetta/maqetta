dojo.provide("dojox.grid.enhanced._Events");

dojo.declare("dojox.grid.enhanced._Events", null, {
	// summary:
	//		Overwrite some default events of DataGrid
	//
	// description:
	//		Methods are copied or replaced for overwriting, this might be refined once
	//		an overall plugin architecture is set up for DataGrid.

	//_events: Object
	//		Method map cached from dojox.grid._Events().
	_events: null,

	// headerCellActiveClass: String
	//		css class to apply to grid header cells when activated(mouse down)
	headerCellActiveClass: 'dojoxGridHeaderActive',
	
	// cellActiveClass: String
	//		css class to apply to grid content cells when activated(mouse down)
	cellActiveClass: 'dojoxGridCellActive',
	
	// rowActiveClass: String
	//		css class to apply to grid rows when activated(mouse down)
	rowActiveClass: 'dojoxGridRowActive',

	constructor: function(inGrid){
		//get the default Grid events
		this._events = new dojox.grid._Events();
		//for methods that won't be overwritten, copy them to "this" scope
		for(var p in this._events){
			if(!this[p]){
				this.p = this._events.p;
			}
		}
		//mixin "this" to Grid
		inGrid.mixin(inGrid, this);
	},
	dokeyup: function(e){
		// summary:
		//		Grid key up event handler.
		// e: Event
		//		Un-decorated event object
		this.focus.currentArea().keyup(e);
	},
	onKeyDown: function(e){
		// summary:
		//		Overwritten, see dojox.grid._Events.onKeyDown();
		if(e.altKey || e.metaKey){ return; }
		var dk = dojo.keys;
		var focus = this.focus;
		switch(e.keyCode){
			case dk.TAB:
				if(e.ctrlKey){ return; }
				focus.tab(e.shiftKey ? -1:1,e);
				break;
			case dk.UP_ARROW:
			case dk.DOWN_ARROW:
				focus.currentArea().move(e.keyCode == dk.UP_ARROW ? -1 : 1, 0, e);
				break;
			case dk.LEFT_ARROW:
			case dk.RIGHT_ARROW:
				var offset = (e.keyCode == dk.LEFT_ARROW) ? 1 : -1;
				if(dojo._isBodyLtr()){ offset *= -1; }
				focus.currentArea().move(0, offset, e);
				break;
			case dk.F10:
				if(this.menus && e.shiftKey){
					this.onRowContextMenu(e);
				}
				break;
			default:
				focus.currentArea().keydown(e);
				break;
		}
	},
	//TODO - make the following events more reasonalble - e.g. more accurate conditions
	//events for row selectors
	domouseup: function(e){
		if(e.cellNode){
			this.onMouseUp(e);
		}else{
			this.onRowSelectorMouseUp(e);
		}
	},
	domousedown: function(e){
		if(!e.cellNode){
			this.onRowSelectorMouseDown(e);
		}
	},
	onMouseUp: function(e){
		// summary:
		//		New - Event fired when mouse is up inside grid.
		// e: Event
		//		Decorated event object that contains reference to grid, cell, and rowIndex
		this[e.rowIndex == -1 ? "onHeaderCellMouseUp" : "onCellMouseUp"](e);
	},
	onCellMouseDown: function(e){
		// summary:
		//		Overwritten, see dojox.grid._Events.onCellMouseDown()
		dojo.addClass(e.cellNode, this.cellActiveClass);
		dojo.addClass(e.rowNode, this.rowActiveClass);
	},
	onCellMouseUp: function(e){
		// summary:
		//		New - Event fired when mouse is up inside content cell.
		// e: Event
		//		Decorated event object that contains reference to grid, cell, and rowIndex
		dojo.removeClass(e.cellNode, this.cellActiveClass);
		dojo.removeClass(e.rowNode, this.rowActiveClass);
	},
	onCellClick: function(e){
		// summary:
		//		Overwritten, see dojox.grid._Events.onCellClick()

		//invoke dojox.grid._Events.onCellClick()
		this._events.onCellClick.call(this, e);
		//move mouse events to the focus manager.
		this.focus.contentMouseEvent(e);//TODO
	},
	onCellDblClick: function(e){
		// summary:
		//		Overwritten, see dojox.grid._Events.onCellDblClick()
		if(this.pluginMgr.isFixedCell(e.cell)){ return; }
		if(this._click.length > 1 && (!this._click[0] || !this._click[1])){
			this._click[0] = this._click[1] = e;
		}
		//invoke dojox.grid._Events.onCellDblClick()
		this._events.onCellDblClick.call(this, e);
		//now focus.setFocusCell need isEditing info, so call it after that is set.
		//this.focus.setFocusCell(e.cell, e.rowIndex);
	},
	onRowClick: function(e){
		// summary:
		//		Overwritten, see dojox.grid._Events.onRowClick()
		this.edit.rowClick(e);
		if(!e.cell || (!e.cell.isRowSelector && (!this.rowSelectCell || !this.rowSelectCell.disabled(e.rowIndex)))){
			this.selection.clickSelectEvent(e);
		}
	},
	onRowContextMenu: function(e){
		// summary:
		//		Overwritten, see dojox.grid._Events.onRowContextMenu()
		if(!this.edit.isEditing() && this.menus){
			this.showMenu(e);
		}
	},
	onSelectedRegionContextMenu: function(e){
		// summary:
		//		New - Event fired when a selected region context menu is accessed via mouse right click.
		// e: Event
		//		Decorated event object which contains reference to grid and info of selected
		//		regions(selection type - row|column, selected index - [...])
		if(this.selectedRegionMenu){
			this.selectedRegionMenu._openMyself({
				target: e.target,
				coords: e.keyCode !== dojo.keys.F10 && "pageX" in e ? {
					x: e.pageX,
					y: e.pageY
				} : null
			});
			dojo.stopEvent(e);
		}
	},
	onHeaderCellMouseOut: function(e){
		// summary:
		//		Overwritten, see dojox.grid._Events.onHeaderCellMouseOut()
		if(e.cellNode){
			dojo.removeClass(e.cellNode, this.cellOverClass);
			dojo.removeClass(e.cellNode, this.headerCellActiveClass);
		}
	},
	onHeaderCellMouseDown: function(e){
		// summary:
		//		Overwritten, see dojox.grid._Events.onHeaderCellMouseDown()
		if(e.cellNode){//TBD - apply to selection region for nested sorting?
			dojo.addClass(e.cellNode, this.headerCellActiveClass);
		}
	},
	onHeaderCellMouseUp: function(e){
		// summary:
		//		New event
		if(e.cellNode){
			dojo.removeClass(e.cellNode, this.headerCellActiveClass);
		}
	},
	onHeaderCellClick: function(e){
		// summary:
		//		Overwritten, see dojox.grid._Events.onHeaderCellClick()
		//move focus to header.
		this.focus.currentArea("header");
		//invoke dojox.grid._Events.onHeaderCellClick()
		if(!e.cell.isRowSelector){
			this._events.onHeaderCellClick.call(this, e);
		}
		//move mouse events to the focus manager.
		this.focus.headerMouseEvent(e);
	},
	onRowSelectorMouseDown: function(e){
		this.focus.focusArea("rowHeader", e);
	},
	
	onRowSelectorMouseUp: function(e){},
	
	//triggered in _View, see Selector plugin
	onMouseUpRow: function(e){
		if(e.rowIndex != -1){
			this.onRowMouseUp(e);
		}
	},
	onRowMouseUp: function(e){}
});