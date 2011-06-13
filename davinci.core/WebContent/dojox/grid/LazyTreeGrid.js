dojo.provide("dojox.grid.LazyTreeGrid");

dojo.require("dojox.grid._View");
dojo.require("dojox.grid.TreeGrid");
dojo.require("dojox.grid.cells.tree");
dojo.require("dojox.grid.LazyTreeGridStoreModel");

dojo.declare("dojox.grid._LazyExpando", [dijit._Widget, dijit._Templated], {
	itemId: "",
	cellIdx: -1,
	view: null,
	rowIdx: -1,
	expandoCell: null,
	level: 0,
	open: false,
	templatePath: dojo.moduleUrl("dojox.grid", "resources/Expando.html"),
	
	onToggle: function(event){
		// Summary
		//		Function for expand/collapse row
		this.setOpen(!this.view.grid.cache.getExpandoStatusByRowIndex(this.rowIdx));
		try{
			dojo.stopEvent(event);
		}catch(e){}
	},
	
	setOpen: function(open){
		var g = this.view.grid,
			item = g.cache.getItemByRowIndex(this.rowIdx);
		if(!g.treeModel.mayHaveChildren(item)){
			g.stateChangeNode = null;
			return;
		}
		if(item && !g._loading){
			g.stateChangeNode = this.domNode;
			g.cache.updateCache(this.rowIdx, {"expandoStatus": open});
			g.expandoFetch(this.rowIdx, open);
			this.open = open;
		}
		this._updateOpenState(item);
	},
	
	_updateOpenState: function(item){
		// Summary
		//		Update the expando icon
		var grid = this.view.grid;
		if(item && grid.treeModel.mayHaveChildren(item)){
			var state = grid.cache.getExpandoStatusByRowIndex(this.rowIdx);
			this.expandoInner.innerHTML = state ? "-" : "+";
			dojo.toggleClass(this.domNode, "dojoxGridExpandoOpened", state);
			dijit.setWaiState(this.domNode.parentNode, "expanded", state);
		}
	},
	
	setRowNode: function(rowIdx, rowNode, view){
		if(this.cellIdx < 0 || !this.itemId){ return false; }
		this._initialized = false;
		this.view = view;
		this.rowIdx = rowIdx;
		this.expandoCell = view.structure.cells[0][this.cellIdx];
		var d = this.domNode;
		if(d && d.parentNode && d.parentNode.parentNode){
			this._tableRow = d.parentNode.parentNode;
		}
		dojo.style(this.domNode , "marginLeft" , (this.level * 1.125) + "em");
		this._updateOpenState(view.grid.cache.getItemByRowIndex(this.rowIdx));
		return true;
	}
});

