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

	//headerCellActiveClass: String
	// 		css class to apply to grid header cells when activated(mouse down)
	headerCellActiveClass: 'dojoxGridHeaderActive',
	
	//cellActiveClass: String
	// 		css class to apply to grid content cells when activated(mouse down)
	cellActiveClass: 'dojoxGridCellActive',
	
	//rowActiveClass: String
	// 		css class to apply to grid rows when activated(mouse down)
	rowActiveClass: 'dojoxGridRowActive',		

	//selectRegionHoverClass: String
	// 		css class to apply to select regions in header cells when mouse over
	selectRegionHoverClass: 'dojoxGridSelectRegionHover',	

	constructor: function(inGrid){
		//get the default Grid events
		this._events = new dojox.grid._Events();
		//for methods that won't be overwritten, copy them to "this" scope
		for(p in this._events){
			if(!this[p]){
				this.p = this._events.p;
			}
		}
		//mixin "this" to Grid
		inGrid.mixin(inGrid, this);
	},
	
	onStyleRow: function(inRow){
		// summary:
		//		Overwritten, see dojox.grid._Events.onStyleRow()
		var i = inRow;
		i.customClasses += (i.odd?" dojoxGridRowOdd":"") + (i.selected?" dojoxGridRowSelected":"") + (i.over/*&&!this.isDndSelectEnable*/?" dojoxGridRowOver":"");
		this.focus.styleRow(inRow);
		this.edit.styleRow(inRow);
	},
	
	dokeyup: function(e) {
		// summary:
		// 		Grid key up event handler.
		// e: Event
		//		Un-decorated event object
		this.indirectSelection && !this.pluginMgr.inSingleSelection() && this.indirectSelector.dokeyup(e);
	},
	
	onKeyDown: function(e){
		// summary:
		// 		Overwritten, see dojox.grid._Events.onKeyDown()
		if(e.altKey || e.metaKey){ return; }
		
		if (e.ctrlKey && !e.shiftKey){
			dojo.publish("CTRL_KEY_DOWN", [this, e]);
		}
		var executed = false;
		
		if(this.isDndSelectEnable && !e.ctrlKey){
			this.select.keepState = false;
		}
		if(this.isDndSelectEnable && !e.shiftKey){
			this.select.extendSelect = false;
		}
		var dk = dojo.keys;
		switch(e.keyCode){
			case dk.ENTER:
				executed = true;
				if(!this.edit.isEditing()){
					var colIdx = this.focus.getHeaderIndex();
					if(colIdx >= 0){
						this.nestedSorting && this.focus.focusView.header.decorateEvent(e);
						var isRowSelector = e.cell && this.pluginMgr.isFixedCell(e.cell);
						!e.selectChoice && !isRowSelector && this.setSortIndex(colIdx, null, e);
						break;
					}else{
						!this.indirectSelection && this.selection.clickSelect(this.focus.rowIndex, dojo.isCopyKey(e), e.shiftKey);
					}
					dojo.stopEvent(e);
				}
				if(!e.shiftKey){
					var isEditing = this.edit.isEditing();
					this.edit.apply();
					if(!isEditing && !this.pluginMgr.isFixedCell(this.focus.cell)){
						this.edit.setEditCell(this.focus.cell, this.focus.rowIndex);
					}
				}
				if (!this.edit.isEditing()){
					var curView = this.focus.focusView || this.views.views[0];  //if no focusView than only one view
					curView.content.decorateEvent(e);
					this.onRowClick(e);
				}
				break;
			case dk.SPACE:
				executed = true;
				if(!this.edit.isEditing()){
					var colIdx = this.focus.getHeaderIndex();
					if(colIdx >= 0) {
						//this.nestedSorting && this.focus.focusView.header.decorateEvent(e);
						this.focus.focusView.header.decorateEvent(e);
						if(this.indirectSelection && e.cell && e.cell.isRowSelector){
							return;
						}
						if (this.isDndSelectEnable && (!this.nestedSorting && !this.canSort() || this.nestedSorting && e.selectChoice)){
							this.inDNDKeySelectingColumnMode = true;
							
							this.select.keepState = e.ctrlKey;
							this.select.extendSelect = e.shiftKey;
							if (!this.select.extendSelect) {
								this.select.drugSelectionStart.colIndex = colIdx;
							}
							this.select.drugSelectColumn(colIdx);
						} else {
							//this.nestedSorting && this.focus.focusView.header.decorateEvent(e);
							var isRowSelector = e.cell && this.pluginMgr.isFixedCell(e.cell);
							!isRowSelector && e.rowIndex == -1 && e.cell && this.setSortIndex(colIdx, null, e);
						}
						break;
					}else if(this.isDndSelectEnable && this.focus.isRowBar()){
						this.inDNDKeySelectingRowMode = true;
						this.select.keepState = e.ctrlKey;
						this.select.extendSelect = e.shiftKey;
						if(!this.select.extendSelect || this.pluginMgr.inSingleSelection()){
							this.select.drugSelectionStart.rowIndex = this.focus.getFocusedRowIndex();
						} 
						this.select.drugSelectRow(this.focus.getFocusedRowIndex());
					}else {
						!this.indirectSelection && this.selection.clickSelect(this.focus.rowIndex, dojo.isCopyKey(e), e.shiftKey);
					}
					dojo.stopEvent(e);
				}
				break;
			case dk.LEFT_ARROW:
			case dk.RIGHT_ARROW:
				executed = true;
				this.nestedSorting && this.focus.focusView.header.decorateEvent(e);
				var needDndSelect = this.isDndSelectEnable && e.shiftKey;
				var isRowSelector = e.cell && this.pluginMgr.isFixedCell(e.cell);
				if(this.nestedSorting && this.focus.isNavHeader() && !needDndSelect && !isRowSelector){
					//dojo.stopEvent(e);
					this.focus.navHeader(e);
					return;
				}
				if(!this.edit.isEditing()){
					var keyCode = e.keyCode;  // IE seems to lose after stopEvent when modifier keys
					dojo.stopEvent(e);
					var origColIdx = this.focus.getHeaderIndex();
					if (origColIdx >= 0 && (e.shiftKey && e.ctrlKey)){
						this.focus.colSizeAdjust(e, origColIdx, (keyCode == dk.LEFT_ARROW ? -1 : 1)*5);
						return;
					}
					var offset = (keyCode == dk.LEFT_ARROW) ? 1 : -1;
					if(dojo._isBodyLtr()){ offset *= -1; }
					//var origColSelected = this.select.isColSelected(origColIdx);
					if(this.nestedSorting && this.focus.isNavHeader() && (needDndSelect || isRowSelector)){
						this.focus.navHeaderNode(offset, true);
					}else if(!(this.isDndSelectEnable && this.focus.isRowBar())){ //fix DnD, if is DnDSelectEnable, and foucus on RowBar, invaild the left & right key
						this.focus.move(0, offset);
					}
					//if(this.isDndSelectEnable && e.shiftKey) {
					if(needDndSelect) {
						var colIdx = this.focus.getHeaderIndex();
						if(!this.select.isColSelected(origColIdx)){
							this.inDNDKeySelectingColumnMode = true;
							this.select.drugSelectionStart.colIndex = origColIdx;
						} else if(this.select.drugSelectionStart.colIndex == -1){
							this.select.restorLastDragPoint();
						}
						if(e.ctrlKey){
							this.select.drugSelectColumnToMax(e.keyCode==dk.LEFT_ARROW?"left":"right");
						} else {
							this.select.drugSelectColumn(colIdx);
						}
					}
				}
				break;
			case dk.UP_ARROW:
			case dk.DOWN_ARROW:
				executed = true;
				if(this.nestedSorting && this.focus.isNavHeader()){
					return;
				}
				var delta = e.keyCode == dk.UP_ARROW ? -1 : 1;
			    if(this.isDndSelectEnable){
					var origRowIdx = this.focus.getFocusedRowIndex();
				}
				if(this.isDndSelectEnable && this.focus.isRowBar()){
					this.focus[e.keyCode == dk.UP_ARROW ? 'focusPrevRowBar' : 'focusNextRowBar']();
					dojo.stopEvent(e);
				}else if(!this.edit.isEditing() && this.store && 0 <= (this.focus.rowIndex + delta) && (this.focus.rowIndex + delta) < this.rowCount){
					dojo.stopEvent(e);
					this.focus.move(delta, 0);
					this.indirectSelection && this.focus.cell && this.focus.cell.focus(this.focus.rowIndex);			
					!this.indirectSelection && this.selection.clickSelect(this.focus.rowIndex, dojo.isCopyKey(e), e.shiftKey);
				}
				if(this.isDndSelectEnable && this.focus.isRowBar() && e.shiftKey && !this.pluginMgr.inSingleSelection()) {
					if(!this.select.isRowSelected(origRowIdx)){
						this.inDNDKeySelectingRowMode = true;
						this.select.drugSelectionStart.rowIndex = origRowIdx;
					} else if(this.select.drugSelectionStart.rowIndex == -1) {
						this.select.restorLastDragPoint();
					}
					if (e.ctrlKey) {
						this.select.drugSelectRowToMax(e.keyCode == dk.UP_ARROW ? "up" : "down");
					} else {
						var rowIdy = this.focus.getFocusedRowIndex();
						this.select.drugSelectRow(rowIdy);
					}
				} else if(this.indirectSelection && e.shiftKey && !this.pluginMgr.inSingleSelection() && this.focus.rowIndex >= 0) {
					this.focus.focusView.content.decorateEvent(e);
					if(e.cellIndex != 0 || e.rowIndex == 0 && delta == -1){
						return;
					}
					this.indirectSelector.swipeSelectionByKey(e, delta);
				}
				break;
			case dk.ESCAPE:
				try{
					this.select.cancelDND();
				} catch(e) {
					console.debug(e);
				}
				break;
		}
		//invoke dojox.grid._Events.onKeyDown()
		!executed && (dojo.hitch(this, this._events.onKeyDown)(e));
	},

	onMouseDown: function(e){
		// summary:
		//		Overwritten, see dojox.grid._Events.onMouseDown()
				
		//invoke dojox.grid._Events.onMouseDown()
		dojo.hitch(this, this._events.onMouseDown)(e);
		if(this.isDndSelectEnable && !e.shiftKey){			
			this.select.setDrugStartPoint(e.cellIndex, e.rowIndex);
		}
	},
	
	onMouseUp: function(e){
		// summary:
		//		New - Event fired when mouse is up inside grid.
		// e: Event
		//		Decorated event object that contains reference to grid, cell, and rowIndex
		e.rowIndex == -1 ? this.onHeaderCellMouseUp(e) : this.onCellMouseUp(e);
	},
	
	onMouseOutRow: function(e){
		// summary:
		//		Overwritten, see dojox.grid._Events.onMouseOutRow()
		if (this.isDndSelectEnable) {
			//waiting ...
			return;
		}
		//invoke dojox.grid._Events.onMouseOutRow()
		dojo.hitch(this, this._events.onMouseOutRow)(e);
	},
	
	onMouseDownRow: function(e){
		// summary:
		//		Overwritten, see dojox.grid._Events.onMouseDownRow()
		if (this.isDndSelectEnable) {
			//waiting ...
			return;
		}
		//invoke dojox.grid._Events.onMouseDownRow()
		dojo.hitch(this, this._events.onMouseDownRow)(e);
	},

	onCellMouseOver: function(e){
		// summary:
		//		Overwritten, see dojox.grid._Events.onCellMouseOver()
		
		//invoke dojox.grid._Events.onCellMouseOver()
		dojo.hitch(this, this._events.onCellMouseOver)(e);
		var inIndirectSelectionMode = this.pluginMgr.isFixedCell(e.cell) || this.rowSelectCell && this.rowSelectCell.inIndirectSelectionMode();
		if(this.isDndSelectEnable && !inIndirectSelectionMode){
			if(this.select.isInSelectingMode("col")){
				this.select.drugSelectColumn(e.cell.index);
			}else if(this.select.isInSelectingMode("cell")){
				this.select.drugSelectCell(e.cellIndex, e.rowIndex);
			}else{
				this.select.setDrugCoverDivs(e.cellIndex, e.rowIndex);
			}
		}
	},
	
	onCellMouseOut: function(e){
		// summary:
		//		Overwritten, see dojox.grid._Events.onCellMouseOut()
		
		//invoke dojox.grid._Events.onCellMouseOut()
		dojo.hitch(this, this._events.onCellMouseOut)(e);	
		this.doubleAffordance && e.cellNode && dojo.removeClass(e.cellNode, this.cellActiveClass);
	},
	
	onCellMouseDown: function(e){
		// summary:
		//		Overwritten, see dojox.grid._Events.onCellMouseDown()
		dojo.addClass(e.cellNode, this.cellActiveClass);
		dojo.addClass(e.rowNode, this.rowActiveClass);
		if(this.isDndSelectEnable){
			this.focus._blurRowBar();
			if(e.cellIndex > this.select.exceptColumnsTo){
				this.select.setInSelectingMode("cell", true);
			}
		}
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
		if(this.isDndSelectEnable){
			this.focus._blurRowBar();	//fix DnD blur
			this._click[0] = this._click[1];
			this._click[1] = e;
			this.select.cellClick(e.cellIndex, e.rowIndex);
			!this.edit.isEditCell(e.rowIndex, e.cellIndex) && !this.edit.isEditing() && this.select.cleanAll();
			this.focus.setFocusCell(e.cell, e.rowIndex);
		}else{
			//invoke dojox.grid._Events.onCellClick()
			dojo.hitch(this, this._events.onCellClick)(e);
		} 
	},

	onCellDblClick: function(e){
		// summary:
		//		Overwritten, see dojox.grid._Events.onCellDblClick()
		if(this.pluginMgr.isFixedCell(e.cell)){ return; }
		this._click.length > 1 && (!this._click[0] || !this._click[1]) && (this._click[0] = this._click[1] = e);
		//invoke dojox.grid._Events.onCellDblClick()
		dojo.hitch(this, this._events.onCellDblClick)(e);
	},

	onRowClick: function(e){
		// summary:
		//		Overwritten, see dojox.grid._Events.onRowClick()
		this.edit.rowClick(e);
		!this.indirectSelection && this.selection.clickSelectEvent(e);
	},

	onRowMouseOver: function(e){
		// summary:
		//		Overwritten, see dojox.grid._Events.onRowMouseOver()
		if(this.isDndSelectEnable && !this.pluginMgr.inSingleSelection()){
			if(this.select.isInSelectingMode("row")){
				this.select.drugSelectRow(e.rowIndex);
			}else{
				//this.select.setDrugCoverDivs(e.cellIndex, e.rowIndex);
			}
		}
		//indirect selection
		if(!e.cell && e.cellIndex < 0/*row selector view*/ || e.cell && (e.cell != this.rowSelectCell) && this.indirectSelection){
			var _rowSelectCell = this.rowSelectCell;
			_rowSelectCell && _rowSelectCell.onRowMouseOver && _rowSelectCell.onRowMouseOver(e);			
		}
	},

	onRowMouseOut: function(e){
		// summary:
		//		Overwritten, see dojox.grid._Events.onRowMouseOut()
		if(this.isDndSelectEnable){
			if(this.select.isInSelectingMode("row")){
				this.select.drugSelectRow(e.rowIndex);
			}
		}
	},

	onRowContextMenu: function(e){
		// summary:
		//		Overwritten, see dojox.grid._Events.onRowContextMenu()
		!this.edit.isEditing() && this.menus && this.showRowCellMenu(e);
		//dojo.stopEvent(e);
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
				coords: "pageX" in e ? {
					x: e.pageX,
					y: e.pageY
				} : null
			});
			dojo.stopEvent(e);
		}
	},

	onHeaderCellMouseOver: function(e){
		// summary:
		//		Overwritten, see dojox.grid._Events.onHeaderCellMouseOver()
		if(e.cellNode){
			dojo.addClass(e.cellNode, this.cellOverClass);
			if(this.nestedSorting && !this._inResize(e.sourceView) && !this.pluginMgr.isFixedCell(e.cell) && !(this.isDndSelectEnable && this.select.isInSelectingMode("col"))){
				this.addHoverSortTip(e);
			}			
			if(this.isDndSelectEnable){
				if(this.select.isInSelectingMode("col")){
					this.select.drugSelectColumn(e.cell.index);
				}else{
					this.select.clearDrugDivs();
				}
			}
		}
	},

	onHeaderCellMouseOut: function(e){
		// summary:
		//		Overwritten, see dojox.grid._Events.onHeaderCellMouseOut()
		if(e.cellNode){
			dojo.removeClass(e.cellNode, this.cellOverClass);
			dojo.removeClass(e.cellNode, this.headerCellActiveClass);
			if(this.nestedSorting && !this.pluginMgr.isFixedCell(e.cell)){
				if(this.focus.headerCellInFocus(e.cellIndex)){
					this._toggleHighlight(e.sourceView, e, true);
				}else{
					this.removeHoverSortTip(e);					
				}
			}
		}
	},
	
	onHeaderCellMouseDown: function(e){
		// summary:
		//		Overwritten, see dojox.grid._Events.onHeaderCellMouseDown()
		var node = !this.nestedSorting ? e.cellNode : this._getChoiceRegion(e.cellNode, e/*also contains choice info*/);
		node && dojo.addClass(node, this.headerCellActiveClass);
		if(this.nestedSorting && !e.selectChoice){ return; }
		if(this.isDndSelectEnable){
			this.focus._blurRowBar(); //fix DnD blur
			try{
				this.focus.focusHeaderNode(e.cellIndex, false, true);
			}catch(e){
				console.debug("Error fired in dojox.grid._event.js onHeaderCellMouseDown():" + e);
			}
			if(e.button == 2){
				return;//always return for oncontextmenu event to only show menu
			}
			if(e.cellNode){
				this.select.setInSelectingMode("col", true);
				this.select.keepState = e.ctrlKey;
				this.select.extendSelect = e.shiftKey;
				if(this.select.extendSelect){
					this.select.restorLastDragPoint();
				} else {
					this.select.drugSelectionStart.colIndex = e.cellIndex;
				}
				this.select.drugSelectColumn(e.cellIndex);
			}
		}
	},
	
	onHeaderCellMouseUp: function(e){
		// summary:
		//		Overwritten, see dojox.grid._Events.onHeaderCellMouseUp()
		var node = !this.nestedSorting ? e.cellNode : this._getChoiceRegion(e.cellNode, e/*also contains choice info*/);
		if(node){
			dojo.removeClass(node, this.headerCellActiveClass);
			e.selectChoice && dojo.addClass(node, this.selectRegionHoverClass);
		}
	},

	onHeaderCellClick: function(e){
		// summary:
		//		Overwritten, see dojox.grid._Events.onHeaderCellClick()
		if(this.nestedSorting){
			if((e.unarySortChoice || e.nestedSortChoice) && !this._inResize(e.sourceView)){
				this.setSortIndex(e.cell.index, null, e);//nested sorting
			}
		}else if(!(this.indirectSelection && e.cell && e.cell.isRowSelector)){
			this.setSortIndex(e.cell.index);//single sorting
		}
		//invoke dojox.grid._Events.onHeaderClick()
		dojo.hitch(this, this._events.onHeaderClick)(e);
	},
	
	onHeaderContextMenu: function(e){
		// summary:
		//		Overwritten, see dojox.grid._Events.onHeaderContextMenu()
		if(this.nestedSorting && this.headerMenu){
			this._toggleHighlight(e.sourceView, e, true);
		}
		//invoke dojox.grid._Events.onHeaderContextMenu()		
		dojo.hitch(this, this._events.onHeaderContextMenu)(e);
	}
});
