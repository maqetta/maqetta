dojo.provide("dojox.grid.enhanced._Plugin");

dojo.require("dojox.grid.enhanced._Builder");
dojo.require("dojox.grid.enhanced._Events");

dojo.declare("dojox.grid.enhanced._Plugin", null, {
	//	summary:
	//		Singleton plugin manager 
	//
	//	description:
	//		Plugin manager is responsible for 
	//		1. Loading required plugins
	//		2. Handling collaboration and dependencies among plugins
	//		3. Overwriting some default behavior of DataGrid
	//		
	//		Note: Mixin and method caching are used for #3, this might be refined once 
	//		an overall plugin architecture is set up for DataGrid.
	//
	//      Some plugin dependencies:
    //	   	- DnD plugin depends on NestedSorting plugin
	//		- RowSelector should be used for DnD plugin. 
	//		  e.g. <div dojoType="dojox.grid.EnhancedGrid"  plugins='{dnd: true, ...}}' rowSelector="20px" .../>
	//		- "columnReordering" attribute won't work when either DnD or Indirect Selections plugin is on.
		
	//fixedCellNum: Integer
	//		Number of fixed cells(columns), e.g. cell(column) of indirect selection is fixed and can't be moved	
	fixedCellNum: -1,
	
	//funcMap: Object
	//		Map for caching default DataGrid methods.
	funcMap:{},

	constructor: function(inGrid){
		this.grid = inGrid;
		this._parseProps(this.grid);
	},
	
	_parseProps: function(grid){
		// summary:
		//		Parse plugins properties
		// grid: Grid
		//		Grid this plugin manager belongs to
		
		//mixin all plugin properties into Grid
		grid.plugins && dojo.mixin(grid, grid.plugins);
		
		//cell(column) of indirect selection
		grid.rowSelectCell = null;
		
		//DnD plugin depends on NestedSorting plugin
		grid.dnd && (grid.nestedSorting = true);
		
		//"columnReordering" attribute won't work when either DnD or Indirect Selections plugin is used.
		(grid.dnd || grid.indirectSelection) && (grid.columnReordering = false);
	},
	
	preInit: function(){
		// summary:
		//		Pre initialization, some plugins must be loaded before DataGrid.postCreate(). 
		//		See EnhancedGrid.postCreate()
		var grid = this.grid;
		//load Indirect Selection plugin
		grid.indirectSelection && (new (this.getPluginClazz('dojox.grid.enhanced.plugins.IndirectSelection'))(grid));
		if(grid.dnd && (!grid.rowSelector || grid.rowSelector=="false")) {
			//RowSelector should be used for DnD plugin.
			grid.rowSelector = "20px";
		}
		//overwrite header and content builders
		if(grid.nestedSorting){
			dojox.grid._View.prototype._headerBuilderClass = dojox.grid.enhanced._HeaderBuilder;			
		}
		dojox.grid._View.prototype._contentBuilderClass = dojox.grid.enhanced._ContentBuilder;
	},
	
	postInit: function(){
		// summary:
		//		Post initialization, by default, plugins are loaded after DataGrid.postCreate(). 
		//		See EnhancedGrid.postCreate()
		var grid = this.grid;
		
		//overwrite some default events of DataGrid
		new dojox.grid.enhanced._Events(grid);
		
		//load Menu plugin
		grid.menus && (new (this.getPluginClazz('dojox.grid.enhanced.plugins.Menu'))(grid));
		
		//load NestedSorting plugin
		grid.nestedSorting && (new (this.getPluginClazz('dojox.grid.enhanced.plugins.NestedSorting'))(grid));
		
		//load DnD plugin
		if(grid.dnd){
			grid.isDndSelectEnable = grid.dnd;
			//by default disable cell selection for EnhancedGrid M1
			grid.dndDisabledTypes =  ["cell"];
			//new dojox.grid.enhanced.dnd._DndMovingManager(grid);			
			new (this.getPluginClazz('dojox.grid.enhanced.plugins.DnD'))(grid);
		}
		
		//TODO - see if any better ways for this
		//fix inherit issue for mixin, an null/undefined exception will be thrown from the "this.inherited(...)" in
		//the following functions, like saying there is no "startup" in "this" scope
		dojo.isChrome < 3 && (grid.constructor.prototype.startup = grid.startup);
		//grid.constructor.prototype.onStyleRow = grid.onStyleRow;
		
		//get fixed cell(column) number
		this.fixedCellNum = this.getFixedCellNumber();
		
		//overwrite some default methods of DataGrid by method caching
		this.grid.plugins && this._bindFuncs();
	},
	
	getPluginClazz: function(clazzStr){
		//summary:
		//		Load target plugin which must be already required (dojo.require(..))
		//clazzStr: String
		//		Plugin class name
		var clazz = dojo.getObject(clazzStr);
		if(clazz){
			return clazz;
		}
		throw new Error('Please make sure class "' + clazzStr + '" is required.');			
	},
	
	isFixedCell: function(cell) {
		//summary:
		//		See if target cell(column) is fixed or not.
		//cell: Object
		//		Target cell(column)
		//return: Boolean
		//		True - fixed| False - not fixed

		//target cell can use Boolean attributes named "isRowSelector" or "positionFixed" to mark it's a fixed cell(column)
		return cell && (cell.isRowSelector || cell.positionFixed);
	},
	
	getFixedCellNumber: function(){
		//summary:
		//		See if target cell(column) is fixed or not.
		//return: Number
		//		True - fixed| False - not fixed
		if(this.fixedCellNum >= 0){
			return this.fixedCellNum;
		}
		var i = 0;
		dojo.forEach(this.grid.layout.cells, dojo.hitch(this, function(cell){
			this.isFixedCell(cell) && (i++);
		}));
		return i;
	},
	
	inSingleSelection: function(){
		//summary:
		//		See if Grid is in single selection mode
		//return: Boolean
		//		True - in single selection mode | False - not in single selection mode
		return this.grid.selectionMode && this.grid.selectionMode == 'single';
	},
	
	needUpdateRow: function(){
		//summary:
		//		See if needed to update row. See this.updateRow()
		//return: Boolean
		//		True - need update row | False - don't update row
		
		//always true when either indirect selection or DnD disabled
		return ((this.grid.indirectSelection || this.grid.isDndSelectEnable) ? this.grid.edit.isEditing() : true);		
	},				
	
	_bindFuncs: function(){
		//summary:
		//		Overwrite some default methods of DataGrid by method caching		
		dojo.forEach(this.grid.views.views, dojo.hitch(this, function(view){
			//add more events handler - _View
			dojox.grid.util.funnelEvents(view.contentNode, view, "doContentEvent", ['mouseup', 'mousemove']);
			dojox.grid.util.funnelEvents(view.headerNode, view, "doHeaderEvent", ['mouseup']);
			
			//overwrite _View.setColumnsWidth()
			this.funcMap[view.id + '-' +'setColumnsWidth'] = view.setColumnsWidth;
			view.setColumnsWidth =  this.setColumnsWidth;
			
			//overwrite _View._getHeaderContent()
			this.grid.nestedSorting && (view._getHeaderContent = this.grid._getNestedSortHeaderContent);
			
			//overwrite _View.setScrollTop(),
			//#10273 fix of base DataGrid seems to bring some side effects to Enhanced Grid, 
			//TODO - need a more close look post v.1.4 rather than simply overwrite it
			this.grid.dnd && (view.setScrollTop = this.setScrollTop);
		}));
		
		//overwrite _FocusManager.nextKey()
		this.funcMap['nextKey'] = this.grid.focus.nextKey;
		this.grid.focus.nextKey = this.nextKey;

		//overwrite _FocusManager.previousKey()
		this.funcMap['previousKey'] = this.grid.focus.previousKey;
		this.grid.focus.previousKey = this.previousKey;

		//overwrite _Scroller.renderPage()
		if(this.grid.indirectSelection){
			this.funcMap['renderPage'] = this.grid.scroller.renderPage;
			this.grid.scroller.renderPage = this.renderPage;	
			this.funcMap['measurePage'] = this.grid.scroller.measurePage;
			this.grid.scroller.measurePage = this.measurePage;	
		}
		
		//overwrite _Grid.updateRow()
		this.funcMap['updateRow'] = this.grid.updateRow;		
		this.grid.updateRow = this.updateRow;	
		
		if(this.grid.nestedSorting && dojox.grid.cells._Widget){			
			 dojox.grid.cells._Widget.prototype.sizeWidget = this.sizeWidget;
		}
		dojox.grid.cells._Base.prototype.getEditNode = this.getEditNode;
		dojox.grid._EditManager.prototype.styleRow = function(inRow){};		
	},
	
	setColumnsWidth: function(width){
		//summary:
		//		Overwrite _View.setColumnsWidth(), "this" - _View scope
		//		Fix rtl issue in IE.
		if(dojo.isIE && !dojo._isBodyLtr()) {
			this.headerContentNode.style.width = width + 'px';
			this.headerContentNode.parentNode.style.width = width + 'px';			
		}
		//invoke _View.setColumnsWidth()
		dojo.hitch(this, this.grid.pluginMgr.funcMap[this.id + '-' +'setColumnsWidth'])(width);
	},
	
	previousKey: function(e){
		//summary:
		//		Overwrite _FocusManager.previousKey(), "this" - _FocusManager scope		
		var isEditing = this.grid.edit.isEditing();
		if(!isEditing && !this.isNavHeader() && !this._isHeaderHidden()) {
			if(!this.grid.isDndSelectEnable){
				this.focusHeader();
			}else{
				if(!this.isRowBar()){
					this.focusRowBar();
				} else {
					this._blurRowBar();
					this.focusHeader();
				}
			}
			dojo.stopEvent(e);
			return;
		}
		//invoke _FocusManager.previousKey()
		dojo.hitch(this, this.grid.pluginMgr.funcMap['previousKey'])(e);
	},

	nextKey: function(e) {
		//summary:
		//		Overwrite _FocusManager.nextKey(), "this" - _FocusManager scope		
		var isEmpty = this.grid.rowCount == 0;
		var isRootEvt = (e.target === this.grid.domNode);
		if(!isRootEvt && this.grid.isDndSelectEnable && this.isNavHeader()){
			// if tabbing from col header, then go to grid proper. If grid is empty this.grid.rowCount == 0
			this._colHeadNode = this._colHeadFocusIdx= null;
			this.focusRowBar();
			return;
		}else if(!isRootEvt && (!this.grid.isDndSelectEnable && this.isNavHeader()) || (this.grid.isDndSelectEnable && this.isRowBar())){
			this._colHeadNode = this._colHeadFocusIdx= null;
			if (this.grid.isDndSelectEnable) {
				this._blurRowBar();
			}
			if(this.isNoFocusCell() && !isEmpty){
				this.setFocusIndex(0, 0);
			}else if(this.cell && !isEmpty){
				if(this.focusView && !this.focusView.rowNodes[this.rowIndex]){
				// if rowNode for current index is undefined (likely as a result of a sort and because of #7304) 
				// scroll to that row
					this.grid.scrollToRow(this.rowIndex);
				}
				this.focusGrid();
			}else if(!this.findAndFocusGridCell()){
				this.tabOut(this.grid.lastFocusNode);
			}
			return;
		}
		//invoke _FocusManager.nextKey()
		dojo.hitch(this, this.grid.pluginMgr.funcMap['nextKey'])(e);
	},
	
	renderPage: function(inPageIndex){
		//summary:
		//		Overwrite _Scroller.renderPage(), "this" - _Scroller scope
		//		To add progress cursor when rendering the indirect selection cell(column) with checkbox
		for(var i=0, j=inPageIndex*this.rowsPerPage; (i<this.rowsPerPage)&&(j<this.rowCount); i++, j++){}
		this.grid.lastRenderingRowIdx = --j;
		dojo.addClass(this.grid.domNode, 'dojoxGridSortInProgress');
		
		//invoke _Scroller.renderPage()
		dojo.hitch(this, this.grid.pluginMgr.funcMap['renderPage'])(inPageIndex);
	},
	
	measurePage: function(inPageIndex){
		//summary:
		//		Overwrite _Scroller.measurePage(), "this" - _Scroller scope
		//		Fix a regression similar as #5552
		//		invoke _Scroller.measurePage()
		var pageHeight = dojo.hitch(this, this.grid.pluginMgr.funcMap['measurePage'])(inPageIndex);
		return (!dojo.isIE || this.grid.rowHeight || pageHeight > this.rowsPerPage * this.grid.minRowHeight) ? pageHeight : undefined;
	},
	
	updateRow: function(inRowIndex){
		//summary:
		//		Overwrite _Scroller.renderPage(), "this" - _Grid scope
		var caller = arguments.callee.caller;
		if(caller.nom == "move" && /* caller.ctor.prototype.declaredClass == "dojox.grid._FocusManager" && */ !this.pluginMgr.needUpdateRow()){
			//if is called from dojox.grid._FocusManager.move(), and no need to update row, then return
			return;
		}
		//invoke _Grid.updateRow()
		dojo.hitch(this, this.pluginMgr.funcMap['updateRow'])(inRowIndex);
	},
	
	getEditNode: function(inRowIndex) {
		//summary:
		//		Overwrite dojox.grid.cells._Base.getEditNode, "this" - _Base scope
		return ((this.getNode(inRowIndex) || 0).firstChild || 0).firstChild || 0;
	},
	
	sizeWidget: function(inNode, inDatum, inRowIndex){
		//summary:
		//		Overwrite dojox.grid.cells._Widget.sizeWidget, "this" - _Widget scope
		var p = this.getNode(inRowIndex).firstChild, 
		box = dojo.contentBox(p);
		dojo.marginBox(this.widget.domNode, {w: box.w});
	},
	
	setScrollTop: function(inTop){
		//summary:
		//		Overwrite dojox.grid._View.setScrollTop, "this" - _View scope
		this.lastTop = inTop;
		this.scrollboxNode.scrollTop = inTop;
		return this.scrollboxNode.scrollTop;
	},
	
	getViewByCellIdx: function(cellIdx){
		//summary:
		//		Find view that contains the cell with 'cellIdx'
		//cellIdx: Integer
		//		Index of target cell
		//return: Object
		//		Matched view
		var cellMatched = function(cells){
			var j = 0, matched = false;
			for(; j < cells.length; j++){
				if(dojo.isArray(cells[j])){
					if(cellMatched(cells[j])){ return true;}
				}else if(cells[j].index == cellIdx){
					return true;
				}
			}
		};
		var i = 0, views = this.grid.views.views;
		for(; i < views.length; i++){
			cells = views[i].structure.cells;
			if(cellMatched(cells)){ return views[i]; }
		}
		return null;
	}	
});
