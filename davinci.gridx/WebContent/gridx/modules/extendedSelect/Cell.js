define([
	"dojo/_base/declare",
	"dojo/_base/array",
	"dojo/_base/query",
	"dojo/_base/lang",
	"dojo/_base/Deferred",
	"dojo/_base/sniff",
	"dojo/dom-class",
	"dojo/mouse",
	"dojo/keys",
	"../../core/_Module",
	"./_RowCellBase"
], function(declare, array, query, lang, Deferred, sniff, domClass, mouse, keys, _Module, _RowCellBase){

	var isArrayLike = lang.isArrayLike;

	function createItem(rowId, visualIndex, columnId, columnIndex){
		return {
			rid: rowId,
			r: visualIndex,
			cid: columnId,
			c: columnIndex
		};
	}

	return _Module.register(
	declare(/*===== "gridx.modules.extendedSelect.Cell", =====*/_RowCellBase, {
		// summary:
		//		Provides advanced cell selections.
		// description:
		//		This module provides an advanced way for selecting cells by clicking, swiping, SPACE key, or CTRL/SHIFT CLICK to select multiple cell.
		//
		// example:
		//		1. Use select api on cell object obtained from grid.cell(i,j)
		//		|	grid.cell(1,1).select();
		//		|	grid.cell(1,1).deselect();
		//		|	grid.cell(1,1).isSelected();
		//
		//		2. Use select api on select.cell module
		//		|	grid.select.cell.selectById(columnId);
		//		|	grid.select.cell.deSelectById(columnId);
		//		|	grid.select.cell.isSelected(columnId);
		//		|	grid.select.cell.getSelected();//[]
		//		|	grid.select.cell.clear();

		// name: [readonly] String
		//		module name
		name: 'selectCell',

		// cellMixin: Object
		//		A map of functions to be mixed into grid cell object, so that we can use select api on column object directly
		//		- grid.cell(1,1).select() | deselect() | isSelected();
		cellMixin: {
			select: function(){
				this.grid.select.cell.selectByIndex(this.row.index(), this.column.index());
				return this;
			},
			deselect: function(){
				this.grid.select.cell.deselectByIndex(this.row.index(), this.column.index());
				return this;
			},
			isSelected: function(){
				return this.grid.select.cell.isSelected(this.row.id, this.column.id);
			}
		},
		
		//Public-----------------------------------------------------------------
/*=====
		selectById: function(rowId, columnId){
			// summary:
			//		Select a cell by (rowId, columnId)
		},
		
		deselectById: function(columnId){
			// summary:
			//		Deselect a cell by (rowId, columnId)
		},
		
		selectByIndex: function(rowIndex, columnIndex){
			// summary:
			//		Select a cess by (rowIndex, columnIndex)
		},
		
		deSelectByIndex: function(rowIndex, columnIndex){
			// summary:
			//		Deselect a cell by (rowIndex, columnIndex)
		},		
=====*/
		getSelected: function(){
			// summary:
			//		Get an array of selected cells e.g.[['row1', 'col1'], ['row2', 'col2']]
			var t = this, res = [];
			array.forEach(t.grid._columns, function(col){
				var ids = t.model.getMarkedIds(t._getMarkType(col.id));
				res.push.apply(res, array.map(ids, function(rid){
					return [rid, col.id];
				}));
			});
			return res;
		},

		clear: function(silent){
			// summary:
			//		Deselected all selected cells	
			var t = this;
			query(".gridxCellSelected", t.grid.bodyNode).forEach(function(node){
				domClass.remove(node, 'gridxCellSelected');
			});
			array.forEach(t.grid._columns, function(col){
				t.model.clearMark(t._getMarkType(col.id));
			});
			if(!silent){
				t._onSelectionChange();
			}
		},

		isSelected: function(rowId, columnId){
			// summary:
			//		Check if the given cell is selected.			
			return this.model.isMarked(rowId, this._getMarkType(columnId));
		},
		
		//Private---------------------------------------------------------------------
		_type: 'cell',

		_markTypePrefix: "select_",

		_getMarkType: function(colId){
			var type = this._markTypePrefix + colId;
			this.model._spTypes[type] = 1;
			return type;
		},

		_markById: function(args, toSelect){
			if(!isArrayLike(args[0])){
				args = [args];
			}
			var t = this, columns = t.grid._columnsById, model = t.model;
			array.forEach(args, function(cell){
				var rowId = cell[0], colId = cell[1];
				if(rowId && columns[colId]){
					model.markById(rowId, toSelect, t._getMarkType(colId));
				}
			});
			model.when();
		},

		_markByIndex: function(args, toSelect){
			if(!isArrayLike(args[0])){
				args = [args];
			}
			args = array.filter(args, function(arg){
				if(isArrayLike(arg) && arg.length >= 2 && 
					arg[0] >= 0 && arg[0] < Infinity && arg[1] >= 0 && arg[1] < Infinity){
					if(arg.length >= 4 && arg[2] >= 0 && arg[2] < Infinity && arg[3] >= 0 && arg[3] < Infinity){
						arg._range = 1;	//1 as true
					}
					return true;
				}
			});
			var t = this,
				m = t.model,
				g = t.grid,
				columns = g._columns,
				body = g.body,
				i, j, col, type;
			array.forEach(args, function(arg){
				if(arg._range){
					var a = Math.min(arg[0], arg[2]),
						b = Math.max(arg[0], arg[2]),
						n = b - a + 1,
						c1 = Math.min(arg[1], arg[3]),
						c2 = Math.max(arg[1], arg[3]);
					for(i = c1; i <= c2; ++i){
						col = columns[i];
						if(col){
							a = body.getRowInfo({visualIndex: a}).rowIndex;
							type = t._getMarkType(col.id);
							for(j = 0; j < n; ++j){
								m.markByIndex(j, toSelect, type);
							}
						}
					}
				}else{
					col = columns[arg[1]];
					if(col){
						i = body.getRowInfo({visualIndex: arg[0]}).rowIndex;
						m.markByIndex(i, toSelect, t._getMarkType(col.id));
					}
				}
			});
			return m.when();
		},

		_init: function(){
			var t = this, g = t.grid;
			t.inherited(arguments);
			t.batchConnect(
				[g, 'onCellMouseDown', function(e){
					if(mouse.isLeft(e)){
						t._start(createItem(e.rowId, e.visualIndex, e.columnId, e.columnIndex), e.ctrlKey, e.shiftKey);
					}
				}],
				[g, 'onCellMouseOver', function(e){
					t._highlight(createItem(e.rowId, e.visualIndex, e.columnId, e.columnIndex));
				}],
				[g, sniff('ff') < 4 ? 'onCellKeyUp' : 'onCellKeyDown', function(e){
					if(e.keyCode === keys.SPACE){
						t._start(createItem(e.rowId, e.visualIndex, e.columnId, e.columnIndex), e.ctrlKey, e.shiftKey);
						t._end();
					}
				}]
			);
		},

		_onRender: function(start, count){
			var t = this, i, 
				m = t.model,
				g = t.grid,
				cols = g._columns,
				end = start + count;
			for(i = 0; i < cols.length; ++i){
				var cid = cols[i].id,
					type = t._getMarkType(cid);
				if(m.getMarkedIds(type).length){
					for(j = start; j < end; ++j){
						var rid = t._getRowId(j);
						if(m.isMarked(rid, type) || (t._selecting && t._toSelect &&
							t._inRange(i, t._startItem.c, t._currentItem.c, 1) &&	//1 as true
							t._inRange(j, t._startItem.r, t._currentItem.r, 1))){	//1 as true
							domClass.add(query('[visualindex="' + j + '"] [colid="' + cid + '"]', g.bodyNode)[0], 'gridxCellSelected');
						}
					}
				}
			}
		},

		_onMark: function(toMark, id, type){
			var t = this;
			if(!t._marking && type.indexOf(t._markTypePrefix) === 0){
				var rowNode = query('[rowid="' + id + '"]', t.grid.bodyNode)[0];
				if(rowNode){
					var cid = type.substr(t._markTypePrefix.length),
						node = query('[colid="' + cid + '"]', rowNode)[0];
					if(node){
						domClass.toggle(node, 'gridxCellSelected', toMark);
					}
				}
			}
		},

		_onMoveToCell: function(rowVisIndex, colIndex, e){
			if(e.shiftKey){
				var t = this,
					rid = t._getRowId(rowVisIndex),
					cid = t.grid._columns[colIndex].id;
				t._start(createItem(rid, rowVisIndex, cid, colIndex), e.ctrlKey, 1);	//1 as true
				t._end();
			}
		},

		_isSelected: function(item){
			var t = this;
			if(!item.rid){
				item.rid = t._getRowId(item.r);
			}
			if(t._isRange){
				var rids = t._refSelectedIds[item.cid];
				return rids && array.indexOf(rids, item.rid) >= 0;
			}else{
				return t.model.isMarked(item.rid, t._getMarkType(item.cid));
			}
		},

		_highlight: function(target){
			var t = this,
				current = t._currentItem;
			if(t._selecting){
				if(current === null){
					//First time select.
					t._highlightSingle(target, 1);	//1 as true
				}else{
					var start = t._startItem,
						highlight = function(from, to, toHL){
							var colDir = to.c > from.c ? 1 : -1,
								rowDir = to.r > from.r ? 1 : -1,
								i, j, rids = {};
							if(!toHL){
								for(j = from.r, p = to.r + rowDir; j != p; j += rowDir){
									rids[j] = t.model.indexToId(j);
								}
							}
							for(i = from.c, q = to.c + colDir; i != q; i += colDir){
								var cid = t.grid._columns[i].id;
								for(j = from.r, p = to.r + rowDir; j != p; j += rowDir){
									t._highlightSingle(createItem(rids[j], j, cid, i), toHL);
								}
							}
						};
					if(t._inRange(target.r, start.r, current.r) ||
						t._inRange(target.c, start.c, current.c) ||
						t._inRange(start.r, target.r, current.r) ||
						t._inRange(start.c, target.c, current.c)){
						highlight(start, current, 0);	//0 as false
					}
					highlight(start, target, 1);	//1 as true
					t._focus(target);
				}
				t._currentItem = target;
			}
		},

		_doHighlight: function(item, toHighlight){
			var i, j, rowNodes = this.grid.bodyNode.childNodes;
			for(i = rowNodes.length - 1; i >= 0; --i){
				if(rowNodes[i].getAttribute('visualindex') == item.r){
					var cellNodes = rowNodes[i].getElementsByTagName('td');
					for(j = cellNodes.length - 1; j >= 0; --j){
						if(cellNodes[j].getAttribute('colid') == item.cid){
							domClass.toggle(cellNodes[j], 'gridxCellSelected', toHighlight);
							return;
						}
					}
					return;
				}
			}
		},

		_focus: function(target){
			if(this.grid.focus){
				this.grid.body._focusCell(null, target.r, target.c);
			}
		},

		_getSelectedIds: function(){
			var t = this, res = {};
			array.forEach(t.grid._columns, function(col){
				var ids = t.model.getMarkedIds(t._getMarkType(col.id));
				if(ids.length){
					res[col.id] = ids;
				}
			});
			return res;
		},
		
		_beginAutoScroll: function(){},

		_endAutoScroll: function(){},

		_addToSelected: function(start, end, toSelect){
			var t = this,
				model = t.model,
				d = new Deferred(),
				lastEndItem = t._lastEndItem,
				a, b, colDir, i, j,
				packs = [],
				finish = function(){
					model.when().then(function(){
						d.callback();
					});
				};
			if(!t._isRange){
				t._refSelectedIds = t._getSelectedIds();
			}
			if(t._isRange){
				if(t._inRange(end.r, start.r, lastEndItem.r)){
					a = Math.min(end.r, lastEndItem.r);
					b = Math.max(end.r, lastEndItem.r);
					packs.push({
						start: a + 1,
						count: b - a,
						columnStart: start.c,
						columnEnd: lastEndItem.c
					});
				}
				if(t._inRange(end.c, start.c, lastEndItem.c)){
					colDir = end.c < lastEndItem.c ? 1 : -1;
					a = Math.min(start.r, end.r);
					b = Math.max(start.r, end.r);
					packs.push({
						start: a,
						count: b - a + 1,
						columnStart: end.c + colDir,
						columnEnd: lastEndItem.c
					});
				}
			}
			colDir = start.c < end.c ? 1 : -1;
			for(i = start.c; i != end.c + colDir; i += colDir){
				var cid = t.grid._columns[i].id,
					type = t._getMarkType(cid);
				a = Math.min(start.r, end.r);
				b = Math.max(start.r, end.r);
				for(j = a; j <= b; ++j){
					model.markByIndex(j, toSelect, type);
				}
			}
			if(packs.length){
				model.when(packs, function(){
					var i, j, k, pack;
					for(i = 0; i < packs.length; ++i){
						pack = packs[i];
						var colDir = pack.columnStart < pack.columnEnd ? 1 : -1;
						for(j = pack.columnStart; j != pack.columnEnd + colDir; j += colDir){
							var cid = t.grid._columns[j].id,
								type = t._getMarkType(cid),
								rids = t._refSelectedIds[cid];
							for(k = pack.start; k < pack.start + pack.count; ++k){
								var rid = model.indexToId(k),
									selected = rids && rids[rid];
								model.markById(rid, selected, type);
							}
						}
					}
				}).then(finish);
			}else{
				finish();
			}
			return d;
		}
	}));
});
