dojo.provide("dojox.grid.enhanced.dnd._DndSelectingManager");

dojo.require("dojox.grid.util");
dojo.require("dojox.grid._Builder");
dojo.require("dojox.grid.enhanced.dnd._DndGrid");
dojo.require("dojox.grid.enhanced.dnd._DndBuilder");
dojo.require("dojox.grid.enhanced.dnd._DndRowSelector");
dojo.require("dojox.grid.enhanced.dnd._DndFocusManager");
dojo.declare("dojox.grid.enhanced.dnd._DndSelectingManager", null, {
	//summary:
	//		_DndSelectingManager is used to enable grid DND selecting feature
	//		
	
	// list, each item record whether the type is in selecting mode
	// type: row, cell, col
	typeSelectingMode: [],
	
	// list, each item record whether the type selecting is disabled
	// type: row, cell, col
	selectingDisabledTypes:[],
	
	// The start point of drag selection
	drugSelectionStart: null,
	
	// The point that fire drug select
	drugCurrentPoint : null,
	
	// Should be col, row or cell
	drugMode: null,
	
	// If user drag select with ctrl key down
	// selected cells should be kept state as selected
	keepState: false,
	
	extendSelect: false,
	
	// keep the dom nodes of header in a list
	headerNodes: null,
	
	// Record the selected cells
	selectedCells : null,
	
	// Record the columns selected
	selectedColumns : [],
	
	// Record the rows selected
    //selectedRows : [],
	
	selectedClass: "dojoxGridRowSelected",
	
	autoScrollRate: 1000,
	
	constructor: function(inGrid){
		// inGrid: dojox.Grid
		//		The dojox.Grid this editor should be attached to
		this.grid = inGrid;
		this.typeSelectingMode = [];
		this.selectingDisabledTypes = [];
		this.selectedColumns = [];
		
		// Init the dnd selection start point
		this.drugSelectionStart = new Object();
		this.drugCurrentPoint = new Object();
		this.resetStartPoint();
		
		this.extendGridForDnd(inGrid);
		
		this.selectedCells = [];
		
		dojo.connect(this.grid, "_onFetchComplete",dojo.hitch(this, "refreshColumnSelection"));
		dojo.connect(this.grid.scroller, "scroll",dojo.hitch(this, "refreshColumnSelection"));
		//dojo.connect(document, 'onmousedown', this.grid.focus, '_blurRowBar');
		
		dojo.subscribe(this.grid.rowSelectionChangedTopic, dojo.hitch(this,function(publisher){
			try{
				if(publisher.grid == this.grid && publisher != this){
					this.cleanCellSelection();
				}
			}catch(e){
				console.debug(e);
			}
		}));
	},
	
	extendGridForDnd: function(inGrid){
		//summary:
		//       Ectend the current class to enable the DND feature
		//		 inclucing:
		//				dojox.Grid
		//				dojox._FocusManager
		//				dojox.Selection
		//				dojox._Builder
		//				dojox._HeaderBuilder
		//				dojox._RowSelector
		//		 Change the funnelEvents of views, add mouseup and mouseover event
		
		//extend dojox.Grid
		var _ctr = inGrid.constructor;
		inGrid.mixin(inGrid, dojo.hitch(new dojox.grid.enhanced.dnd._DndGrid(this)));
		inGrid.constructor = _ctr;
		
		// workaround for mixin related issues
		//inGrid.constructor.prototype.startup = inGrid.startup;
		//inGrid.constructor.prototype.onStyleRow = inGrid.onStyleRow;
		
		//extend dojox._FocusManager
		inGrid.mixin(inGrid.focus, new dojox.grid.enhanced.dnd._DndFocusManager());
		
		// rewrite the clickSelect function of Selection
		inGrid.mixin(inGrid.selection, {clickSelect:function(){}});
		
		dojo.forEach(inGrid.views.views, function(view){
			//extend dojox._Builder
			inGrid.mixin(view.content, new dojox.grid.enhanced.dnd._DndBuilder());
			//extend dojox._HeaderBuilder
			inGrid.mixin(view.header, new dojox.grid.enhanced.dnd._DndHeaderBuilder());
			if(view.declaredClass =="dojox.grid._RowSelector"){
				//extend dojox._RowSelector
				inGrid.mixin(view, new dojox.grid.enhanced.dnd._DndRowSelector());
			}
			// Change the funnelEvents of views, add mouseup and mouseover event
			//dojox.grid.util.funnelEvents(view.contentNode, view, "doContentEvent", [ 'mouseup','mouseover', 'mouseout', 'click', 'dblclick', 'contextmenu', 'mousedown' ]);
			dojox.grid.util.funnelEvents(view.contentNode, view, "doContentEvent", [ 'mouseup']);
			//dojox.grid.util.funnelEvents(view.headerNode, view, "doHeaderEvent", [ 'dblclick','mouseup', 'mouseover', 'mouseout', 'mousemove', 'mousedown', 'click', 'contextmenu' ]);
			dojox.grid.util.funnelEvents(view.headerNode, view, "doHeaderEvent", ['mouseup']);

		});
		dojo.forEach(this.grid.dndDisabledTypes, function(type){
			this.disableSelecting(type);
		}, this);
		this.disableFeatures();
	},
	
	disableFeatures: function(){
		//summary:
		//		disable selecting features according to the configuration
		if(this.selectingDisabledTypes["cell"]){
			this.cellClick = function(){/*console.debug("_DndSelectingManager.cellClick is disabled");*/};
			this.drugSelectCell = function(){/*console.debug("_DndSelectingManager.drugSelectCell is disabled");*/};
		}
		if(this.selectingDisabledTypes["row"]){
			this.drugSelectRow = function(){/*console.debug("_DndSelectingManager.drugSelectRow is disabled");*/};
		}
		if(this.selectingDisabledTypes["col"]){
			this.selectColumn = function(){/*console.debug("_DndSelectingManager.selectColumn is disabled");*/};
			this.drugSelectColumn = function(){/*console.debug("_DndSelectingManager.drugSelectColumn is disabled");*/};
		}
	},
	
	disableSelecting: function(type){
		//summary:
		//		set selecting feature of 'type' disabled in the disabled feature list
		//type: Sting
		//		the feature that will be disabled, should be 'cell', 'row', or 'col'
		this.selectingDisabledTypes[type] = true;
	},
	
	isInSelectingMode: function(type){
		//summary:
		//		whether the selecting manager is in 'type' selecting mode
		//type: String
		//		the selecting mode type
		//return: Boolean
		//		whether the selecting manager is in 'type' selecting mode
		return !!this.typeSelectingMode[type];
	},
	
	setInSelectingMode: function(type, isEnable){
		//summary:
		//		set the selecting manager to 'type' selecting mode
		//type: String
		//		the selecting mode will be set, should be 'cell', 'row', or 'col'
		//isEnable: Boolean
		//		the 'type' selecting mode is 'isEnable'ed
		this.typeSelectingMode[type] = isEnable;
	},
	
	getSelectedRegionInfo: function(){
		//summary:
		//		Get the selected region info
		//return: Array
		//		Array of selected index, might be index of rows | columns | cells
		var selectedIdx = [], type = '';
		if(this.selectedColumns.length > 0){
			type = 'col';
			dojo.forEach(this.selectedColumns, function(item, index){
				!!item && selectedIdx.push(index);
			});
		}else if(this.grid.selection.getSelectedCount() > 0){
			type = 'row';
			selectedIdx = dojox.grid.Selection.prototype.getSelected.call(this.grid.selection);
		}
		return {'selectionType': type, 'selectedIdx': selectedIdx};
		//TODO for future cells
	},
	
	clearInSelectingMode: function(){
		//summary:
		//		clear all selecting mode
		this.typeSelectingMode = [];
	},
	
	getHeaderNodes: function(){
		//summary:
		//       Util function 
		//		 Get  the header nodes list of the grid
		// return:
		//		 the header nodes list of the grid 
		return this.headerNodes == null? dojo.query("[role*='columnheader']", this.grid.viewsHeaderNode) : this.headerNode;
	},

	_range: function(inFrom, inTo, func){
		//summary:
		// 		fire a function for each item in a range
		var s = (inFrom >= 0 ? inFrom : inTo), e = inTo;
		if(s > e){
			e = s;
			s = inTo;
		}
		for(var i=s; i<=e; i++){
			func(i);
		}
	},
	
	cellClick: function(inColIndex, inRowIndex){
		//summary:
		// 		handle the click event on cell, select the cell call this.addCellToSelection
		// inColIndex: Integer
		//		the Y position  of the cell that fired the click event
		// inRowIndex: Integer
		//		the Y position of the cell that fired the click event
		if(inColIndex > this.exceptColumnsTo){
			this.grid.selection.clear();
			this.publishRowChange();
			var cellNode = this.getCellNode(inColIndex, inRowIndex);
			this.cleanAll();
			this.addCellToSelection(cellNode);
		}
	},
	
	setDrugStartPoint: function(inColIndex, inRowIndex){
		//summary:
		//		set drug selecting start point
		//		also add mouse move and mouse up handler on the whole window to monitor whether the mouse move out of the grid when druging
		// inColIndex: Integer
		//			column index of the point
		//inRowIndex: Integer
		//			row index of the point
		this.drugSelectionStart.colIndex = inColIndex;
		this.drugSelectionStart.rowIndex = inRowIndex;
		this.drugCurrentPoint.colIndex = inColIndex;
		this.firstOut = true;
		
		// monitor mouse move
		// when move out the grid bottom, auto scroll the grid
		var moveHandler = dojo.connect(dojo.doc, "onmousemove", dojo.hitch(this, function(e){
			this.outRangeValue = e.clientY - dojo.coords(this.grid.domNode).y/*this.grid.domNode.offsetTop*/ - this.grid.domNode.offsetHeight;
			if(this.outRangeValue > 0){
				if(this.drugSelectionStart.colIndex == -1){
					if(!this.outRangeY){
						this.autoRowScrollDrug(e);
					}
				}else if(this.drugSelectionStart.rowIndex == -1){
					//...
				}else {
					this.autoCellScrollDrug(e);
				}
			}else {
				this.firstOut = true;
				this.outRangeY = false;
			}
		}));
		// monitor the mouse up event
		// when mouse up during drug selecting, stop the auto scroll and clean the handlers
		var upHandler = dojo.connect(dojo.doc, "onmouseup", dojo.hitch(this, function(e){
			this.outRangeY = false;
			dojo.disconnect(upHandler);
			dojo.disconnect(moveHandler);
			this.grid.onMouseUp(e);
		}));
		
	}, 
	
	autoRowScrollDrug: function(e){
		//summary:
		//		start auto scroll and select the next row
		this.outRangeY = true;
		this.autoSelectNextRow();
	},
	
	autoSelectNextRow: function(){
		//summary:
		//		auto scroll the grid to next row and select the row
		if(this.grid.select.outRangeY ){			
			this.grid.scrollToRow(this.grid.scroller.firstVisibleRow + 1);
			this.drugSelectRow(this.drugCurrentPoint.rowIndex + 1);
			setTimeout(dojo.hitch(this, 'autoSelectNextRow', this.drugCurrentPoint.rowIndex + 1), this.getAutoScrollRate());
		}
	},
	
	autoCellScrollDrug: function(e){
		//summary:
		// 		start auto scroll the grid to next row
		//		reset the selected column range when mouse move to another column
		var mouseOnCol = null;
		dojo.forEach(this.getHeaderNodes(), function(node){
			var coord = dojo.coords(node);
			if(e.clientX >= coord.x && e.clientX <=coord.x+coord.w){
				mouseOnCol = Number(node.attributes.getNamedItem("idx").value);
			}
		});
		if(mouseOnCol != this.drugCurrentPoint.colIndex || this.firstOut){
			if(!this.firstOut){
				this.colChanged = true;
				this.drugCurrentPoint.colIndex = mouseOnCol;
			}
			this.firstOut = false;
			this.outRangeY = true;
			dojo.hitch(this, "autoSelectCellInNextRow")();
		}
	},
	
	autoSelectCellInNextRow: function(){
		//summary:
		//		auto scroll the grid to next row and select the cells
		if(this.grid.select.outRangeY ){			
			this.grid.scrollToRow(this.grid.scroller.firstVisibleRow + 1);
			this.drugSelectCell(this.drugCurrentPoint.colIndex, this.drugCurrentPoint.rowIndex + 1);
			if(this.grid.select.colChanged){
				this.grid.select.colChanged = false;
			}else {
				setTimeout(dojo.hitch(this, 'autoSelectCellInNextRow', this.drugCurrentPoint.rowIndex + 1), this.getAutoScrollRate());
			}
		}
	},
	
	getAutoScrollRate: function(){
		//summary:
		//		get the auto scroll time rate
		//return: Integer:
		//		the auto scroll time rate
		return this.autoScrollRate;
	},
	
	
	resetStartPoint: function(){
		//summary:
		//		reset the DND selecting start point
		if(this.drugSelectionStart.colIndex == -1 && this.drugSelectionStart.rowIndex == -1){
			return;
		}
		this.lastDrugSelectionStart = dojo.clone(this.drugSelectionStart);
		this.drugSelectionStart.colIndex = -1;
		this.drugSelectionStart.rowIndex = -1;
	},
	
	restorLastDragPoint: function(){
		//summary:
		//		restore the DND selecting start point to last one
		this.drugSelectionStart = dojo.clone(this.lastDrugSelectionStart);
	},
	
	drugSelectCell : function(inColumnIndex, inRowIndex){
		//summary:
		// Handle the Dnd selecting cell operation
		// use this.grid.drugSelectionStart as the start point
		// inRowIndex:
		//		The end point Y position of the Dnd operation
		// inColumnIndex:
		//		The end point X position of the Dnd operation
		
		
		// clear the pre selected cells
		this.cleanAll();
		
		this.drugCurrentPoint.columnIndex = inColumnIndex;
		this.drugCurrentPoint.rowIndex = inRowIndex;
		
		var fromRow, toRow, fromCol, toCol;
		
		// Use Min(inRowIndex, this.drugSelectionStart.rowIndex) as the Y value of top left point
		//	   Max(inRowIndex, this.drugSelectionStart.rowIndex) as the Y value bottum right point
		if(inRowIndex < this.drugSelectionStart.rowIndex){
			fromRow = inRowIndex;
			toRow = this.drugSelectionStart.rowIndex;
		}else {
			fromRow = this.drugSelectionStart.rowIndex;
			toRow = inRowIndex;
		}
		
		// Use Min(inColumnIndex, this.drugSelectionStart.colIndex) as the X value of top left point
		//	   Max(inColumnIndex, this.drugSelectionStart.colIndex) as the X value bottum right point
		if(inColumnIndex < this.drugSelectionStart.colIndex){
			fromCol = inColumnIndex;
			toCol = this.drugSelectionStart.colIndex;
		}else {
			fromCol = this.drugSelectionStart.colIndex;
			toCol = inColumnIndex;
		}
		for(var i = fromCol; i <= toCol; i++){
			this.addColumnRangeToSelection(i, fromRow, toRow);
		}
		
	},
	
	selectColumn : function (columnIndex){
		//summary:
		// 		Handle the header cell click event
		// columnIndex:
		//		the colIndex of the header cell that fired the click event
		this.addColumnToSelection(columnIndex);
		
	},
	
	drugSelectColumn : function(currentColumnIndex){
		//summary:		
		// 		Handle Dnd select operation
		// currentColumnIndex:
		// 		the colIndex of the col that fired mouseover event
		this.selectColumnRange(this.drugSelectionStart.colIndex, currentColumnIndex);
	}, 
	
	drugSelectColumnToMax: function(dir){
		//summary:
		//		select the column to the last one in the direction 'dir'
		//dir: String
		//		the direction to extend column selection
		if(dir == "left"){
			this.selectColumnRange(this.drugSelectionStart.colIndex, 0);
		}else {
			this.selectColumnRange(this.drugSelectionStart.colIndex, this.getHeaderNodes().length -1);
		}
	},
	
	selectColumnRange : function(startIndex, endIndex){
		//summary:
		// 		select a range of columns
		// startIndex:
		//		the start col index of the range
		// endIndex:
		//		the end col index of the range
		if(!this.keepState)
			this.cleanAll();
		this._range(startIndex, endIndex, dojo.hitch(this, "addColumnToSelection"));
		//this.clearDrugDivs();
		//this.setSelectedColDivs();
	},
		
	addColumnToSelection : function (columnIndex){
		//summary:
		// 		add all the cells in a column to selection
		// columnIndex:
		//		the index of the col
		this.selectedColumns[columnIndex] = true;
		dojo.toggleClass(this.getHeaderNodes()[columnIndex], "dojoxGridHeaderSelected", true);
		//this.addColumnRangeToSelection(columnIndex, -1, Number.POSITIVE_INFINITY);
		this._rangCellsInColumn(columnIndex, -1, Number.POSITIVE_INFINITY, this.addCellToSelection);
		//this.setSelectedDiv();
	},
	
	addColumnRangeToSelection : function (columnIndex, from, to){
		//summary:
		// Add a range of cells in the specified column to selection
		// columnIndex:
		//		the Column Index
		// from:
		//		the top cell of the range
		// to:
		//		the bottom cell of the range
		
		var viewManager = this.grid.views;
		var columnCellNodes = [];
		var dndManager = this;
		
		// As there's no reference of domNode for cell, get it manully
		dojo.forEach(viewManager.views, function(view){
			dojo.forEach(this.getViewRowNodes(view.rowNodes), function(rowNode, rowIndex){
				if(!rowNode){ return; /* row not loaded */}
				if(rowIndex >= from && rowIndex <= to){
					dojo.forEach(rowNode.firstChild.rows[0].cells, function(cell){
						
						// get the cells of the row in the view by 
						// rowNode.firstChild.rows[0].cells
						// rowNode is the Div which is the domNode for a row, the firstChild is a table, and each row should have only one
						// row in the table, so get rows[0] should be ok.
						
						if(cell && cell.attributes && (idx = cell.attributes.getNamedItem("idx")) && Number(idx.value) == columnIndex ){
							dndManager.addCellToSelection(cell);
						}
					});
				}
			}, this);
		}, this);		
	},
	
	_rangCellsInColumn : function (columnIndex, from, to, func){
		//summary:
		// 		Add a range of cells in the specified column to selection
		// 		columnIndex:
		//		the Column Index
		// from:
		//		the top cell of the range
		// to:
		//		the bottom cell of the range
		
		var viewManager = this.grid.views;
		var columnCellNodes = [];
		var dndManager = this;
		
		// As there's no reference of domNode for cell, get it manully
		dojo.forEach(viewManager.views, function(view){
			dojo.forEach(this.getViewRowNodes(view.rowNodes), function(rowNode, rowIndex){
				if(!rowNode){return;/* row not loaded */}
				if(rowIndex >= from && rowIndex <= to){
					dojo.forEach(rowNode.firstChild.rows[0].cells, function(cell){
						// get the cells of the row in the view by 
						// rowNode.firstChild.rows[0].cells
						// rowNode is the Div which is the domNode for a row, the firstChild is a table, and each row should have only one
						// row in the table, so get rows[0] should be ok.
						if(cell && cell.attributes && (idx = cell.attributes.getNamedItem("idx")) && Number(idx.value) == columnIndex ){
							func(cell, dndManager);
						}
					});
				}
			}, this);
		}, this);		
	},
	
	drugSelectRow : function(inRowIndex){
		//summary:
		// 		Handle dnd select rows
		// 		call the dojox.grid.Selection to perform the operation
		// inRowIndex:
		//		the index of the row that fired mouseover event
		
		this.drugCurrentPoint.rowIndex = inRowIndex;
		
		this.cleanCellSelection();
		this.clearDrugDivs();
	
		var selection = this.grid.selection;
		selection._beginUpdate();
		if(!this.keepState)
			selection.deselectAll();
		
		selection.selectRange(this.drugSelectionStart.rowIndex, inRowIndex);
		selection._endUpdate();
		
		this.publishRowChange();
	},
	
	drugSelectRowToMax: function(dir){
		//summary:
		//		select the row to the last one in the direction 'dir'
		//dir: String
		//		the direction to extend row selection		
		if(dir == "up"){
			this.drugSelectRow(0);
		}else {
			this.drugSelectRow(this.grid.rowCount);
		}
	},

	getCellNode: function(inCellIndex, inRowIndex){
		//summary:
		//		As there's no reference of domNode for cell, get it manully
		//inCellIndex: Integer
		//		Offset of the cell in the row, stands for the X index of the cell in the grid
		//inRowIndex : Integer
		//		Offset of the row in the grid, stands forthe Y index of the cell in the grid
		//Description: Integer
		//		Get the DOM node for the cell in a give position
		//Return: Object
		//		DOM node reference of the cell
		var rowNodes = [], cellNode = null;
		var viewManager = this.grid.views;
		for(var i=0, v, n; (v=viewManager.views[i])&&(n=v.getRowNode(inRowIndex)); i++){
			rowNodes.push(n);
		}
		dojo.forEach(rowNodes, dojo.hitch(function(rowNode, viewIndex){
			if(cellNode){ return;/* get the cell from the previous view */}
			var cells = dojo.query("[idx='" + inCellIndex + "']",rowNode);
			if(cells && cells[0]){
				cellNode = cells[0];
			}
		}));
		return cellNode;
	},
	
	addCellToSelection : function(cellNode, dndManager){
		//summary:
		//	 	add a cell to selection list and change it into selected state
		//cellNode: Object
		//		the cell node will be added to select
		//dndManager: _DndSelectionManager
		//		reference to the instance of _DndSelectionManager
		if(!dndManager){
			dndManager = this;
		}
		dndManager.selectedCells[dndManager.selectedCells.length] = cellNode;
		dojo.toggleClass(cellNode, dndManager.selectedClass, true);
	},
	
	isColSelected: function(inColIndex){
		//summary:
		//		wether the column in of index value "inColIndex" is selected
		//inColIndex: Integer
		//		the index value of the column
		//return: Boolean
		//		wether the column in of index value "inColIndex" is selected
		return this.selectedColumns[inColIndex];
	},
	
	isRowSelected: function(inRowIndex){
		//summary:
		//		wether the row in of index value "inRowIndex" is selected
		//inRowIndex: Integer
		//		the index value of the row
		//return: Boolean
		//		wether the row in of index value "inRowIndex" is selected
		return this.grid.selection.selected[inRowIndex];
	},
	
	isContinuousSelection: function(selected){
		//summary:
		//		Whether a selection is continuous
		//selected: Array
		//		the selection states for columns or rows
		//return: Boolean 
		var preSelectedIdx = -1;
		for(var i = 0; i < selected.length; i++){
			if(!selected[i]){ continue; }
			if(preSelectedIdx < 0 || i - preSelectedIdx == 1 ){ preSelectedIdx = i; }
			else if(i - preSelectedIdx >= 2 ){ return false; }
		}
		return preSelectedIdx >= 0 ? true : false;
	},
	
	cleanCellSelection : function(){
		//summary:
		//		change all the selected cell to unselected and umpty the selected-cell list
		dojo.forEach(this.selectedCells, dojo.hitch(this, "removeCellSelectedState"));
		this.selectedCells = [];
		dojo.forEach(this.selectedColumns, function(selected, index){
			if(selected){
				dojo.toggleClass(this.getHeaderNodes()[index], "dojoxGridHeaderSelected", false);
			}
		}, this);
		
		this.selectedColumns = [];
		this.grid.edit.isEditing() && this.grid.edit.apply();
	},
	
	removeCellSelectedState : function(cell){
		//summary:
		//		change the cell style to un-selected
		//cell:
		//		the cell dom-node the style to be changed
		dojo.toggleClass(cell, this.selectedClass, false);
	}, 
	
	cleanAll : function(){
		//summary:
		//Clear all the selected cells, columns and rows
		// row selection is reused from dojox.grid._Selection, 
		// so clear it by call the clear function of dojox.grid._Selection
		
		// clear cell and column selection effect 
		this.cleanCellSelection();
		// clear row selection effect
		this.grid.selection.clear();
		// clear Column/Row 
		//this.selectedColumns = [];
		//this.selectedRows = [];
		this.publishRowChange();
	},
	
	refreshColumnSelection: function(){
		//summary:
		//		handle grid scroll, keep column selected state
		dojo.forEach(this.selectedColumns, dojo.hitch(this, function(selectedColumn, colIndex){
			if(selectedColumn){
				this.grid.select.addColumnToSelection(colIndex);
			}
		}));
	},
	
	inSelectedArea: function(inColIndex, inRowIndex){
		//summary:
		//		whether the specified point is in selected area
		//inColIndex: Integer
		//		the col index of the point
		//inRowIndex: Integer
		//		the row index of the point
		//return: Boolean
		//		whether the specified point is in selected area
		return this.selectedColumns[inColIndex] || this.gird.selection.selecteded[inRowIndex];
	},
	
	publishRowChange: function(){
		//summary:
		//		publish a topic to notify that row selection changed
		dojo.publish(this.grid.rowSelectionChangedTopic, [this]);
	}, 
	
	getViewRowNodes: function(viewRowNodes){
		//summary:
		//		Get view row nodes in array form
		var rowNodes = [];
		for(i in viewRowNodes){
			rowNodes.push(viewRowNodes[i]);
		}
		return rowNodes;
	},
	
	getFirstSelected: function(){
		//summary:
		//		Get the first selected row index
		//return: Integer
		//		First selected row index
		return dojo.hitch(this.grid.selection, dojox.grid.Selection.prototype.getFirstSelected)();
	},
	
	getLastSelected: function(){
		//summary:
		//		Get the last selected row index
		//return: Integer
		//		Last selected row index
		var selected = this.grid.selection.selected;
		for(var i = selected.length - 1; i >= 0; i--){
			if(selected[i]){ return i; }
		}
		return -1;
	}
});