dojo.declare("dojox.grid._TreeGridContentBuilder", dojox.grid._ContentBuilder, {
	// summary:
	//		Could create row content innerHTML by different appoarch for different data structure
	generateHtml: function(inDataIndex, inRowIndex){
		// summary:
		//		create row innterHTML for flat data structure
		var html = this.getTableArray(),
			grid = this.grid,
			v = this.view,
			cells = v.structure.cells,
			item = grid.getItem(inRowIndex),
			level = 0,
			treePath = grid.cache.getTreePathByRowIndex(inRowIndex),
			rowStack = [],
			toggleClasses = [];
			
		dojox.grid.util.fire(this.view, "onBeforeRow", [inRowIndex, cells]);
			
		if(item !== null && treePath !== null){
			rowStack = treePath.split("/");
			level = rowStack.length - 1;
			toggleClasses[0] = "dojoxGridRowToggle-" + rowStack.join("-");
			if(!grid.treeModel.mayHaveChildren(item)){
				toggleClasses.push("dojoxGridNoChildren");
			}
		}
		
		for(var j = 0, row; (row = cells[j]); j++){
			if(row.hidden || row.header){
				continue;
			}
			var tr = '<tr style="" class="' + toggleClasses.join(' ') + '" dojoxTreeGridPath="' + rowStack.join('/') + '" dojoxTreeGridBaseClasses="' + toggleClasses.join(' ') + '">';
			html.push(tr);
			var k = 0, mergedCells = this._getColSpans(level);
			var totalWidth = 0, totalWidthes = [];
			if(mergedCells){
				dojo.forEach(mergedCells, function(c){
					for(var i = 0, cell;(cell = row[i]); i++){
						if(i >= c.start && i <= c.end){
							totalWidth += this._getCellWidth(row, i);
						}
					}
					totalWidthes.push(totalWidth);
					totalWidth = 0;
				}, this);
			}
			for(var i = 0, cell, m, cc, cs; (cell = row[i]); i++){
				m = cell.markup;
				cc = cell.customClasses = [];
				cs = cell.customStyles = [];
				if(mergedCells && mergedCells[k] && (i >= mergedCells[k].start && i <= mergedCells[k].end)){
					var primaryIdx = mergedCells[k].primary ? mergedCells[k].primary : mergedCells[k].start;
					if(i == primaryIdx){
						m[5] = cell.formatAtLevel(rowStack, item, level, false, toggleClasses[0], cc, inRowIndex);
						// classes
						m[1] = cc.join(' ');
						// styles
						var pbm = dojo.marginBox(cell.getHeaderNode()).w - dojo.contentBox(cell.getHeaderNode()).w;
						cs = cell.customStyles = ['width:' + (totalWidthes[k] - pbm) + "px"];
						m[3] = cs.join(';');
						html.push.apply(html, m);
					}else if(i == mergedCells[k].end){
						k++;
						continue;
					}else{
						continue;
					}
				}else{
					// content (format can fill in cc and cs as side-effects)
					// m[5] = cell.format(inRowIndex, item);
					m[5] = cell.formatAtLevel(rowStack, item, level, false, toggleClasses[0], cc, inRowIndex);
					// classes
					m[1] = cc.join(' ');
					// styles
					m[3] = cs.join(';');
					// in-place concat
					html.push.apply(html, m);
				}
				
			}
			html.push('</tr>');
		}
		html.push('</table>');
		return html.join(''); // String
	},

	_getColSpans: function(level){
		// summary:
		//		handle the column span object
		var colSpans = this.grid.colSpans;
		if(colSpans && (colSpans[level])){
			return colSpans[level];
		}else{
			return null;
		}
	},
	
	_getCellWidth: function(cells, colIndex){
		// summary:
		//		calculate column width by header cell's size
		var node = cells[colIndex].getHeaderNode();
		if(colIndex == cells.length - 1 || dojo.every(cells.slice(colIndex + 1), function(cell){
			return cell.hidden;
		})){
			var headerNodePos = dojo.position(cells[colIndex].view.headerContentNode.firstChild);
			return headerNodePos.x + headerNodePos.w - dojo.position(node).x;
		}else{
			var nextNode = cells[colIndex + 1].getHeaderNode();
			return dojo.position(nextNode).x - dojo.position(node).x;
		}
	}
});

dojo.declare("dojox.grid._TreeGridView", [dojox.grid._View], {
	
	_contentBuilderClass: dojox.grid._TreeGridContentBuilder,
	
	postCreate: function(){
		this.inherited(arguments);
		this._expandos = {};
		this.connect(this.grid, '_cleanupExpandoCache', '_cleanupExpandoCache');
	},
	
	_cleanupExpandoCache: function(index, identity, item){
		if(index == -1){
			return;
		}
		dojo.forEach(this.grid.layout.cells, function(cell){
			if(cell.openStates && identity in cell.openStates){
				delete cell.openStates[identity];
			}
		});
		for(var i in this._expandos){
			if(this._expandos[i]){
				this._expandos[i].destroy();
			}
		}
		this._expandos = {};
	},

	onAfterRow: function(inRowIndex, cells, inRowNode){
		// summary:
		//		parse the expando of each row to a widget
		dojo.query("span.dojoxGridExpando", inRowNode).forEach(function(n){
			if(n && n.parentNode){
				// Either create our expando or put the existing expando back
				// into place
				var idty, expando, _byIdx = this.grid._by_idx;
				if(_byIdx && _byIdx[inRowIndex] && _byIdx[inRowIndex].idty){
					idty = _byIdx[inRowIndex].idty;
					expando = this._expandos[idty];
				}
				if(expando){
					dojo.place(expando.domNode, n, "replace");
					expando.itemId = n.getAttribute("itemId");
					expando.cellIdx = parseInt(n.getAttribute("cellIdx"), 10);
					if(isNaN(expando.cellIdx)){
						expando.cellIdx = -1;
					}
				}else{
					expando = dojo.parser.parse(n.parentNode)[0];
					if(idty){
						this._expandos[idty] = expando;
					}
				}
				if(!expando.setRowNode(inRowIndex, inRowNode, this)){
					expando.domNode.parentNode.removeChild(expando.domNode);
				}
			}
		}, this);
		this.inherited(arguments);
	}
	
});

