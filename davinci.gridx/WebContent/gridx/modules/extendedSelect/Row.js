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

	return _Module.register(
	declare(/*===== "gridx.modules.extendedSelect.Row", =====*/_RowCellBase, {
		// summary:
		//		Provides advanced row selections.
		// description:
		//		This module provides an advanced way for selecting rows by clicking, swiping, SPACE key, or CTRL/SHIFT CLICK to select multiple rows.
		//
		// example:
		//		1. Use select api on grid row object obtained from grid.row(i)
		//		|	grid.row(1).select();
		//		|	grid.row(1).deselect();
		//		|	grid.row(1).isSelected();
		//
		//		2. Use select api on select.row module
		//		|	grid.select.row.selectById(rowId);
		//		|	grid.select.row.deSelectById(rowId);
		//		|	grid.select.row.isSelected(rowId);
		//		|	grid.select.row.getSelected();//[]
		//		|	grid.select.row.clear();

		// name: [readonly] String
		//		module name		
		name: 'selectRow',

		// rowMixin: Object
		//		A map of functions to be mixed into grid row object, so that we can use select api on row object directly
		//		- grid.row(1).select() | deselect() | isSelected();
		rowMixin: {
			select: function(){
				this.grid.select.row.selectById(this.id);
				return this;
			},
			deselect: function(){
				this.grid.select.row.deselectById(this.id);
				return this;
			},
			isSelected: function(){
				return this.model.isMarked(this.id);
			}
		},
		
		//Public-----------------------------------------------------------------
		
		// triggerOnCell: [readonly] Boolean
		//		Whether row will be selected by clicking on cell, false by default		
		triggerOnCell: false,
		
/*=====
		selectById: function(rowId){
			// summary:
			//		Select a row by id.
		},
		
		deselectById: function(rowId){
			// summary:
			//		Deselect a row by id.
		},
		
		selectByIndex: function(rowIndex){
			// summary:
			//		Select a row by index
		},
		
		deSelectByIndex: function(rowIndex){
			// summary:
			//		Deselect a row by index.
		},
		
=====*/
		getSelected: function(){
			// summary:
			//		Get id array of all selected rows
			return this.model.getMarkedIds();
		},

		isSelected: function(){
			// summary:
			//		Check if the given rows are all selected.
			return array.every(arguments, function(id){
				return this.model.isMarked(id);
			}, this);
		},

		clear: function(silent){
			// summary:
			//		Deselected all selected rows;			
			query(".gridxRowSelected", this.grid.bodyNode).forEach(function(node){
				domClass.remove(node, 'gridxRowSelected');
			});
			this.model.clearMark();
			if(!silent){
				this._onSelectionChange();
			}
		},

		onHighlightChange: function(){},
		
		//Private---------------------------------------------------------------------
		_type: 'row',

		_init: function(){
			var t = this, g = t.grid;
			t.inherited(arguments);
			//Use special types to make filtered out rows unselected
			t.model._spTypes.select = 1;	//1 as true
			t.batchConnect(
				g.rowHeader && [g.rowHeader, 'onMoveToRowHeaderCell', '_onMoveToRowHeaderCell'],
				[g, 'onRowMouseDown', function(e){
					if(mouse.isLeft(e) && (t.arg('triggerOnCell') || !e.columnId)){
						t._isOnCell = e.columnId;
						t._start({row: e.visualIndex}, e.ctrlKey, e.shiftKey);
					}
				}],
				[g, 'onRowMouseOver', function(e){
					if(t._selecting && t.arg('triggerOnCell') && e.columnId){
						g.body._focusCellCol = e.columnIndex;
					}
					t._highlight({row: e.visualIndex});
				}],
				[g, sniff('ff') < 4 ? 'onRowKeyUp' : 'onRowKeyDown', function(e){
					if((t.arg('triggerOnCell') || !e.columnId) && e.keyCode === keys.SPACE){
						t._isOnCell = e.columnId;
						t._start({row: e.visualIndex}, e.ctrlKey, e.shiftKey);
						t._end();
					}
				}]
			);
		},

		_markById: function(args, toSelect){
			var m = this.model;
			array.forEach(args, function(arg){
				m.markById(arg, toSelect);
			});
			m.when();
		},

		_markByIndex: function(args, toSelect){
			var g = this.grid,
				m = this.model,
				body = g.body;
			array.forEach(args, function(arg){
				if(lang.isArrayLike(arg)){
					var start = arg[0],
						end = arg[1],
						i, count;
					if(start >= 0 && start < Infinity){
						if(end >= start && end < Infinity){
							count = end - start + 1;
						}else{
							count = body.visualCount - start;
						}
						start = body.getRowInfo({visualIndex: start}).rowIndex;
						for(i = 0; i < count; ++i){
							m.markByIndex(i + start, toSelect);	
						}
					}
				}else if(arg >= 0 && arg < Infinity){
					arg = body.getRowInfo({visualIndex: arg}).rowIndex;
					m.markByIndex(arg, toSelect);
				}
			});
			return m.when();
		},

		_onRender: function(start, count){
			var t = this, i, end = start + count;
			for(i = start; i < end; ++i){
				var item = {row: i};
				if(t._isSelected(item) || (t._selecting && t._toSelect && 
					t._inRange(i, t._startItem.row, t._currentItem.row, 1))){	//1 as true
					t._doHighlight(item, 1);	//1 as true
				}
			}
		},

		_onMark: function(toMark, id, type){
			if(type == 'select' && !this._marking){
				var node = query('[rowid="' + id + '"]', this.grid.bodyNode)[0];
				if(node){
					domClass.toggle(node, 'gridxRowSelected', toMark);
					this.onHighlightChange({row: parseInt(node.getAttribute('visualindex'), 10)}, !!toMark);
				}
			}
		},

		_onMoveToCell: function(rowVisIndex, colIndex, e){
			var t = this;
			if(t.arg('triggerOnCell') && e.shiftKey && (e.keyCode == keys.UP_ARROW || e.keyCode == keys.DOWN_ARROW)){
				t._start({row: rowVisIndex}, e.ctrlKey, 1);	//1 as true
				t._end();
			}
		},

		_onMoveToRowHeaderCell: function(rowVisIndex, e){
			if(e.shiftKey){
				this._start({row: rowVisIndex}, e.ctrlKey, 1);	//1 as true
				this._end();
			}
		},

		_isSelected: function(target){
			var t = this,
				id = t._getRowId(target.row);
			return t._isRange ? array.indexOf(t._refSelectedIds, id) >= 0 : t.model.isMarked(id);
		},

		_beginAutoScroll: function(){
			var autoScroll = this.grid.autoScroll;
			this._autoScrollH = autoScroll.horizontal;
			autoScroll.horizontal = false;
		},

		_endAutoScroll: function(){
			this.grid.autoScroll.horizontal = this._autoScrollH;
		},

		_doHighlight: function(target, toHighlight){
			query('[visualindex="' + target.row + '"]', this.grid.bodyNode).forEach(function(node){
				domClass.toggle(node, 'gridxRowSelected', toHighlight);
			});
			this.onHighlightChange(target, toHighlight);
		},

		_end: function(){
			this.inherited(arguments);
			delete this._isOnCell;
		},

		_focus: function(target){
			var g = this.grid, focus = g.focus;
			if(focus){
				g.body._focusCellRow = target.row;
				focus.focusArea(this._isOnCell ? 'body' : 'rowHeader', true);
			}
		},

		_addToSelected: function(start, end, toSelect){
			var t = this, bd = t.grid.body, m = t.model, a, b, i, lastEndItem = t._lastEndItem;
			if(!t._isRange){
				t._refSelectedIds = m.getMarkedIds();
			}
			if(t._isRange && t._inRange(end.row, start.row, lastEndItem.row)){
				a = Math.min(end.row, lastEndItem.row);
				b = Math.max(end.row, lastEndItem.row);
				start = bd.getRowInfo({visualIndex: a}).rowIndex + 1;
				end = bd.getRowInfo({visualIndex: b}).rowIndex;
				return m.when({
					start: start, 
					count: end - start + 1
				}, function(){
					for(i = start; i <= end; ++i){
						var id = m.indexToId(i),
							selected = array.indexOf(t._refSelectedIds, id) >= 0;
						m.markById(id, selected); 
					}
				});
			}else{
				a = Math.min(start.row, end.row);
				b = Math.max(start.row, end.row);
				start = bd.getRowInfo({visualIndex: a}).rowIndex;
				end = bd.getRowInfo({visualIndex: b}).rowIndex;
				for(i = start; i <= end; ++i){
					m.markByIndex(i, toSelect);
				}
				return m.when();
			}
		}
	}));
});
