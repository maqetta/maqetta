dojo.provide("dojox.grid.enhanced.plugins.NestedSorting");

dojo.declare("dojox.grid.enhanced.plugins.NestedSorting", null, {
	//	summary:
	//		 Provides nested sorting feature
	// example:
	// 		 <div dojoType="dojox.grid.EnhancedGrid" plugins="{nestedSorting: true}" ...></div>

	//sortAttrs: Array
	//		Sorting attributes, e.g.[{attr: 'col1', asc: 1|-1|0, cell: cell, cellNode: node}, {...}, ...]
	sortAttrs: [],
	
	//_unarySortCell: Object
	//		Cache for the current unary sort cell(the 1st column in sorting sequence)
	//		will be set as {cell: cell, cellNode: node}
	_unarySortCell:{},
	
	//_minColWidth: Integer
	//		Used for calculating min cell width, will be updated dynamically
	_minColWidth: 63,//58

	//_widthDelta: Integer
	//		Min width delta
	_widthDelta: 23,//18
	
	//_minColWidthUpdated: Boolean
	//		Flag to indicate whether the min col width has been updated
	_minColWidthUpdated: false,

	//_sortTipMap: Object
	//		Cache the tip on/off status for each cell, e.g. {cellIndex: true|false}
	_sortTipMap:{},
	
	//_overResizeWidth: Integer
	//		Overwrite the default over resize width, 
	//		so that the resize cursor is more obvious when leveraged with sorting hover tips
	_overResizeWidth: 3,

	//storeItemSelected: String
	//		Attribute used in data store to mark which row(s) are selected accross sortings
	storeItemSelected: 'storeItemSelectedAttr',

	//exceptionalSelectedItems: Array
	//		Cache data store items with exceptional selection state.
	//		Used to retain selection states accross sortings. User may first select/deselect all rows
	//		and then deselect/select certain rows, these later changed rows have a different state
	//		with the global selection state, that is exceptional selection state
	exceptionalSelectedItems: [],

	//_a11yText: Object
	//		Characters for sorting arrows, used for a11y high contrast mode
	_a11yText: {
		'dojoxGridDescending'   : '&#9662;',
		'dojoxGridAscending'    : '&#9652;',
		'dojoxGridAscendingTip' : '&#1784;',	
		'dojoxGridDescendingTip': '&#1783;',
		'dojoxGridUnsortedTip'  : 'x' //'&#10006;'
	},
	
	constructor: function(inGrid){
		// summary:
		//		Mixin in all the properties and methods into DataGrid		
		inGrid.mixin(inGrid, this);		
		//init views
		dojo.forEach(inGrid.views.views, function(view){
			//some init work for the header cells
			dojo.connect(view, 'renderHeader', dojo.hitch(view, inGrid._initSelectCols));	
			dojo.connect(view.header, 'domousemove', view.grid, '_sychronizeResize');					
		});	
		//init sorting
		this.initSort(inGrid);	
		//keep selection after sorting if required		
		inGrid.keepSortSelection && dojo.connect(inGrid, '_onFetchComplete', inGrid, 'updateNewRowSelection');
		
		if(inGrid.indirectSelection && inGrid.rowSelectCell.toggleAllSelection){
			dojo.connect(inGrid.rowSelectCell, 'toggleAllSelection', inGrid, 'allSelectionToggled');			
		}
		
		dojo.subscribe(inGrid.rowMovedTopic, inGrid, inGrid.clearSort);		
		dojo.subscribe(inGrid.rowSelectionChangedTopic, inGrid, inGrid._selectionChanged);
		
		//init focus manager for nested sorting
		inGrid.focus.destroy();
		inGrid.focus = new dojox.grid.enhanced.plugins._NestedSortingFocusManager(inGrid);
		
		//set a11y ARAI information
		dojo.connect(inGrid.views, 'render', inGrid, 'initAriaInfo');
	},
	
	initSort: function(inGrid){
		// summary:
		//		initiate sorting		
		inGrid.getSortProps = inGrid._getDsSortAttrs;
		//TODO - set default sorting order
	},
	
	setSortIndex: function(inIndex, inAsc, e){
		// summary:
		//		Sorting entry that overwrites parent(_Grid.js) when nested sorting is enabled
		// 		Sort the grid on multiple columns in a nested sorting sequence
		// inIndex: Integer
		// 		Column index on which to sort.
		// inAsc: Integer
		// 		1:  sort the target column in ascending order
		//		-1: sort the target column in descending order
		//      0:  revert the target column back to unsorted state
		// e: Event
		//		Decorated event object which contains reference to grid, target cell etc.
		if(!this.nestedSorting){
			this.inherited(arguments);
		}else{
			//cache last selection status
			this.keepSortSelection && this.retainLastRowSelection();			
			//var desc = c["sortDesc"]; //TODO when is c["sortDesc"] used?
			this.inSorting = true;
			this._toggleProgressTip(true, e); //turn on progress cursor
			this._updateSortAttrs(e, inAsc);
			this.focus.addSortFocus(e);
			if(this.canSort()){
				this.sort();
				this.edit.info = {};
				this.update();
			}
			this._toggleProgressTip(false, e);//turn off progress cursor
			this.inSorting = false;
		}
	},
	
	_updateSortAttrs: function(e, inAsc){
		// summary:
		//		 Update the sorting sequence
		// e: Event
		//		Decorated event object which contains reference to grid, target cell etc.
		// inAsc: Integer
		// 		1:  sort the target column in ascending order
		//		-1: sort the target column in descending order
		//      0:  revert the target column back to unsorted state
		var existing = false;
		var unarySort = !!e.unarySortChoice;//true - unary sort | false - nested sort
		if(unarySort){
			//unary sort
			var cellSortInfo = this.getCellSortInfo(e.cell);
			var asc  = (this.sortAttrs.length > 0 && cellSortInfo["sortPos"] != 1) ? cellSortInfo["unarySortAsc"]
					    : this._getNewSortState(cellSortInfo["unarySortAsc"]);
			if(asc && asc != 0){
				//update unary sorting info 
				this.sortAttrs = [{attr: e.cell.field, asc: asc, cell: e.cell, cellNode: e.cellNode}];
				this._unarySortCell = {cell: e.cell, node: e.cellNode};
			}else{
				//asc = 0, so empty sorting sequence
				this.sortAttrs = [];
				this._unarySortCell = null;
			}
		}else{
			//nested sort
			this.setCellSortInfo(e, inAsc);
		}
	},
	
	getCellSortInfo: function(cell){
		// summay: 
		//		Get sorting info of the cell
		// cell: Cell
		//		Target header cell
		// return:
		//		Sort info e.g. {unarySortAsc: 1|-1|0, nestedSortAsc: 1|-1|0, sortPos:1|2...}
		if(!cell){return false;}
		var cellSortInfo = null;
		var _sortAttrs = this.sortAttrs;
		dojo.forEach(_sortAttrs, function(attr, index, attrs){
			if(attr && attr["attr"] == cell.field && attr["cell"] == cell){
				cellSortInfo = {unarySortAsc: attrs[0] ? attrs[0]["asc"] : undefined,
								nestedSortAsc:attr["asc"],
								sortPos: index + 1
				}
			}
		});
		return cellSortInfo ? cellSortInfo : {unarySortAsc: _sortAttrs && _sortAttrs[0] ? _sortAttrs[0]["asc"] : undefined, 
								              nestedSortAsc: undefined, sortPos:-1};
	},
	
	setCellSortInfo: function(e, inAsc){
		// summary:
		//		Update nested sorting sequence with the new state of target cell
		// e: Event
		//		Decorated event object which contains reference to grid, target cell etc.
		// inAsc: Integer
		// 		1:  sort the target column in ascending order
		//		-1: sort the target column in descending order
		//      0:  revert the target column back to unsorted state
		var cell = e.cell;
		var existing = false;
		var delAttrs = [];//cells to be removed from sorting sequence
		var _sortAttrs = this.sortAttrs;
		dojo.forEach(_sortAttrs, dojo.hitch(this, function(attr, index){
			if(attr && attr["attr"] == cell.field){
				var si = inAsc ? inAsc : this._getNewSortState(attr["asc"]);
				if(si == 1 || si == -1){
					attr["asc"] = si;
				}else if(si == 0){
					delAttrs.push(index);
				}else{
					throw new Exception('Illegal nested sorting status - ' + si);
				}
				existing = true;
			}
		}));
		
		var minus = 0;
		//remove unsorted columns from sorting sequence
		dojo.forEach(delAttrs, function(delIndex){
			_sortAttrs.splice((delIndex - minus++), 1);
		});
		//add new column to sorting sequence
		if(!existing){
			var si = inAsc ? inAsc : 1;
			if(si != 0){
				_sortAttrs.push({
					attr: cell.field,
					asc: si,
					cell: e.cell,
					cellNode: e.cellNode
				});
			}
		}
		//cache unary sort cell
		if(delAttrs.length > 0){
			this._unarySortCell = {cell: _sortAttrs[0]['cell'], node: _sortAttrs[0]['cellNode']};
		}
	},
	
	_getDsSortAttrs: function(){
		// summary:
		//		Get the sorting attributes for Data Store
		// return: Object
		//		Sorting attributes used by Data Store e.g. {attribute: 'xxx', descending: true|false}
		var dsSortAttrs = [];
		var si = null;
		dojo.forEach(this.sortAttrs, function(attr){
			if(attr && (attr["asc"] == 1 || attr["asc"] == -1)){
				dsSortAttrs.push({attribute:attr["attr"], descending: (attr["asc"] == -1)});
			}
		});
		return dsSortAttrs.length > 0 ? dsSortAttrs : null;
	},
	
	_getNewSortState: function(si/*int 1|-1|0*/){
		//summay:
		//		Get the next sort sate
		//si: Integer
		//		Current sorting state
		//return: Integer
		//		Next new sorting state
		return si ? (si == 1 ? -1 : (si == -1 ? 0 : 1)) : 1;
	},
	
	sortStateInt2Str: function(si){
		//summay: 
		//		Map sort sate from integer to string
		//si: Integer
		//		Sorting state integer
		//return: String
		//		Sort info string
		if(!si){
			return 'Unsorted';
		}
		switch (si){
			case 1:
				return 'Ascending';//'SortUp';
			case -1:
				return 'Descending';//'SortDown';
			default:
				return 'Unsorted';
		}
	}, 
	
	clearSort: function(){
		//summay: 
		//		Clear the sorting sequence
		dojo.query("[id*='Sort']", this.viewsHeaderNode).forEach(function(region){
			dojo.addClass(region, 'dojoxGridUnsorted');
		});
		this.sortAttrs = [];
		this.focus.clearHeaderFocus();
	},
	
	_getNestedSortHeaderContent: function(inCell){
		//summay: 
		//		Callback to render the innHTML for a header cell, 
		//		see _View.renderHeader() and _View.header.generateHtml()
		//inCell: Cell
		//		Header cell for rendering
		//return: String
		//		InnerHTML for the header cell
		var n = inCell.name || inCell.grid.getCellName(inCell);
		if(inCell.grid.pluginMgr.isFixedCell(inCell)){
			return [
				'<div class="dojoxGridCellContent">',
				n,
				'</div>'
			].join('');
		}
		
		//e.g.{unarySortAsc: 1|-1|0, nestedSortAsc: 1|-1|0, sortPos:1|2...}
		var cellSortInfo = inCell.grid.getCellSortInfo(inCell);
		var _sortAttrs = inCell.grid.sortAttrs;
		var inNestedSort = (_sortAttrs && _sortAttrs.length > 1 && cellSortInfo["sortPos"] >= 1);
		var inUnarySort =  (_sortAttrs && _sortAttrs.length == 1 && cellSortInfo["sortPos"] == 1);
		
		var _grid = inCell.grid;
		var ret	= ['<div class="dojoxGridSortRoot">',
		              '<div class="dojoxGridSortWrapper">',
	 					   //[0] => select-sort Separator
					   	   '<span id="selectSortSeparator' + inCell.index+ '" class="dojoxGridSortSeparatorOff"></span>', 						   
						   '<span class="dojoxGridNestedSortWrapper" tabindex="-1">',
							   //[1] => nested sort position
							   '<span id="' + inCell.view.id + 'SortPos' + inCell.index + '" class="dojoxGridSortPos ' + (inNestedSort ? '' : 'dojoxGridSortPosOff') + '">' + 
							   (inNestedSort ? cellSortInfo["sortPos"] : '') + '</span>',
				
							   //[2] => nested sort choice
							   '<span id="nestedSortCol' + inCell.index  + '" class="dojoxGridSort dojoxGridNestedSort ' + 
							   (inNestedSort ? ('dojoxGrid'+ _grid.sortStateInt2Str(cellSortInfo["nestedSortAsc"])) : 'dojoxGridUnsorted') + '">',
							   _grid._a11yText['dojoxGrid' + _grid.sortStateInt2Str(cellSortInfo["nestedSortAsc"])] || '.',
							   '</span>',
						   '</span>',
						   	
						   //[3] => sortSeparator mark
						   '<span id="SortSeparator' + inCell.index + '" class="dojoxGridSortSeparatorOff"></span>',
							
						   //[4] => unary sort choice position
						   //only shown when this cell is the only one in sort sequence
						   '<span class="dojoxGridUnarySortWrapper" tabindex="-1"><span id="unarySortCol' + inCell.index  + '" class="dojoxGridSort dojoxGridUnarySort ' + 
						   (inUnarySort ? ('dojoxGrid'+ _grid.sortStateInt2Str(cellSortInfo["unarySortAsc"])) : 'dojoxGridUnsorted') + '">',
						   _grid._a11yText['dojoxGrid' + _grid.sortStateInt2Str(cellSortInfo["unarySortAsc"])] || '.',
						   '</span></span>',
				   '</div>',						
				   //[5] => select region
					 '<div tabindex="-1" id="selectCol' + inCell.index  + '" class="dojoxGridHeaderCellSelectRegion"><span id="caption' + inCell.index + '">' + n + '<span></div>',
				 '</div>'
		];
		return ret.join('');
	},

	
	addHoverSortTip: function(e){
		// summary:
		//		Add sorting tip for target cell
		// e: Event
		//		Decorated event object which contains reference to grid, target cell etc.
		this._sortTipMap[e.cellIndex] = true;
		
		var cellSortInfo = this.getCellSortInfo(e.cell);
		if(!cellSortInfo){return;} 

		//get all related region elements 
		var elements = this._getCellElements(e.cellNode);
		if(!elements){return;}
		
		var _sortAttrs = this.sortAttrs;	
		//Grid has not been sorted			
		var notSorted = !_sortAttrs || _sortAttrs.length < 1;		
		//only this cell is in sorting sequence
		var inUnarySort = (_sortAttrs && _sortAttrs.length == 1 && cellSortInfo["sortPos"] == 1);
		
		dojo.addClass(elements['selectSortSeparator'], "dojoxGridSortSeparatorOn");

		if(notSorted || inUnarySort){
			this._addHoverUnarySortTip(elements, cellSortInfo, e);
		}else{
			//if in nested sort - "this" cell sort position > 1, then set nested sort state
			this._addHoverNestedSortTip(elements, cellSortInfo, e);
			//update the min cell width for column resizing
			this.updateMinColWidth(elements['nestedSortPos']);			
		}
				
		var selectRegion = elements['selectRegion'];
		this._fixSelectRegion(selectRegion);//resize selection region
		if(!dijit.hasWaiRole(selectRegion)){
			dijit.setWaiState(selectRegion, 'label', 'Column ' + (e.cellIndex + 1) + ' ' +  e.cell.field);
		}
		
		this._toggleHighlight(e.sourceView, e);		
		this.focus._updateFocusBorder();
	},
	
	_addHoverUnarySortTip: function(elements, cellSortInfo, e){
		// summary:
		//		Add hover tip for unary sorting
		// elements: Object
		//		Json object contains all dom nodes of sort regions
		// cellSortInfo: Object
		//		Json object that contains detail sorting info
		// e: Event
		//		Decorated event object which contains reference to grid, target cell etc.
				
		//this cell would be or is already the single unary cell
		dojo.addClass(elements['nestedSortWrapper'], "dojoxGridUnsorted");
		var stateStr = this.sortStateInt2Str(this._getNewSortState(cellSortInfo["unarySortAsc"]));
		dijit.setWaiState(elements['unarySortWrapper'], 'label', 'Column ' + (e.cellIndex + 1) + ' ' + e.cell.field + ' - Choose ' + stateStr.toLowerCase() + ' single sort');
		//set unary sort state
		var className = "dojoxGrid" + stateStr +"Tip";
		dojo.addClass(elements['unarySortChoice'], className);
		elements['unarySortChoice'].innerHTML = this._a11yText[className];
		this._addTipInfo(elements['unarySortWrapper'], this._composeSortTip(stateStr, 'singleSort'));
	},
	
	_addHoverNestedSortTip: function(elements, cellSortInfo, e){
		// summary:
		//		Add hover tip for nested sorting
		// elements: Object
		//		Json object contains all dom nodes of sort regions
		// cellSortInfo: Object
		//		Json object that contains detail sorting info
		// e: Event
		//		Decorated event object which contains reference to grid, target cell etc.		
		var nestedSortPos     = elements['nestedSortPos'];
		var unarySortWrapper  = elements['unarySortWrapper'];
		var nestedSortWrapper = elements['nestedSortWrapper'];
		var _sortAttrs = this.sortAttrs;
		
		dojo.removeClass(nestedSortWrapper, "dojoxGridUnsorted");
		var stateStr = this.sortStateInt2Str(this._getNewSortState(cellSortInfo["nestedSortAsc"]));
		dijit.setWaiState(nestedSortWrapper, 'label', 'Column ' + (e.cellIndex + 1) + ' ' + e.cell.field + ' - Choose ' + stateStr.toLowerCase() + ' nested sort');				
		var className = "dojoxGrid" + stateStr +"Tip";
		this._addA11yInfo(elements['nestedSortChoice'], className);
		this._addTipInfo(nestedSortWrapper, this._composeSortTip(stateStr, 'nestedSort'));
		
		//set unary sort state
		stateStr = this.sortStateInt2Str(cellSortInfo["unarySortAsc"]);
		dijit.setWaiState(unarySortWrapper, 'label', 'Column ' + (e.cellIndex + 1) + ' ' + e.cell.field + ' - Choose ' + stateStr.toLowerCase() + ' single sort');		
		className = "dojoxGrid" + stateStr +"Tip";
		this._addA11yInfo(elements['unarySortChoice'], className);
		this._addTipInfo(unarySortWrapper, this._composeSortTip(stateStr, 'singleSort'));			
		
		//show separator
		dojo.addClass(elements['sortSeparator'], "dojoxGridSortSeparatorOn");
		dojo.removeClass(nestedSortPos, "dojoxGridSortPosOff");
		
		//set sort position info
		if(cellSortInfo["sortPos"] < 1){
			//this would be a new cell to sort sequence, a new sort position is needed
			nestedSortPos.innerHTML = (_sortAttrs ? _sortAttrs.length : 0) + 1;
			if(!this._unarySortInFocus() && _sortAttrs && _sortAttrs.length == 1){
				//this cell will be in the 2nd sort position, sort position info should be turn on for unary sort column				
				var unaryNode = this._getUnaryNode();
				unaryNode.innerHTML = '1';
				dojo.removeClass(unaryNode, "dojoxGridSortPosOff");
				dojo.removeClass(unaryNode.parentNode, "dojoxGridUnsorted");
				this._fixSelectRegion(this._getCellElements(unaryNode)['selectRegion']);						
			}
		}
	},
	
	_unarySortInFocus: function(){
		// summary:
		//		See if the unary sort node is in keyboard focus
		// return: Boolean
		return this._unarySortCell.cell && this.focus.headerCellInFocus(this._unarySortCell.cell.index);
	},
	
	_composeSortTip: function(state, type){
		// summary:
		//		Get properties from nls bundle and compose appropriate sorting tips
		// state: String
		//		Sorting state
		// type: String
		//		Sorting type
		state = state.toLowerCase();
		if(state == "unsorted"){
			return this._nls[state];
		}else{
			var tip = dojo.string.substitute(this._nls['sortingState'], [this._nls[type], this._nls[state]]);
			return tip;
		}
	},
	
	_addTipInfo: function(node, text){
		// summary:
		//		Add title tip to target node and also all the descendants
		// node: Dom node
		//		Target node
		// text: String
		//		Tip string		
		dojo.attr(node, 'title', text);
		dojo.query('span', node).forEach(function(n){
			dojo.attr(n, 'title', text);
		});
	},

	_addA11yInfo:function(node,className){
		// summary:
		//		Add related class and a11y sorting arrow character
		// node: Dom node
		//		Decorated event object which contains reference to grid, target cell etc.	
		// className: String
		//		CSS class name mapped to a11y sorting arrow character
		dojo.addClass(node, className);
		node.innerHTML = this._a11yText[className];
	},
	
	removeHoverSortTip: function(e){
		// summary:
		//		Remove sorting tip for target cell
		// e: Event
		//		Decorated event object which contains reference to grid, target cell etc.
		if(!this._sortTipMap[e.cellIndex]){return; /*tip already removed*/}

		var cellSortInfo = this.getCellSortInfo(e.cell);
		if(!cellSortInfo){return;} 

		//get all related region elements 
		var elements = this._getCellElements(e.cellNode);
		if(!elements){return;}

		var nestedSortChoice  = elements.nestedSortChoice;
		var unarySortChoice   = elements.unarySortChoice;
		var unarySortWrapper  = elements.unarySortWrapper;
		var nestedSortWrapper = elements.nestedSortWrapper;
		
		//remove all highlights
		this._toggleHighlight(e.sourceView, e, true);
		
		//dojo.removeClass doesn't support Reg Exp?
		function _removeTipClass(nodes){
			dojo.forEach(nodes, function(node){
				var newClasses = dojo.trim((" " + node["className"] + " ").replace(/\sdojoxGrid\w+Tip\s/g, " "));
				if(node["className"] != newClasses){ node["className"] = newClasses; }
			});
		}
		_removeTipClass([nestedSortChoice, unarySortChoice]);
		
		unarySortChoice.innerHTML = this._a11yText['dojoxGrid' + this.sortStateInt2Str(cellSortInfo["unarySortAsc"])] || '.';
		nestedSortChoice.innerHTML = this._a11yText['dojoxGrid' + this.sortStateInt2Str(cellSortInfo["nestedSortAsc"])] || '.';
		
		dojo.removeClass(elements['selectSortSeparator'], "dojoxGridSortSeparatorOn");
		dojo.removeClass(elements['sortSeparator'], "dojoxGridSortSeparatorOn");
		
		if(cellSortInfo["sortPos"] == 1 && this.focus.isNavHeader() && !this.focus.headerCellInFocus(e.cellIndex)){
			dojo.removeClass(elements['nestedSortWrapper'], "dojoxGridUnsorted");
		}

		var _sortAttrs = this.sortAttrs;
		if(!isNaN(cellSortInfo["sortPos"])/* fix sortPos missed issue*/ && cellSortInfo["sortPos"] < 1){
			//sort position info for this cell should also be cleared
			elements['nestedSortPos'].innerHTML = "";	
			dojo.addClass(nestedSortWrapper, "dojoxGridUnsorted");
			if(!this.focus._focusBorderBox && _sortAttrs && _sortAttrs.length == 1){
				//clear the sort position info for unary sort column
				var unaryNode = this._getUnaryNode();
				unaryNode.innerHTML = '';
				dojo.addClass(unaryNode, "dojoxGridSortPosOff");
				this._fixSelectRegion(this._getCellElements(unaryNode)['selectRegion']);						
			}
		}
		this._fixSelectRegion(elements['selectRegion']);		
		
		dijit.removeWaiState(nestedSortWrapper, 'label');
		dijit.removeWaiState(unarySortWrapper, 'label');
		
		if(cellSortInfo["sortPos"] >= 0){
			var singleSort = (_sortAttrs.length == 1);
			var node = singleSort ? unarySortWrapper : nestedSortWrapper;
			this._setSortRegionWaiState(singleSort, e.cellIndex, e.cell.field, cellSortInfo["sortPos"], node);
		}

		this.focus._updateFocusBorder();
		this._sortTipMap[e.cellIndex] = false;
	},

	_getUnaryNode: function(){
		// summary:
		//		Get the sort position DOM node of unary column (1st in the sort sequence)
		// return: Dom node
		for(var i = 0; i < this.views.views.length; i++){
			var n = dojo.byId(this.views.views[i].id + 'SortPos' + this._unarySortCell.cell.index);
			if(n) return n;
		}
	},

	_fixSelectRegion: function(selectRegion){
		// summary:
		//		Resize or recover the selection region, so that content in header cell are not messed up.
		// selectRegion: Dom node
		//		Dom node of selection region
		var sortWrapper = selectRegion.previousSibling;
		var parentBox = dojo.contentBox(selectRegion.parentNode);
		var selectRegionBox = dojo.marginBox(selectRegion);
		var sortWrapperBox = dojo.marginBox(sortWrapper);
						
		//fix rtl in IE
		if(dojo.isIE && !dojo._isBodyLtr()){
			var w = 0;
			dojo.forEach(sortWrapper.childNodes, function(node){
				w += dojo.marginBox(node).w;
			})
			sortWrapperBox.w = w;
			sortWrapperBox.l = (sortWrapperBox.t = 0);
			dojo.marginBox(sortWrapper, sortWrapperBox);
		}				
		if(selectRegionBox.w != (parentBox.w - sortWrapperBox.w)){
			selectRegionBox.w = parentBox.w - sortWrapperBox.w;
			if(!dojo.isWebKit){
				dojo.marginBox(selectRegion,selectRegionBox);	
			}else{//fix insufficient width of select region in Safari & Chrome when zoomed in
				selectRegionBox.h = dojo.contentBox(parentBox).h;
				dojo.style(selectRegion, "width", (selectRegionBox.w - 4) + "px");
			}
		}
	},
	
	updateMinColWidth: function(nestedSortPos){
		// summary:
		//		Calculate and update the min cell width. So that sort tip and partial caption are visible when resized.
		// nestedSortPos: Dom node
		//		Dom node of nested sorting position
		if(this._minColWidthUpdated){ return; }	
		var oldValue = nestedSortPos.innerHTML;
		nestedSortPos.innerHTML = dojo.query('.dojoxGridSortWrapper', this.viewsHeaderNode).length;
		var sortWrapper = nestedSortPos.parentNode.parentNode;
		this._minColWidth = dojo.marginBox(sortWrapper).w + this._widthDelta;
		nestedSortPos.innerHTML = oldValue;
		this._minColWidthUpdated = true;
	},

	getMinColWidth: function(){
		// summary:
		//		Fetch the min column width
		return this._minColWidth;
	},
	
	_initSelectCols: function(){
		// summary:
		//		Some initial works on the header cells, like event binding, resizing parameters etc.
		var selectRegions      = dojo.query(".dojoxGridHeaderCellSelectRegion", this.headerContentNode);
		var unarySortWrappers  = dojo.query(".dojoxGridUnarySortWrapper", this.headerContentNode);
		var nestedSortWrappers = dojo.query(".dojoxGridNestedSortWrapper", this.headerContentNode);
		
		selectRegions.concat(unarySortWrappers).concat(nestedSortWrappers).forEach(function(region){
			dojo.connect(region, 'onmousemove', dojo.hitch(this.grid, this.grid._toggleHighlight, this/*view*/));
			dojo.connect(region, 'onmouseout', dojo.hitch(this.grid, this.grid._removeActiveState));
		}, this);
		
		this.grid._fixHeaderCellStyle(selectRegions, this/*view*/);
		
		//fix rtl in IE
		if(dojo.isIE && !dojo._isBodyLtr()){
			this.grid._fixAllSelectRegion();
		}
	},
	
	_fixHeaderCellStyle: function(selectRegions, cellView){
		// summary:
		//		Fix some style issues when header cells are created
		//		TBD, see if these can be fixed through CSS
		// selectRegions: Node list
		//		Node list of dom nodes for selection regions
		// cellView: View
		//		View that contains related cells
		dojo.forEach(selectRegions, dojo.hitch(this, function(selectRegion){
			var selectRegionBox = dojo.marginBox(selectRegion),
				elements = this._getCellElements(selectRegion),
				sortWrapper = elements.sortWrapper;
			sortWrapper.style.height = selectRegionBox.h + 'px';
			sortWrapper.style.lineHeight = selectRegionBox.h + 'px';
			var selectSortSeparator = elements['selectSortSeparator'], sortSeparator = elements['sortSeparator'];
			sortSeparator.style.height = selectSortSeparator.style.height = selectRegionBox.h * 3/5 + 'px';
			sortSeparator.style.marginTop = selectSortSeparator.style.marginTop = selectRegionBox.h * 1/5 + 'px';
			cellView.header.overResizeWidth = this._overResizeWidth;
		}));
	},

	_fixAllSelectRegion: function (){
		// summary:
		//		Fix rtl in IE
		var nodes = dojo.query('.dojoxGridHeaderCellSelectRegion', this.viewsHeaderNode);
		dojo.forEach(nodes, dojo.hitch(this, function(node){
			this._fixSelectRegion(node);
		}));
	},

	_toggleHighlight: function(cellView, e, allOff){
		// summary:
		//		Toggle hover state for selection region, unary sort region (unarySortWrapper) 
		//		and nested sort region (unarySortWrapper)
		// cellView: View
		//		View that contains related cell
		// e: Event
		//		Decorated event object which contains reference to grid, target cell etc.		
		// allOff: Boolean
		//		True - to trun off all highlight | False - by default
		if(!e.target || !e.type || !e.type.match(/mouse|contextmenu/)){
			//don't highlight for key events or when in keyboard focus
			return;
		}
		//console.debug("onmousemove,info.selectChoice="+info.selectChoice + ' info.nestedSortChoice='+info.nestedSortChoice+' info.unarySortChoice='+info.unarySortChoice);
		var elements = this._getCellElements(e.target);
		if(!elements){return;}
		
		var selectRegion      = elements['selectRegion'];
		var nestedSortWrapper = elements['nestedSortWrapper'];
		var unarySortWrapper  = elements['unarySortWrapper'];
				
		dojo.removeClass(selectRegion, 'dojoxGridSelectRegionHover');
		dojo.removeClass(nestedSortWrapper, 'dojoxGridSortHover');
		dojo.removeClass(unarySortWrapper, 'dojoxGridSortHover');	

		if(!allOff && !cellView.grid._inResize(cellView)){
			var info = this._getSortEventInfo(e);
			if(info.selectChoice){//highlight selection region
				dojo.addClass(selectRegion, 'dojoxGridSelectRegionHover');
			}else if(info.nestedSortChoice){//highlight nested sort region
				dojo.addClass(nestedSortWrapper, 'dojoxGridSortHover');
			}else if(info.unarySortChoice){//highlight unary sort region
				dojo.addClass(unarySortWrapper, 'dojoxGridSortHover');
			}
		}
	},
	
	_removeActiveState: function(e){
		// summary:
		//		Remove active state for the event target 
		// e: Event
		if(!e.target || !e.type || !e.type.match(/mouse|contextmenu/)){
			return;
		}
		var node = this._getChoiceRegion(e.target, this._getSortEventInfo(e));
		node && dojo.removeClass(node, this.headerCellActiveClass);
	},
	
	_toggleProgressTip: function(on, e){
		// summary:
		//		Change the cursor to progress or vice versa
		// on: Boolean
		//		True - change to progress cursor, false - recover back to original style
		// e: Event
		//		Decorated event object which contains reference to grid, target cell etc.
		var tipNodes  = [this.domNode, e ? e.cellNode : null];
		setTimeout(function(){
			dojo.forEach(tipNodes, function(node){
				if(node){
					if(on && !dojo.hasClass(node, 'dojoxGridSortInProgress')){
						dojo.addClass(node, 'dojoxGridSortInProgress');
					}else if(!on && dojo.hasClass(node, 'dojoxGridSortInProgress')){
						dojo.removeClass(node, 'dojoxGridSortInProgress');									
					}
				}
			});
		}, 0.1);
	},
	
	_getSortEventInfo: function(e){
		// summary:
		//		Get sort event type from the event 
		// e: Event
		//		Decorated event object which contains reference to grid, target cell etc.
		// return; Object
		//      Sort event type e.g. {unarySortChoice: true|false, nestedSortChoice: true|false, selectChoice: true|false}
		var _isRegionTypeByCSS = function (node, css){
			return dojo.hasClass(node, css) || (node.parentNode && dojo.hasClass(node.parentNode, css));
		};
		return {selectChoice 	 : _isRegionTypeByCSS(e.target, 'dojoxGridHeaderCellSelectRegion'),
				unarySortChoice  : _isRegionTypeByCSS(e.target, 'dojoxGridUnarySortWrapper'),
				nestedSortChoice : _isRegionTypeByCSS(e.target, 'dojoxGridNestedSortWrapper')};
	},
	
	ignoreEvent: function(e){
		// summary:
		//		See if the event should be ignored when nested sorting is enabled
		// e: Event
		//		Decorated event object which contains reference to grid, target cell etc.
		// return: Boolean
		//		True - ignore this event, false - don't ignore
		return !(e.nestedSortChoice || e.unarySortChoice || e.selectChoice);
	},
	
	_sychronizeResize: function(e){
		// summary:
		//		Each time mouse moved in view.headerNode, check if need to add or remove sort tip
		//      This is used so that when mouse moves in resize area, sort tip is turned off, when mouse
		//		moves out of resize area, sort tip is turned on if necessary. Sort tip is also off during resizing
		// e: Event
		//		Decorated event object which contains reference to grid, target cell etc.
		if(!e.cell || e.cell.isRowSelector || this.focus.headerCellInFocus(e.cellIndex)){
			return;
		}
		if(!this._inResize(e.sourceView)){
			this.addHoverSortTip(e);
		}else{
			var idx = e.cellIndex;
			if(!this._sortTipMap[e.cellIndex]){
				e.cellIndex = this._sortTipMap[idx + 1] ? (idx + 1) : (this._sortTipMap[idx - 1] ? (idx - 1) : idx);
				e.cellNode = e.cellNode.parentNode.childNodes[e.cellIndex];
			}
			this.removeHoverSortTip(e);
		}
	},
	
	_getCellElements: function(node){
		// summary:
		//		Fetch all dom nodes related with sorting, using dojo.query()
		//		to search from top 'th' parent of the given node
		// node: Dom node
		//		Target node.
		// return: Object
		//		Json object contains all dom nodes related with sorting	
		try{
			while(node && node.nodeName.toLowerCase() != 'th'){
				node = node.parentNode;
			}
			if(!node){return null;}
			// try to get dojoxGridSortRoot
			var ns = dojo.query(".dojoxGridSortRoot", node);
			if(ns.length != 1){return null;}
			var n = ns[0];
			return {
				'selectSortSeparator': dojo.query("[id^='selectSortSeparator']", n)[0],
				'nestedSortPos'		 : dojo.query(".dojoxGridSortPos", n)[0],
				'nestedSortChoice'	 : dojo.query("[id^='nestedSortCol']", n)[0],
				'sortSeparator'		 : dojo.query("[id^='SortSeparator']", n)[0],
				'unarySortChoice'	 : dojo.query("[id^='unarySortCol']", n)[0],
				'selectRegion'		 : dojo.query(".dojoxGridHeaderCellSelectRegion", n)[0],
				'sortWrapper'		 : dojo.query(".dojoxGridSortWrapper", n)[0],
				'unarySortWrapper'	 : dojo.query(".dojoxGridUnarySortWrapper", n)[0],
				'nestedSortWrapper'	 : dojo.query(".dojoxGridNestedSortWrapper", n)[0],
				'sortRoot'			 : n,
				'headCellNode'		 : node
			}		
		}catch(e){
			console.debug('NestedSorting._getCellElemets() error:' + e);
		}
		return null;
	},
	
	_getChoiceRegion: function(target, choiceInfo){
		// summary:
		//		Find an appropriate region node for the choice event
		// target: Dom Node
		//		Choice event target
		// choiceInfo: Object
		//		Choice info e.g. 'unarySortChoice' | 'nestedSortChoice' | 'selectChoice'
		// return: Dom Node
		//		Appropriate choice region node
		var node, elements = this._getCellElements(target);
		if(!elements){ return; }
		choiceInfo.unarySortChoice && (node = elements['unarySortWrapper']);
		choiceInfo.nestedSortChoice && (node = elements['nestedSortWrapper']);
		choiceInfo.selectChoice && (node = elements['selectRegion']);
		return node;	
	},

	_inResize: function(view){
		// summary:
		//		See if current view is in resizing state(including if the cursor is in resize area)
		// view: View
		//		Target view
		// return: Boolean
		//		True - in resizing state, false - not in resizing state
		return view.header.moverDiv || dojo.hasClass(view.headerNode, "dojoxGridColResize") || dojo.hasClass(view.headerNode, "dojoxGridColNoResize");		
	},
	
	retainLastRowSelection: function(){
		// summary:
		//		Retain selected rows before sorting
		dojo.forEach(this._by_idx, function(o, idx){
			if(!o || !o.item){return;}
			var selected = !!this.selection.isSelected(idx);
			o.item[this.storeItemSelected] = [selected];
			if(this.indirectSelection && this.rowSelectCell.toggleAllTrigerred && selected != this.toggleAllValue){
				this.exceptionalSelectedItems.push(o.item);
			}
		}, this);
		//clear all row selections
		this.selection.selected = [];
		dojo.publish(this.sortRowSelectionChangedTopic,[this]);
	},
	
	updateNewRowSelection: function(items, req){
		// summary:
		//		Fired when row selection is changed, connected from DataGrid._onFetchComplete();
		dojo.forEach(items, function(item, idx){
			if(this.indirectSelection && this.rowSelectCell.toggleAllTrigerred){
				if(dojo.indexOf(this.exceptionalSelectedItems, item) < 0){
					item[this.storeItemSelected] = [this.toggleAllValue];	
				}				
			}
			if(item[this.storeItemSelected] && item[this.storeItemSelected][0]){
				//don't invoke addToSelection to avoid any onSelected events
				var rowIndex = req.start + idx;
				this.selection.selectedIndex = rowIndex;
				this.selection.selected[rowIndex] = true;
				this.updateRowStyles(rowIndex);
			}
		}, this);
		dojo.publish(this.sortRowSelectionChangedTopic,[this]);
		if(dojo.isMoz && this._by_idx.length == 0){
			//Fix a weird issue in FF, when there are empty rows after page loaded
			this.update();
		}
	}, 

	allSelectionToggled: function(checked){
		// summary:
		//		Fired when toggleAllSelection is triggered in indirect selection		
		this.exceptionalSelectedItems = [];
		this.toggleAllValue = this.rowSelectCell.defaultValue;
	},
	
	_selectionChanged: function(obj){
		// summary:
		//		Subscriber of rowSelectionChangedTopic, update global row selection state accordingly
		// obj: Object
		//		Object that fired the rowSelectionChangedTopic		
		obj == this.select && (this.toggleAllValue = false);//from DnD
	},
	
	getStoreSelectedValue: function(rowIdx){
		// summary:
		//		Get whether a give row is selected across sortings
		// rowIdx: Integer
		//		Target row index
		var data = this._by_idx[rowIdx];
		return data && data.item && !!(data.item[this.storeItemSelected] && data.item[this.storeItemSelected][0]);
	},
	
	initAriaInfo: function(){
		// summary:
		//		Add ARIA attributes for A11Y	
		var _sortAttrs = this.sortAttrs;
		dojo.forEach(_sortAttrs, dojo.hitch(this, function(attr, index){
			if(!attr.cell || !attr.cellNode){return;}
			var cellNode = attr.cell.getHeaderNode();
			var elements = this._getCellElements(cellNode);
			if(!elements){return;}
			var selectRegion = elements['selectRegion'];
			//dijit.setWaiRole(selectRegion, 'columnheader');
			dijit.setWaiState(selectRegion, 'label', 'Column ' + (attr.cell.index+1) + ' ' +  attr.attr);
			
			var singleSort = (_sortAttrs.length == 1);
			var sortState = this.sortStateInt2Str(attr.asc).toLowerCase();
			var node = singleSort ? elements['unarySortWrapper'] : elements['nestedSortWrapper'];
			dijit.setWaiState(node, 'sort', sortState);
			this._setSortRegionWaiState(singleSort, attr.cell.index, attr.attr, index + 1, node);
		}));
	},
	
	_setSortRegionWaiState: function(singleSort, cellIdx, field, sortPos, node){
		// summary:
		//		Add ARIA Wai sate for sort regions
		if(sortPos < 0) return;
		var sortType = singleSort ? 'single sort' : 'nested sort';
		var ariaValue = 'Column ' + (cellIdx + 1) + ' ' + field + ' ' + sortType + ' ' + (!singleSort ? (' sort position ' + sortPos) : '');
		dijit.setWaiState(node, 'label', ariaValue);
	},

	_inPage: function(rowIndex){
		// summary:
		//		See if the given row is in the current page
		// rowIndex: Integer
		//		Target row
		// return: Boolean
		//		True - in the current page | False - not in the current page
		return rowIndex < this._bop || rowIndex >= this._eop;
	}
});