dojox.grid.cells.LazyTreeCell = dojo.mixin(dojo.clone(dojox.grid.cells.TreeCell), {
	formatAtLevel: function(inRowIndexes, inItem, level, summaryRow, toggleClass, cellClasses, inRowIndex){
		if(!inItem){
			return this.formatIndexes(inRowIndex, inRowIndexes, inItem, level);
		}
		if(!dojo.isArray(inRowIndexes)){
			inRowIndexes = [inRowIndexes];
		}
		var result = "";
		var ret = "";
		if(this.isCollapsable){
			var store = this.grid.store, id = "";
			if(inItem && store.isItem(inItem)){
				id = store.getIdentity(inItem);
			}
			cellClasses.push("dojoxGridExpandoCell");
			ret = '<span ' + dojo._scopeName + 'Type="dojox.grid._LazyExpando" level="' + level + '" class="dojoxGridExpando"' +
					'" toggleClass="' + toggleClass + '" itemId="' + id + '" cellIdx="' + this.index + '"></span>';
		}
		result = ret + this.formatIndexes(inRowIndex, inRowIndexes, inItem, level);
		if(this.grid.focus.cell && this.index == this.grid.focus.cell.index && inRowIndexes.join('/') == this.grid.focus.rowIndex){
			cellClasses.push(this.grid.focus.focusClass);
		}
		return result;
	},
	
	formatIndexes: function(inRowIndex, inRowIndexes, inItem, level){
		var info = this.grid.edit.info,
			d = this.get ? this.get(inRowIndexes[0], inItem, inRowIndexes) : (this.value || this.defaultValue);
		if(this.editable && (this.alwaysEditing || (info.rowIndex == inRowIndexes[0] && info.cell == this))){
			return this.formatEditing(d, inRowIndex, inRowIndexes);
		}else{
			return this._defaultFormat(d, [d, inRowIndex, level, this]);
		}
	}
});

dojo.declare("dojox.grid._LazyTreeLayout", dojox.grid._Layout, {
	// summary:
	//		Override the dojox.grid._TreeLayout to modify the _TreeGridView and cell formatter
	setStructure: function(inStructure){
		var s = inStructure;
		var g = this.grid;
		if(g && !dojo.every(s, function(i){
			return ("cells" in i);
		})){
			s = arguments[0] = [{cells:[s]}];//intentionally change arguments[0]
		}
		if(s.length == 1 && s[0].cells.length == 1){
			s[0].type = "dojox.grid._TreeGridView";
			this._isCollapsable = true;
			s[0].cells[0][this.grid.expandoCell].isCollapsable = true;
		}
		this.inherited(arguments);
	},
	
	addCellDef: function(inRowIndex, inCellIndex, inDef){
		var obj = this.inherited(arguments);
		return dojo.mixin(obj, dojox.grid.cells.LazyTreeCell);
	}
});

