define([
	"dojo/_base/declare",
	"dojo/_base/query",
	"dojo/_base/array",
	"dojo/dom-construct",
	"dojo/dom-class",
	"dojo/_base/Deferred",
	"dojo/_base/sniff",
	"dojo/keys",
	"../core/_Module",
	"../util",
	"dojo/i18n!../nls/Body"
], function(declare, query, array, domConstruct, domClass, Deferred, sniff, keys, _Module, util, nls){

	var ga = 'getAttribute',
		sa = 'setAttribute';

	return _Module.register(
	declare(/*===== "gridx.modules.Body", =====*/_Module, {
		// summary:
		//		The body UI of grid.
		// description:
		//		This module is in charge of row rendering. It should be compatible with virtual/non-virtual scroll, 
		//		pagination, details on demand, and even tree structure.

		name: "body",
	
		optional: ['tree'],
	
		getAPIPath: function(){
			// tags:
			//		protected extended
			return {
				body: this
			};
		},

		preload: function(){
			// tags:
			//		protected extended
			var t = this, g = t.grid,
				dn = t.domNode = g.bodyNode;
			g._connectEvents(dn, '_onMouseEvent', t);
			t._initFocus();
		},

		load: function(args){
			// tags:
			//		protected extended
			var t = this, m = t.model, g = t.grid;
			t.batchConnect(
				[m, 'onDelete', '_onDelete'],
//                [m, 'onNew', '_onNew'],
				[m, 'onSet', '_onSet'],
				[m, 'onSizeChange', '_onSizeChange'],
				[g, 'onRowMouseOver', '_onRowMouseOver'],
				[g, 'onCellMouseOver', '_onCellMouseOver'],
				[g, 'onCellMouseOut', '_onCellMouseOver'],
				[g.bodyNode, 'onmouseleave', function(){
					var n = query('.gridxRowOver', t.domNode)[0];
					if(n){
						domClass.remove(n, 'gridxRowOver');
					}
				}],
				[g, 'setColumns', function(){
					t.refresh();
				}]
			);
			m.when({}, function(){
				var rc = t.rootCount;
				rc = t.rootCount = rc ? rc : m.size();
				t.visualCount = g.tree ? g.tree.getVisualSize(t.rootStart, rc) : rc;
				t.loaded.callback();
			});
		},

		destroy: function(){
			// tags:
			//		protected extended
			this.inherited(arguments);
			this.domNode.innerHTML = '';
		},
	
		rowMixin: {
			node: function(){
				return this.grid.body.getRowNode({
					rowId: this.id
				});
			},

			visualIndex: function(){
				var t = this, id = t.id;
				return t.grid.body.getRowInfo({
					rowId: id,
					rowIndex: t.index(),
					parentId: t.model.treePath(id).pop()
				}).visualIndex;
			}
		},
	
		cellMixin: {
			node: function(){
				return this.grid.body.getCellNode({
					rowId: this.row.id,
					cellId: this.column.id
				});
			}
		},
	
		//Public-----------------------------------------------------------------------------
		/*
		 * infoArgs: {
		 *		rowId
		 *		rowIndex
		 *		visualIndex
		 *		parentId
		 *		colId
		 *		colIndex
		 * }
		 */

		getRowNode: function(args){
			// summary:
			//		Get the DOM node of a row
			// args: gridx.__RowCellInfo
			//		A row info object containing row index or row id
			// returns:
			//		The DOM node of the row. Null if not found.
			var r = this._getRowNodeQuery(args);
			return r ? query(r, this.domNode)[0] || null : null;	//DOMNode|null
		},

		getCellNode: function(args){
			// summary:
			//		Get the DOM node of a cell
			// args: gridx.__RowCellInfo
			//		A cell info object containing sufficient info
			// returns:
			//		The DOM node of the cell. Null if not found.
			var t = this, colId = args.colId, r = t._getRowNodeQuery(args);
			if(r){
				if(!colId && typeof args.colIndex == "number"){
					colId = t.grid._columns[args.colIndex].id;
				}
				r += " [colid='" + colId + "'].gridxCell";
				return query(r, t.domNode)[0] || null;	//DOMNode|null
			}
			return null;	//null
		},

		getRowInfo: function(args){
			// summary:
			//		Get complete row info by partial row info
			// args: gridx.__RowCellInfo
			//		A row info object containing partial row info
			// returns:
			//		A row info object containing as complete as possible row info.
			var t = this, m = t.model, g = t.grid, id = args.rowId;
			if(id){
				args.rowIndex = m.idToIndex(id);
				args.parentId = m.treePath(id).pop();
			}
			if(typeof args.rowIndex == 'number' && args.rowIndex >= 0){
				args.visualIndex = g.tree ? g.tree.getVisualIndexByRowInfo(parentId, rowIndex, t.rootStart) : args.rowIndex - t.rootStart;
			}else if(typeof args.visualIndex == 'number' && args.visualIndex >= 0){
				if(g.tree){
					var info = g.tree.getRowInfoByVisualIndex(args.visualIndex, t.rootStart);
					args.rowIndex = info.start;
					args.parentId = info.parentId;
				}else{
					args.rowIndex = t.rootStart + args.visualIndex;
				} 
			}else{
				return args;	//gridx.__RowCellInfo
			}
			args.rowId = id || m.indexToId(args.rowIndex, args.parentId);
			return args;	//gridx.__RowCellInfo
		},
	
		refresh: function(start){
			// summary:
			//		Refresh the grid body
			// start: Integer?
			//		The visual row index to start refresh. If omitted, default to 0.
			// returns:
			//		A deferred object indicating when the refreshing process is finished.
			var t = this;
			return t.model.when({}).then(function(){	//dojo.Deferred
				var rs = t.renderStart, rc = t.renderCount;
				if(typeof start == 'number' && start >= 0){
					start = rs > start ? rs : start;
					var count = rs + rc - start,
						n = query('[visualindex="' + start + '"]', t.domNode)[0],
						uncachedRows = [], renderedRows = [];
					if(n){
						var rows = t._buildRows(start, count, uncachedRows, renderedRows);
						if(rows){
							domConstruct.place(rows, n, 'before');
							for(var i = 0, len = renderedRows.length; i < len; ++i){
								t.onAfterRow.apply(t, renderedRows[i]);
							}
						}
					}
					while(n){
						var tmp = n.nextSibling;
						domConstruct.destroy(n);
						n = tmp;
					}
					Deferred.when(t._buildUncachedRows(uncachedRows), function(){
						t.onRender(start, count);
					});
				}else{
					t.renderRows(rs, rc, 0, 1);
					t.onForcedScroll();
				}
			});
		},
	
		refreshCell: function(rowVisualIndex, columnIndex){
			// summary:
			//		Refresh a single cell
			// rowVisualIndex
			//		The visual index of the row of this cell
			// columnIndex
			//		The index of the column of this cell
			// returns:
			//		A deferred object indicating when this refreshing process is finished.
			var d = new Deferred(), t = this,
				m = t.model, g = t.grid,
				col = g._columns[columnIndex],
				cellNode = col && t.getCellNode({
					visualIndex: rowVisualIndex,
					colId: col.id
				});
			if(cellNode){
				var rowCache, rowInfo = t.getRowInfo({visualIndex: rowVisualIndex}),
					idx = rowInfo.rowIndex, pid = rowInfo.parentId;
				m.when({
					start: idx,
					count: 1,
					parentId: pid
				}, function(){
					rowCache = m.byIndex(idx, pid);
					if(rowCache){
						rowInfo.rowId = m.indexToId(idx, pid);
						var isPadding = g.tree && rowCache.data[col.id] === undefined;
						cellNode.innerHTML = t._buildCellContent(col, rowInfo, rowCache.data, isPadding);
						t.onAfterCell(cellNode, rowInfo, col, rowCache);
					}
				}).then(function(){
					d.callback(!!rowCache);
				});
				return d;	//dojo.Deferred
			}
			d.callback(0);
			return d;	//dojo.Deferred
		},
		
		//Package--------------------------------------------------------------------------------
		
		// rootStart: [readonly] Integer
		//		The row index of the first root row that logically exists in the current body
		rootStart: 0,

		// rootCount: [readonly] Integer
		//		The count of root rows that logically exist in thi current body
		rootCount: 0,
	
		// renderStart: [readonly] Integer
		//		The visual row index of the first renderred row in the current body
		renderStart: 0,
		// renderCount: [readonly] Integer
		//		The count of renderred rows in the current body.
		renderCount: 0,
	
		// visualStart: [readonly] Integer
		//		The visual row index of the first row that is logically visible in the current body.
		//		This should be always zero.
		visualStart: 0, 
		// visualCount: [readonly] Integer
		//		The count of rows that are logically visible in the current body
		visualCount: 0,
	
		//[read/write] Update grid body automatically when onNew/onSet/onDelete is fired
		autoUpdate: 1,
	
		autoChangeSize: 1,

		updateRootRange: function(start, count){
			// tags:
			//		private
			var t = this, tree = t.grid.tree,
				vc = t.visualCount = tree ? tree.getVisualSize(start, count) : count;
			t.rootStart = start;
			t.rootCount = count;
			if(t.renderStart + t.renderCount > vc){
				t.renderStart = vc - t.renderCount;
				if(t.renderStart < 0){
					t.renderStart = 0;
					t.renderCount = vc;
				}
			}
			if(!t.renderCount && vc){
				t.onForcedScroll();
			}
		},
	
		renderRows: function(start, count, position/*?top|bottom*/, isRefresh){
			// tags:
			//		private
			var t = this, g = t.grid, str = '', uncachedRows = [], 
				renderedRows = [], n = t.domNode, en = g.emptyNode;
			if(count > 0){
				en.innerHTML = '';
				if(position != 'top' && position != 'bottom'){
					t.model.free();
				}
				str = t._buildRows(start, count, uncachedRows, renderedRows);
				if(position == 'top'){
					t.renderCount += t.renderStart - start;
					t.renderStart = start;
					domConstruct.place(str, n, 'first');
				}else if(position == 'bottom'){
					t.renderCount = start + count - t.renderStart;
					domConstruct.place(str, n, 'last');
				}else{
					t.renderStart = start;
					t.renderCount = count;
					var scrollTop = isRefresh ? n.scrollTop : 0;
					n.scrollTop = 0;
					if(sniff('ie')){
						while(n.childNodes.length){
							n.removeChild(n.firstChild);
						}
					}
					n.innerHTML = str;
					n.scrollTop = scrollTop;
					n.scrollLeft = g.hScrollerNode.scrollLeft;
					en.innerHTML = str ? "" : nls.emptyInfo;
					t.onUnrender();
				}
				for(var i = 0, len = renderedRows.length; i < len; ++i){
					t.onAfterRow.apply(t, renderedRows[i]);
				}
				Deferred.when(t._buildUncachedRows(uncachedRows), function(){
					t.onRender(start, count);
				});
			}else if(!{top: 1, bottom: 1}[position]){
				n.scrollTop = 0;
				n.innerHTML = '';
				en.innerHTML = nls.emptyInfo;
				t.onUnrender();
				t.model.free();
			}
		},
	
		unrenderRows: function(count, preOrPost){
			// tags:
			//		private
			if(count > 0){
				var t = this, i = 0, id, bn = t.domNode;
				if(preOrPost == 'post'){
					for(; i < count && bn.lastChild; ++i){
						id = bn.lastChild[ga]('rowid');
						t.model.free(id);
						bn.removeChild(bn.lastChild);
						t.onUnrender(id);
					}
				}else{
					var tp = bn.scrollTop;
					for(; i < count && bn.firstChild; ++i){
						id = bn.firstChild[ga]('rowid');
						t.model.free(id);
						tp -= bn.firstChild.offsetHeight;
						bn.removeChild(bn.firstChild);
						t.onUnrender(id);
					}
					t.renderStart += i;
					bn.scrollTop = tp > 0 ? tp : 0;
				}
				t.renderCount -= i;
				//Force check cache size
				t.model.when();
			}
		},
	
		//Events--------------------------------------------------------------------------------
		//onBeforeRow: function(){},
		onAfterRow: function(){},
		onAfterCell: function(){},
		onRender: function(/*start, count*/){},
		onUnrender: function(){},
//        onNew: function(/*id, index, rowCache*/){},
		onDelete: function(/*id, index*/){},
		onSet: function(/*id, index, rowCache*/){},
		collectCellWrapper: function(wrappers, rowId, colId){},
		onMoveToCell: function(){},
		onForcedScroll: function(){},
	
		//Private---------------------------------------------------------------------------
		_getRowNodeQuery: function(args){
			var r;
			if(args.rowId){
				r = "[rowid='" + args.rowId + "']";
			}else if(typeof args.rowIndex == 'number' && args.rowIndex >= 0){
				r = "[rowindex='" + args.rowIndex + "']";
				if(args.parentId){
					r += "[parentid='" + args.parentId + "']";
				}
			}else if(typeof args.visualIndex == 'number' && args.visualIndex >= 0){
				r = "[visualindex='" + args.visualIndex + "']";
			}
			return r && r + '.gridxRow';
		},

		_buildRows: function(start, count, uncachedRows, renderedRows){
			var i, end = start + count, s = [], t = this, m = t.model, w = t.domNode.scrollWidth;
			for(i = start; i < end; ++i){
				var rowInfo = t.getRowInfo({visualIndex: i}),
					rowCache = m.byIndex(rowInfo.rowIndex, rowInfo.parentId);
				s.push('<div class="gridxRow ', i % 2 ? 'gridxRowOdd' : '',
					'" role="row" visualindex="', i);
				if(rowCache){
					m.keep(rowInfo.rowId);
					s.push('" rowid="', rowInfo.rowId,
						'" rowindex="', rowInfo.rowIndex,
						'" parentid="', rowInfo.parentId, 
						'">', t._buildCells(rowCache.data, rowInfo),
					'</div>');
					renderedRows.push([rowInfo, rowCache]);
				}else{
					s.push('"><div class="gridxRowDummy" style="width:', w, 'px;"></div></div>');
					rowInfo.start = rowInfo.rowIndex;
					rowInfo.count = 1;
					uncachedRows.push(rowInfo);
				}
			}
			return s.join('');
		},

		_buildUncachedRows: function(uncachedRows){
			return uncachedRows.length && this.model.when(uncachedRows, function(){
				for(var i = 0, len = uncachedRows.length; i < len; ++i){
					this._buildRowContent(uncachedRows[i]);
				}
			}, this);
		},
	
		_buildRowContent: function(rowInfo){
			var t = this, m = t.model, n = query('[visualindex="' + rowInfo.visualIndex + '"]', t.domNode)[0];
			if(n){
				var rowCache = m.byIndex(rowInfo.rowIndex, rowInfo.parentId);
				if(rowCache){
					rowInfo.rowId = m.indexToId(rowInfo.rowIndex, rowInfo.parentId);
					m.keep(rowInfo.rowId);
					n[sa]('rowid', rowInfo.rowId);
					n[sa]('rowindex', rowInfo.rowIndex);
					n[sa]('parentid', rowInfo.parentId || '');
					n.innerHTML = t._buildCells(rowCache.data, rowInfo);
					t.onAfterRow(rowInfo, rowCache);
				}else{
					console.error('Row is not in cache:', rowInfo.rowIndex);
				}
			}
		},
	
		_buildCells: function(rowData, rowInfo){
			var col, isPadding, t = this, g = t.grid, columns = g._columns,
				isFocusArea = g.focus && (g.focus.currentArea() == 'body'),
				sb = ['<table class="gridxRowTable" role="presentation" border="0" cellpadding="0" cellspacing="0"><tr>'];
			for(var i = 0, len = columns.length; i < len; ++i){
				col = columns[i];
				isPadding = g.tree && rowData[col.id] === undefined;
				sb.push('<td class="gridxCell ');
				if(isPadding){
					sb.push('gridxPaddingCell');
				}
				if(isFocusArea && t._focusCellRow === rowInfo.visualIndex && t._focusCellCol === i){
					sb.push('gridxCellFocus');
				}
				sb.push('" role="gridcell" tabindex="-1" colid="', col.id, 
					'" style="width: ', col.width, 
					'">', t._buildCellContent(col, rowInfo, rowData, isPadding),
				'</td>');
			}
			sb.push('</tr></table>');
			return sb.join('');
		}, 
	
		_buildCellContent: function(col, rowInfo, rowData, isPadding){
			var r = '';
			if(!isPadding){
				var s = col.decorator ? col.decorator(rowData[col.id], rowInfo.rowId, rowInfo.visualIndex) : rowData[col.id];
				r = this._wrapCellData(s, rowInfo.rowId, col.id);
			}
			return (!r && sniff('ie') < 8) ? '$nbsp;' : r;
		},

		_wrapCellData: function(cellData, rowId, colId){
			var wrappers = [];
			this.collectCellWrapper(wrappers, rowId, colId);
			var i = wrappers.length - 1;
			if(i > 0){
				wrappers.sort(function(a, b){
					return a.priority - b.priority;
				});
			}
			for(; i >= 0; --i){
				cellData = wrappers[i].wrap(cellData, rowId, colId);
			}
			return cellData;
		},
	
		//Events-------------------------------------------------------------
		_onMouseEvent: function(eventName, e){
			var g = this.grid,
				evtCell = 'onCell' + eventName,
				evtRow = 'onRow' + eventName;
			if(g._isConnected(evtCell) || g._isConnected(evtRow)){
				this._decorateEvent(e);
				if(e.rowId){
					if(e.columnId){
						g[evtCell](e);
					}
					g[evtRow](e);
				}
			}
		},
	
		_decorateEvent: function(e){
			var n = e.target || e.originalTarget, g = this.grid, tag;
			for(; n && n != g.bodyNode; n = n.parentNode){
				tag = n.tagName.toLowerCase();
				if(tag == 'td' && domClass.contains(n, 'gridxCell')){
					var col = g._columnsById[n[ga]('colid')];
					e.cellNode = n;
					e.columnId = col.id;
					e.columnIndex = col.index;
				}
				if(tag == 'div' && domClass.contains(n, 'gridxRow')){
					e.rowId = n[ga]('rowid');
					e.parentId = n[ga]('parentid');
					e.rowIndex = parseInt(n[ga]('rowindex'), 10);
					e.visualIndex = parseInt(n[ga]('visualindex'), 10);
					return;
				}
			}
		},
	
		//Store Notification-------------------------------------------------------------------
		_onSet: function(id, index, rowCache){
			var t = this;
			if(t.autoUpdate){
				var rowNode = t.getRowNode({rowId: id});
				if(rowNode && rowCache){
					var rowInfo = t.getRowInfo({rowId: id, rowIndex: index});
					rowNode.innerHTML = t._buildCells(rowCache.data, rowInfo);
					t.onAfterRow(rowInfo, rowCache);
					t.onSet(id, index, rowCache);
					t.onRender(index, 1);
				}
			}
		},
	
//        _onNew: function(/*id, index, rowCache*/){
			//don't know what to do here...
//        },
	
		_onDelete: function(id){
			var t = this;
			if(t.autoUpdate){
				var node = t.getRowNode({rowId: id});
				if(node){
					var sn, count = 0,
						start = parseInt(node[ga]('rowindex'), 10),
						pid = node[ga]('parentid'),
						pids = {id: 1},
						toDelete = [node],
						rid, ids = [id];
					for(sn = node.nextSibling; sn && pids[sn[ga]('parentid')]; sn = sn.nextSibling){
						rid = sn[ga]('rowid');
						ids.push(rid);
						toDelete.push(sn);
						pids[rid] = 1;
					}
					for(; sn; sn = sn.nextSibling){
						if(sn[ga]('parentid') == pid){
							sn[sa]('rowindex', parseInt(sn[ga]('rowindex'), 10) - 1);
						}
						sn[sa]('visualindex', parseInt(sn[ga]('visualindex'), 10) - 1);
						++count;
					}
					array.forEach(toDelete, domConstruct.destroy);
					array.forEach(ids, t.onUnrender, t);
					if(t.autoChangeSize && t.rootStart === 0 && !pid){
						t.updateRootRange(0, t.rootCount - 1);
					}
					t.onDelete(id, start);
					t.onRender(start, count);
				}
			}
		},
	
		_onSizeChange: function(size, oldSize){
			var t = this;
			if(t.autoChangeSize && t.rootStart === 0 && (t.rootCount === oldSize || oldSize < 0)){
				t.updateRootRange(0, size);
				//Avoid too much rendering when starting up. TODO: any better way?
//                if(t._started){
				t.refresh();
//                }
//                t._started = 1;
			}
		},
		
		//-------------------------------------------------------------------------------------
		_onRowMouseOver: function(e){
			var preNode = query('> div.gridxRowOver', this.domNode)[0],
				rowNode = this.getRowNode({rowId: e.rowId});
			if(preNode != rowNode){
				if(preNode){
					domClass.remove(preNode, 'gridxRowOver');
				}
				domClass.add(rowNode, 'gridxRowOver');
			}
		},
		
		_onCellMouseOver: function(e){
			domClass.toggle(e.cellNode, 'gridxCellOver', e.type == 'mouseover');
		},
	
		//Focus------------------------------------------------------------------------------------------
		_focusCellCol: 0,
		_focusCellRow: 0,

		_initFocus: function(){
			var t = this,
				g = t.grid,
				ltr = g.isLeftToRight(),
				bn = g.bodyNode,
				focus = g.focus,
				c = 'connect';
			if(focus){
				focus.registerArea({
					name: 'body',
					priority: 1,
					focusNode: bn,
					scope: t,
					doFocus: t._doFocus,
					doBlur: t._blurCell,
					onFocus: t._onFocus,
					onBlur: t._blurCell
				});
				t[c](g.mainNode, 'onkeypress', function(evt){
					if(focus.currentArea() == 'body' && (!g.tree || !evt.ctrlKey)){
						var dk = keys, arr = {}, dir = ltr ? 1 : -1;
						arr[dk.LEFT_ARROW] = [0, -dir, evt];
						arr[dk.RIGHT_ARROW] = [0, dir, evt];
						arr[dk.UP_ARROW] = [-1, 0, evt];
						arr[dk.DOWN_ARROW] = [1, 0, evt];
						t._moveFocus.apply(t, arr[evt.keyCode] || []);
					}
				});
				t[c](g, 'onCellClick', function(evt){
					t._focusCellRow = evt.visualIndex;
					t._focusCellCol = evt.columnIndex;
				});
				t[c](t, 'onRender', function(start, count){
					if(t._focusCellRow >= start && 
						t._focusCellRow < start + count &&
						focus.currentArea() == 'body'){
						t._focusCell();
					}
				});
				if(g.hScroller){
					t[c](bn, 'onscroll', function(){
						g.hScroller.scroll(!ltr && sniff('webkit') ?
							bn.scrollWidth - bn.offsetWidth - bn.scrollLeft :
							bn.scrollLeft);
					});
				}
			}
		},

		_doFocus: function(evt){
			return this._focusCell(evt) || this._focusCell(0, 0, 0);
		},

		_focusCell: function(evt, rowVisIdx, colIdx){
			util.stopEvent(evt);
			var t = this;
			colIdx = colIdx >= 0 ? colIdx : t._focusCellCol;
			rowVisIdx = rowVisIdx >= 0 ? rowVisIdx : t._focusCellRow;
			var n = t.getCellNode({
				visualIndex: rowVisIdx,
				colId: t.grid._columns[colIdx].id
			});
			if(n){
				var preNode = query('.gridxCellFocus', t.domNode)[0];
				if(n != preNode){
					if(preNode){
						domClass.remove(preNode, 'gridxCellFocus');
					}
					domClass.add(n, 'gridxCellFocus');
					t._focusCellRow = rowVisIdx;
					t._focusCellCol = colIdx;
				}
				//In IE7 focus cell node will scroll grid to the left most.
				if(!(sniff('ie') < 8)){
					n.focus();
				}
			}
			return n;
		},

		_moveFocus: function(rowStep, colStep, evt){
			if(rowStep || colStep){
				util.stopEvent(evt); //Prevent scrolling the whole page.
				var r, c, t = this, g = t.grid, 
					cols = g._columns, vc = t.visualCount;
				r = t._focusCellRow + rowStep;
				r = r < 0 ? 0 : (r >= vc ? vc - 1 : r);
				c = t._focusCellCol + colStep;
				c = c < 0 ? 0 : (c >= cols.length ? cols.length - 1 : c);
				g.vScroller.scrollToRow(r).then(function(){
					t._focusCell(0, r, c);
					t.onMoveToCell(r, c, evt);
				});
			}
		},

		_nextCell: function(r, c, dir, checker){
			var d = new Deferred(), g = this.grid,
				cc = g._columns.length,
				rc = this.visualCount;
			do{
				c += dir;
				if(c < 0 || c >= cc){
					r += dir;
					c = c < 0 ? cc - 1 : 0;
					if(r < 0){
						r = rc - 1;
						c = cc - 1;
					}else if(r >= rc){
						r = 0;
						c = 0;
					}
				}
			}while(!checker(r, c));
			g.vScroller.scrollToRow(r).then(function(){
				d.callback({r: r, c: c});
			});
			return d;
		},

		_blurCell: function(){
			var n = query('.gridxCellFocus', this.domNode)[0];
			if(n){
				domClass.remove(n, 'gridxCellFocus');
			}
			return true;
		},

		_onFocus: function(evt){
			for(var n = evt.target, t = this; n && n != t.domNode; n = n.parentNode){
				if(domClass.contains(n, 'gridxCell')){
					var colIndex = t.grid._columnsById[n[ga]('colid')].index;
					while(!domClass.contains(n, 'gridxRow')){
						n = n.parentNode;
					}
					return t._focusCell(0, parseInt(n[ga]('visualindex'), 10), colIndex);
				}
			}
			return false;
		}
	}));
});