dojo.declare("dojox.grid.enhanced.plugins._NestedSortingFocusManager", dojox.grid._FocusManager, {
	// summary:
	//		Provides keyboard focus support for nested sorting

	//lastHeaderFocus: Object
	//		Last header focus info
	lastHeaderFocus :{cellNode:null, regionIdx:-1},
	
	//currentHeaderFocusEvt: Object
	//		Dummy event for current header focus	
	currentHeaderFocusEvt: null,

	//cssMarkers: Array
	//		CSS class markers for select region, nested sort wrapper and unary sort wrapper
	cssMarkers : ['dojoxGridHeaderCellSelectRegion', 'dojoxGridNestedSortWrapper', 'dojoxGridUnarySortWrapper'],

	//_focusBorderBox: Dom node
	//		Root of focus border divs
	_focusBorderBox: null,
	
	_initColumnHeaders: function(){
		// summary:
		//		Bind onfocus and onblur hanlders to regions in each header cell node
		var headerNodes = this._findHeaderCells();
		dojo.forEach(headerNodes, dojo.hitch(this, function(headerNode){
			var selectRegion = dojo.query('.dojoxGridHeaderCellSelectRegion', headerNode);
			var sortRegions = dojo.query("[class*='SortWrapper']", headerNode);
			selectRegion = selectRegion.concat(sortRegions);
			selectRegion.length == 0 && (selectRegion = [headerNode]);
			dojo.forEach(selectRegion, dojo.hitch(this, function(node){
				this._connects.push(dojo.connect(node, "onfocus", this, "doColHeaderFocus"));				
				this._connects.push(dojo.connect(node, "onblur", this, "doColHeaderBlur"));
			}));
		}));
	},

	focusHeader: function(leadingDir, delayed, ignoreRegionPos){
		// summary:
		//		Overwritten, see _FocusManager.focusHeader()
		//leadingDir: Boolean
		//		If focus is switching to leading direction
		//delayed: Boolean
		//		If called from "this._delayedHeaderFocus()"
		//ignoreRegionPos: Boolean
		//		If always focus on the 1st region(select region) for each header cell node
		if(!this.isNavHeader()){
			//focus navigated from cells
			this.inherited(arguments);	
		}else{
			var headerNodes = this._findHeaderCells();
			this._colHeadNode = headerNodes[this._colHeadFocusIdx];
			delayed && (this.lastHeaderFocus.cellNode = this._colHeadNode);
		}
		if(!this._colHeadNode){
			return;
		}
		//jump over the 1st indirect selection cell(column)
		if(this.grid.indirectSelection && this._colHeadFocusIdx == 0){
			this._colHeadNode = this._findHeaderCells()[++this._colHeadFocusIdx];
		}		
		var focusRegionIdx = ignoreRegionPos ? 0 : (this.lastHeaderFocus.regionIdx >= 0 ? this.lastHeaderFocus.regionIdx : (leadingDir ? 2 : 0));
		var focusRegion = dojo.query('.' + this.cssMarkers[focusRegionIdx], this._colHeadNode)[0] || this._colHeadNode;
		this.grid.addHoverSortTip(this.currentHeaderFocusEvt = this._mockEvt(focusRegion));
		this.lastHeaderFocus.regionIdx = focusRegionIdx;
		focusRegion && dojox.grid.util.fire(focusRegion, "focus");
	},
	
	focusSelectColEndingHeader: function(e){
		// summary:
		//		Put focus on the ending column header cell for swipe column selecting(when DnD plugin is on).
		//		See dojox.grid.enhanced.dnd._DndBuilder.domouseup()
		// e: Event
		//		Decorated event object that contains reference to grid header or content
		if(!e || !e.cellNode) return ;
		this._colHeadFocusIdx = e.cellIndex;
		this.focusHeader(null, false, true);
	},
	
	_delayedHeaderFocus: function(){
		// summary:
		//		Overwritten, see _FocusManager._delayedHeaderFocus()		
		//this.needFocusSupport() && this.isNavHeader() && this.focusHeader(null, true);
		this.isNavHeader() && this.focusHeader(null, true);
	},
	
	_setActiveColHeader: function(/*Node*/colHeaderNode, /*Integer*/colFocusIdx, /*Integer*/ prevColFocusIdx){
		// summary:
		//		Overwritten, see _FocusManager._setActiveColHeader()		
		dojo.attr(this.grid.domNode, "aria-activedescendant",colHeaderNode.id);
		this._colHeadNode = colHeaderNode;
		this._colHeadFocusIdx = colFocusIdx;
	},
	
	doColHeaderFocus: function(e){
		// summary:
		//		Overwritten, see _FocusManager.doColHeaderFocus()		
        this.lastHeaderFocus.cellNode = this._colHeadNode;
		if(e.target == this._colHeadNode){
			this._scrollHeader(this.getHeaderIndex());
		}else{
			var focusView = this.getFocusView(e);
			if(!focusView){ return; }		
			focusView.header.baseDecorateEvent(e);
			this._addFocusBorder(e.target);
			this._colHeadFocusIdx = e.cellIndex;
			this._colHeadNode = this._findHeaderCells()[this._colHeadFocusIdx];
			// try to avoid the e.cell is undefined error.
			this._colHeadNode && this.getHeaderIndex() != -1 && this._scrollHeader(this._colHeadFocusIdx);
		}
		this._focusifyCellNode(false);
		this.grid.isDndSelectEnable && this.grid.focus._blurRowBar();
		//fix sort position of first column is missed when 2nd column is added using keyboard.
		this.grid.addHoverSortTip(this.currentHeaderFocusEvt = this._mockEvt(e.target));
		
		//fix ie rtl, focus add a border to the element, so need to change width of selection region
		if(dojo.isIE && !dojo._isBodyLtr()){
			this.grid._fixAllSelectRegion();
		}
	},
	
	doColHeaderBlur: function(e){
		// summary:
		//		Overwritten, see _FocusManager.doColHeaderBlur()		
		this.inherited(arguments);
		this._removeFocusBorder();
		//if(!this.isNavHeader() || this.lastHeaderFocus.cellNode && this.lastHeaderFocus.cellNode != this._colHeadNode){
		if(!this.isNavCellRegion){
			var focusView = this.getFocusView(e);
			if(!focusView){ return; }		
			focusView.header.baseDecorateEvent(e);
			this.grid.removeHoverSortTip(e);
			this.lastHeaderFocus.cellNode = this._colHeadNode;
		}
	},
	
	getFocusView: function(e){
		// summary:
		//		Get the current focus view
		// e: Event
		//		Event that triggers the current focus
		// return: Object
		//		The current focus view
		var focusView;
		dojo.forEach(this.grid.views.views, function(view){
			if(!focusView){
				var viewBox = dojo.coords(view.domNode), targetBox = dojo.coords(e.target);
				var inRange = targetBox.x >= viewBox.x && targetBox.x <= (viewBox.x + viewBox.w);
				inRange && (focusView = view);
			}
		});
		return (this.focusView = focusView);
	},
		
	_mockEvt: function(region){
		// summary:
		//		Return a mocked decorated event for currently focused column header cell.
		// region: Dom node
		//		Target dom node			
		// return: Object
		//		Overwritten, see _FocusManager.doColHeaderBlur()		
		var cell = this.grid.getCell(this._colHeadFocusIdx);
		return {target:region, cellIndex: this._colHeadFocusIdx, cell: cell,
				cellNode: this._colHeadNode, clientX:-1, sourceView: cell.view};
	},
	
	navHeader: function(e){
		// summary:
		//		Navigate focus across column header cells or regions.
		// e: Event
		//		Un-decorated event object
		var offset= e.ctrlKey ? 0 : (e.keyCode == dojo.keys.LEFT_ARROW) ? -1 : 1;
		!dojo._isBodyLtr() && (offset *= -1);
		this.focusView.header.baseDecorateEvent(e);
		dojo.forEach(this.cssMarkers, dojo.hitch(this, function(css, index){
			if(dojo.hasClass(e.target, css)){
				var newPos = index + offset,region,nextRegion;
				do{
					region = dojo.query('.'+this.cssMarkers[newPos], e.cellNode)[0];
					if(region && dojo.style(region.lastChild || region.firstChild, 'display') != 'none'){
						nextRegion = region;
						break;	
					}
					newPos += offset;
				}while(newPos >=0 && newPos < this.cssMarkers.length);
				if(nextRegion && newPos >= 0 && newPos < this.cssMarkers.length){
					if(e.ctrlKey){return;}
					//in IE, avoid removing hover tip during cell region navigation, see this.grid.removeHoverSortTip(e)
					dojo.isIE && (this.grid._sortTipMap[e.cellIndex] = false);
					this.navCellRegion(nextRegion, newPos);
					return;
				}
				var delta = newPos < 0 ? -1 : (newPos >= this.cssMarkers.length ? 1 : 0);
				this.navHeaderNode(delta);
			}
		}));
	},
	
	navHeaderNode: function(delta, ignoreRegionPos){
		// summary:
		//		Navigate focus across column header cells.
		// delta: Integer
		//		1 | 0 | -1, navigating direction
		// ignoreRegionPos: Boolean
		//		If always focus on the 1st region(select region) for each header cell node		
		var _newColHeadFocusIdx = this._colHeadFocusIdx + delta;
		var headers = this._findHeaderCells();
		while(_newColHeadFocusIdx >=0 && _newColHeadFocusIdx < headers.length 
			&& headers[_newColHeadFocusIdx].style.display == "none"){
			// skip over hidden column headers
			_newColHeadFocusIdx += delta;
		}
		
		if(this.grid.indirectSelection && _newColHeadFocusIdx == 0){
			return;//simply ignore indirect selection column
		}
		if(delta != 0 && _newColHeadFocusIdx >= 0 && _newColHeadFocusIdx < this.grid.layout.cells.length){
			this.lastHeaderFocus.cellNode = this._colHeadNode;
			this.lastHeaderFocus.regionIdx = -1;
			this._colHeadFocusIdx = _newColHeadFocusIdx;
			this.focusHeader(delta < 0 ? true/*navigate towards leading direction*/ : false/*navigate towards trail direction*/, false, ignoreRegionPos);				
		}
	},
	
	navCellRegion:function(nextRegion, newPos){
		// summary:
		//		Navigate focus across regions within a column header cell.
		// nextRegion: Dom node
		//		Next region node to be focused
		// newPos: Integer
		//		New region index			
		this.isNavCellRegion = true;
		dojox.grid.util.fire(nextRegion, "focus");
		this.currentHeaderFocusEvt.target = nextRegion;
		this.lastHeaderFocus.regionIdx = newPos;
		var selectRegion = newPos == 0 ? nextRegion : nextRegion.parentNode.nextSibling;
		selectRegion && this.grid._fixSelectRegion(selectRegion);
		this.isNavCellRegion = false;
	},

	headerCellInFocus: function(cellIndex){
		// summary:
		//		See if column header cell(with cellIndex) is now having focus
		// cellIndex: Integer
		//		Cell (column) index
		// return: Boolean
		//		If the column header cell(with cellIndex) is now having focus.
		return (this._colHeadFocusIdx == cellIndex) && this._focusBorderBox;
	},
	
	clearHeaderFocus: function(){
		// summary:
		//		Clear focus in column header cell		
		this._colHeadNode = this._colHeadFocusIdx = null;
		this.lastHeaderFocus = {cellNode:null, regionIdx:-1};
	},

	addSortFocus: function(e){
		// summary:
		//		 Add focus to sort region in column header cell by mouse click
		//		 See NestedSorting.setSortIndex()
		// e: Event
		//		Decorated event object which contains reference to grid, target cell etc.
		var cellSortInfo = this.grid.getCellSortInfo(e.cell);
		if(!cellSortInfo) 
			return;
		var _sortAttrs = this.grid.sortAttrs;		
		var notSorted = !_sortAttrs || _sortAttrs.length < 1;		
		var inUnarySort = (_sortAttrs && _sortAttrs.length == 1 && cellSortInfo["sortPos"] == 1);
		this._colHeadFocusIdx = e.cellIndex;
		this._colHeadNode = e.cellNode;
		this.currentHeaderFocusEvt = {};
		this.lastHeaderFocus.regionIdx = (notSorted || inUnarySort) ? 2 : (e.nestedSortChoice ? 1 : 0);
	},	
	
	_addFocusBorder: function(node){
		// summary:
		//		 Add focus borders to node, use this instead of native CSS way to fix border wobbling issue
		// node: Dom node
		//		Target node to add focus borders	
		if(!node) return ;
		this._removeFocusBorder();
		this._focusBorderBox = dojo.create('div');
		this._focusBorderBox.className = 'dojoxGridFocusBorderBox';
		dojo.toggleClass(node, "dojoxGridSelectRegionFocus", true);
		dojo.toggleClass(node, "dojoxGridSelectRegionHover", false);
		
		//cache the height - in IE6 the value will be doubled after 'node.insertBefore()'
		var nodeH = node.offsetHeight;
		if(node.hasChildNodes()){
			node.insertBefore(this._focusBorderBox, node.firstChild);
		}else{
			node.appendChild(this._focusBorderBox);
		}
		
		var _d = {'l': 0, 't': 0, 'r': 0, 'b': 0};		
		for(var i in _d){
			_d[i] = dojo.create('div');
		}
		
		var pos = {
			x: dojo.coords(node).x - dojo.coords(this._focusBorderBox).x ,
			y: dojo.coords(node).y - dojo.coords(this._focusBorderBox).y,
			w: node.offsetWidth,
			h: nodeH
		};
		for(var i in _d){
			var n = _d[i];
			dojo.addClass(n, 'dojoxGridFocusBorder');
			dojo.style(n, 'top', pos.y + 'px');
			dojo.style(n, 'left', pos.x + 'px');
			this._focusBorderBox.appendChild(n);
		}
		var normalize = function(val){
			return val > 0 ? val : 0;
		}
		dojo.style(_d.r, 'left',   normalize(pos.x + pos.w - 1) + 'px');
		dojo.style(_d.b, 'top',    normalize(pos.y + pos.h - 1) + 'px');		
		dojo.style(_d.l, 'height', normalize(pos.h - 1) + 'px');
		dojo.style(_d.r, 'height', normalize(pos.h - 1) + 'px');
		dojo.style(_d.t, 'width',  normalize(pos.w - 1) + 'px');
		dojo.style(_d.b, 'width',  normalize(pos.w - 1) + 'px');
	},
	
	_updateFocusBorder: function(){
		// summary:
		//		 Update focus borders.
		if(this._focusBorderBox == null){
			return;
		}
		this._addFocusBorder(this._focusBorderBox.parentNode);
	},

	_removeFocusBorder: function(){
		// summary:
		//		 Remove focus borders.		
		if(this._focusBorderBox && this._focusBorderBox.parentNode){
			dojo.toggleClass(this._focusBorderBox.parentNode, "dojoxGridSelectRegionFocus", false);
			this._focusBorderBox.parentNode.removeChild(this._focusBorderBox);
			
		}			
		this._focusBorderBox = null;
	}
});