dojo.declare("dojox.grid.TreeGridItemCache", null, {
	
	unInit: true,
	
	items: null,
	
	constructor: function(grid){
		this.rowsPerPage = grid.rowsPerPage;
		this._buildCache(grid.rowsPerPage);
	},
	
	_buildCache: function(size){
		// Summary
		//		Build the cache only with the treepath using given size
		this.items = [];
		for(var i = 0; i < size; i++){
			this.cacheItem(i, {item: null, treePath: i + "", expandoStatus: false});
		}
	},
	
	cacheItem: function(/*integer*/rowIdx, cacheObj){
		// Summary
		//		Add an item and its tree structure information to the cache.
		this.items[rowIdx] = dojo.mixin({
			item: null,
			treePath: "",
			expandoStatus: false
		}, cacheObj);
	},
	
	insertItem: function(/*integer*/rowIdx, cacheObj){
		this.items.splice(rowIdx, 0, dojo.mixin({
			item: null,
			treePath: "",
			expandoStatus: false
		}, cacheObj));
	},
	
	initCache: function(size){
		if(!this.unInit){ return; }
		this._buildCache(size);
		this.unInit = false;
	},
	
	getItemByRowIndex: function(/*integer*/rowIdx){
		return this.items[rowIdx] ? this.items[rowIdx].item : null;
	},
	
	getItemByTreePath: function(treePath){
		for(var i = 0, len = this.items.length; i < len; i++){
			if(this.items[i].treePath === treePath){
				return this.items[i].item;
			}
		}
		return null;
	},
	
	getTreePathByRowIndex: function(/*integer*/rowIdx){
		return this.items[rowIdx] ? this.items[rowIdx].treePath : null;
	},
	
	getExpandoStatusByRowIndex: function(/*integer*/rowIdx){
		return this.items[rowIdx] ? this.items[rowIdx].expandoStatus : null;
	},
	
	getInfoByItem: function(item){
		for(var i = 0, len = this.items.length; i < len; i++){
			if(this.items[i].item == item){
				return dojo.mixin({rowIdx: i}, this.items[i]);
			}
		}
		return null;
	},
	
	updateCache: function(/*integer*/rowIdx, cacheObj){
		if(this.items[rowIdx]){
			dojo.mixin(this.items[rowIdx], cacheObj);
		}
	},
	
	deleteItem: function(rowIdx){
		if(this.items[rowIdx]){
			this.items.splice(rowIdx, 1);
		}
	},
	
	cleanChildren: function(rowIdx){
		var treePath = this.getTreePathByRowIndex(rowIdx);
		for(var i = this.items.length - 1; i >= 0; i--){
			if(this.items[i].treePath.indexOf(treePath) === 0 && this.items[i].treePath !== treePath){
				this.items.splice(i, 1);
			}
		}
	},
	
	emptyCache: function(){
		this.unInit = true;
		this._buildCache(this.rowsPerPage);
	},
	
	cleanupCache: function(){
		this.items = null;
	}
	
});

dojo.declare("dojox.grid.LazyTreeGrid", dojox.grid.TreeGrid, {
	// summary:
	//		An enhanced TreeGrid widget which supports lazy-loading nested-level items
	//
	// description:
	//		LazyTreeGrid inherits from dojo.grid.TreeGrid, and applies virtual scrolling mechanism
	//		to nested children rows so that it's possible to deal with large data set specifically
	//		in tree structure with large number of children rows. It's also compatible with dijit.tree.ForestStoreModel
	//
	//		Most methods and properties pertaining to the dojox.grid.DataGrid
	//		and dojox.grid.TreeGrid also apply here
	//
	//		LazyTreeGrid does not support summary row/items aggregate for the
	//		lazy-loading reason.
	
	treeModel: null,
	
	_layoutClass: dojox.grid._LazyTreeLayout,
	
	// colSpans: Object
	//		a json object that defines column span of each level rows
	//		attributes:
	//			0/1/..: which level need to colspan
	//			start: start column index of colspan
	//			end: end column index of colspan
	//			primary: index of column which content will be displayed (default is value of start).
	//		example:
	//		|	colSpans = {
	//		|	0:	[
	//		|			{start: 0, end: 1, primary: 0},
	//		|			{start: 2, end: 4, primary: 3}
	//		|		],
	//		|	1:	[
	//		|			{start: 0, end: 3, primary: 1}
	//		|		]
	//		|	};
	colSpans: null,
	
	postCreate: function(){
		this.inherited(arguments);
		this.cache = new dojox.grid.TreeGridItemCache(this);
		if(!this.treeModel || !(this.treeModel instanceof dijit.tree.ForestStoreModel)){
			throw new Error("dojox.grid.LazyTreeGrid: must use a treeModel and treeModel must be an instance of dijit.tree.ForestStoreModel");
		}
		dojo.addClass(this.domNode, "dojoxGridTreeModel");
		dojo.setSelectable(this.domNode, this.selectable);
	},
	
	createManagers: function(){
		// summary:
		//		create grid managers for various tasks including rows, focus, selection, editing
		this.rows = new dojox.grid._RowManager(this);
		this.focus = new dojox.grid._FocusManager(this);
		this.edit = new dojox.grid._EditManager(this);
	},

	createSelection: function(){
		this.selection = new dojox.grid.DataSelection(this);
	},
	
	setModel: function(treeModel){
		if(!treeModel){
			return;
		}
		this._setModel(treeModel);
		this._refresh(true);
	},
	
	setStore: function(store, query, queryOptions){
		if(!store){
			return;
		}
		this._setQuery(query, queryOptions);
		this.treeModel.query = query;
		this.treeModel.store = store;
		this.treeModel.root.children = [];
		this.setModel(this.treeModel);
	},
	
	_setQuery: function(query, queryOptions){
		this.inherited(arguments);
		this.treeModel.query = query;
	},
	
	destroy: function(){
		this._cleanup();
		this.inherited(arguments);
	},
	
	_cleanup: function(){
		this.cache.emptyCache();
		this._cleanupExpandoCache();
	},
	
	setSortIndex: function(inIndex, inAsc){
		// Need to clean up the cache before sorting
		if(this.canSort(inIndex + 1)){
			this._cleanup();
		}
		this.inherited(arguments);
	},
	
	_refresh: function(isRender){
		this._cleanup();
		this.inherited(arguments);
	},
	
	render: function(){
		this.inherited(arguments);
		this.setScrollTop(this.scrollTop);
	},
	
	_onNew: function(item, parentInfo){
		var isAddingChild = false;
		var info;
		if(parentInfo && this.store.isItem(parentInfo.item) && dojo.some(this.treeModel.childrenAttrs, function(c){
			return c === parentInfo.attribute;
		})){
			isAddingChild = true;
			info = this.cache.getInfoByItem(parentInfo.item);
		}
		if(!isAddingChild){
			this.inherited(arguments);
			var items = this.cache.items;
			var treePath = (parseInt(items[items.length - 1].treePath.split("/")[0], 10) + 1) + "";
			this.cache.insertItem(this.get('rowCount'), {item: item, treePath: treePath, expandoStatus: false});
		}else if(info && info.expandoStatus && info.rowIdx >= 0){
			this.expandoFetch(info.rowIdx, false);
			this.expandoFetch(info.rowIdx, true);
		}else if(info && info.rowIdx){
			this.updateRow(info.rowIdx);
		}
	},
	
	_onDelete: function(item){
		this._pages = [];
		this._bop = -1;
		this._eop = -1;
		this._refresh();
	},
	
	_cleanupExpandoCache: function(index, identity, item){},
	
	_fetch: function(start, isRender){
		// summary:
		//		Function for fetch data when initializing TreeGrid and
		//		scroll the TreeGrid
		start = start || 0;
		this.reqQueue = [];
		// Check cache, do not need to fetch data if there are required data in cache
		var i = 0, fetchedItems = [];
		var count = Math.min(this.rowsPerPage, this.cache.items.length - start);
		for(i = start; i < count; i++){
			if(this.cache.getItemByRowIndex(i)){
				fetchedItems.push(this.cache.getItemByRowIndex(i));
			}else{
				break;
			}
		}
		if(fetchedItems.length === count){// || !this.cache.getTreePathByRowIndex(start + fetchedItems.length)){
			this._onFetchComplete(fetchedItems, {startRowIdx: start, count: count});
		}else{
			// In case there need different level data, we need to do multiple fetch.
			// Do next fetch only when the last request complete.
			this.reqQueueIndex = 0;
			var level = "",
				nextRowLevel = "",
				startRowIdx = start,
				startTreePath = this.cache.getTreePathByRowIndex(start);
			count = 0;
			// Create request queue
			for(i = start + 1; i < start + this.rowsPerPage; i++){
				if(!this.cache.getTreePathByRowIndex(i)){
					break;
				}
				level = this.cache.getTreePathByRowIndex(i - 1).split("/").length - 1;
				nextRowLevel = this.cache.getTreePathByRowIndex(i).split("/").length - 1;
				if(level !== nextRowLevel){
					this.reqQueue.push({
						startTreePath: startTreePath,
						startRowIdx: startRowIdx,
						count: count + 1
					});
					count = 0;
					startRowIdx = i;
					startTreePath = this.cache.getTreePathByRowIndex(i);
				}else{
					count++;
				}
			}
			this.reqQueue.push({
				startTreePath: startTreePath,
				startRowIdx: startRowIdx,
				count: count + 1
			});
			var len = this.reqQueue.length;
			for(i = 0; i < len; i++){
				this._fetchItems(i, dojo.hitch(this, "_onFetchBegin"), dojo.hitch(this, "_onFetchComplete"), dojo.hitch(this, "_onFetchError"));
			}
		}
	},
	
	_fetchItems: function(idx, onBegin, onComplete, onError){
		if(!this._loading){
			this._loading = true;
			this.showMessage(this.loadingMessage);
		}
		var level = this.reqQueue[idx].startTreePath.split("/").length - 1;
		this._pending_requests[this.reqQueue[idx].startRowIdx] = true;
		if(level === 0){
			this.store.fetch({
				start: parseInt(this.reqQueue[idx].startTreePath, 10),
				startRowIdx: this.reqQueue[idx].startRowIdx,
				count: this.reqQueue[idx].count,
				query: this.query,
				sort: this.getSortProps(),
				queryOptions: this.queryOptions,
				onBegin: onBegin,
				onComplete: onComplete,
				onError: onError
			});
		}else{
			var startTreePath = this.reqQueue[idx].startTreePath;
			var parentTreePath = startTreePath.substring(0, startTreePath.lastIndexOf("/"));
			var startIdx = startTreePath.substring(startTreePath.lastIndexOf("/") + 1);
			var parentItem = this.cache.getItemByTreePath(parentTreePath);
			if(!parentItem){
				throw new Error("Lazy loading TreeGrid on fetch error:");
			}
			var parentId = this.store.getIdentity(parentItem);
			this.queryObj = {
				start: parseInt(startIdx, 10),
				startRowIdx: this.reqQueue[idx].startRowIdx,
				count: this.reqQueue[idx].count,
				parentId: parentId,
				sort: this.getSortProps()
			};
			this.treeModel.getChildren(parentItem, onComplete, onError, this.queryObj);
		}
	},
	
	_onFetchBegin: function(size, request){
		this.cache.initCache(size);
		size = this.cache.items.length;
		this.inherited(arguments);
	},

    filter: function(query, reRender){
    	this.cache.emptyCache();
        this.inherited(arguments);
    },

	_onFetchComplete: function(items, request, size){
		var treePath = "",
			startRowIdx, count, start;
			
		if(request){
			startRowIdx = request.startRowIdx;
			count = request.count;
			start = 0;
		}else{
			startRowIdx = this.queryObj.startRowIdx;
			count = this.queryObj.count;
			start = this.queryObj.start;
		}
		
		for(var i = 0; i < count; i++){
			treePath = this.cache.getTreePathByRowIndex(startRowIdx + i);
			if(treePath){
				if(!this.cache.getItemByRowIndex(startRowIdx + i)){
					this.cache.cacheItem(startRowIdx + i, {
						item: items[start + i],
						treePath: treePath,
						expandoStatus: false
					});
				}
			}
		}
		this._pending_requests[startRowIdx] = false;
		// Add items when all request complete
		if(!this.scroller){
			return;
		}
		var len = Math.min(count, items.length);
		for(i = 0; i < len; i++){
			this._addItem(items[start + i], startRowIdx + i, true);
		}
		this.updateRows(startRowIdx, len);
		if(this._lastScrollTop){
			this.setScrollTop(this._lastScrollTop);
		}
		if(this._loading){
			this._loading = false;
			if(!this.cache.items.length){
				this.showMessage(this.noDataMessage);
			}else{
				this.showMessage();
			}
		}
		
	},
	
	expandoFetch: function(rowIndex, open){
		// summary:
		//		Function for fetch children of a given row
		if(this._loading){return;}
		this._loading = true;
		this.toggleLoadingClass(true);
		var item = this.cache.getItemByRowIndex(rowIndex);
		this.expandoRowIndex = rowIndex;
		this._pages = [];
		if(open){
			var parentId = this.store.getIdentity(item);
			var queryObj = {
				start: 0,
				count: this.keepRows,
				parentId: parentId,
				sort: this.getSortProps()
			};
			this.treeModel.getChildren(item, dojo.hitch(this, "_onExpandoComplete"), dojo.hitch(this, "_onFetchError"), queryObj);
		}else{
			this.cache.cleanChildren(rowIndex);
			for(var i = rowIndex + 1, len = this._by_idx.length; i < len; i++){
				delete this._by_idx[i];
			}
			this.updateRowCount(this.cache.items.length);
			if(this.cache.getTreePathByRowIndex(rowIndex + 1)){
				this._fetch(rowIndex + 1);
			}else{
				this._fetch(rowIndex);
			}
			this.toggleLoadingClass(false);
		}
	},
	
	_onExpandoComplete: function(childItems, request, size){
		var parentTreePath = this.cache.getTreePathByRowIndex(this.expandoRowIndex);
		if(size && !isNaN(parseInt(size, 10))){
			size = parseInt(size, 10);
		}else{
			size = childItems.length;
		}
		var i, j = 0, len = this._by_idx.length;
		for(i = this.expandoRowIndex + 1; j < size; i++, j++){
			this.cache.insertItem(i, {
				item: null,
				treePath: parentTreePath + "/" + j,
				expandoStatus: false
			});
		}
		this.updateRowCount(this.cache.items.length);
		
		for(i = this.expandoRowIndex + 1; i < len; i++){
			delete this._by_idx[i];
		}
		this.cache.updateCache(this.expandoRowIndex, {childrenNum: size});
		for(i = 0; i < size; i++){
			this.cache.updateCache(this.expandoRowIndex + 1 + i, {item: childItems[i]});
		}
		for(i = 0; i < Math.min(size, this.keepRows); i++){
			this._addItem(childItems[i], this.expandoRowIndex + 1 + i, false);
			this.updateRow(this.expandoRowIndex + 1 + i);
		}
		
		this.toggleLoadingClass(false);
		this.stateChangeNode = null;
		if(this._loading){
			this._loading = false;
		}
		if(size < this.keepRows && this.cache.getTreePathByRowIndex(this.expandoRowIndex + 1 + size)){
			this._fetch(this.expandoRowIndex + 1 + size);
		}
	},
	
	toggleLoadingClass: function(flag){
		// summary:
		//		set loading class when expanding/collapsing
		if(this.stateChangeNode){
			dojo.toggleClass(this.stateChangeNode, "dojoxGridExpandoLoading", flag);
		}
	},
	
	styleRowNode: function(inRowIndex, inRowNode){
		if(inRowNode){
			this.rows.styleRowNode(inRowIndex, inRowNode);
		}
	},
	
	onStyleRow: function(row){
		if(!this.layout._isCollapsable){
			this.inherited(arguments);
			return;
		}
		var base = dojo.attr(row.node, 'dojoxTreeGridBaseClasses');
		if(base){
			row.customClasses = base;
		}
		var i = row;
		i.customClasses += (i.odd ? " dojoxGridRowOdd" : "") + (i.selected ? " dojoxGridRowSelected" : "") + (i.over ? " dojoxGridRowOver" : "");
		this.focus.styleRow(i);
		this.edit.styleRow(i);
	},
	
	dokeydown: function(e){
		if(e.altKey || e.metaKey){
			return;
		}
		var dk = dojo.keys,
			target = e.target,
			expando = target && target.firstChild ? dijit.byId(target.firstChild.id) : null;
		if(e.keyCode === dk.ENTER && expando instanceof dojox.grid._LazyExpando){
			expando.onToggle();
		}
		this.onKeyDown(e);
	}
});

dojox.grid.LazyTreeGrid.markupFactory = function(props, node, ctor, cellFunc){
	return dojox.grid.TreeGrid.markupFactory(props, node, ctor, cellFunc);
};
