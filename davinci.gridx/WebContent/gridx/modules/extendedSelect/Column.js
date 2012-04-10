define([
	"dojo/_base/declare",
	"dojo/_base/array",
	"dojo/_base/query",
	"dojo/_base/lang",
	"dojo/_base/sniff",
	"dojo/dom-class",
	"dojo/mouse",
	"dojo/keys",
	"../../core/_Module",
	"./_Base"
], function(declare, array, query, lang, sniff, domClass, mouse, keys, _Module, _Base){

	return _Module.register(
	declare(/*===== "gridx.modules.extendedSelect.Column", =====*/_Base, {
		// summary:
		//		Provides advanced column selections.
		// description:
		//		This module provides an advanced way for selecting columns by clicking, swiping, SPACE key, or CTRL/SHIFT CLICK to select multiple columns.
		//
		// example:
		//		1. Use select api on column object obtained from grid.column(i)
		//		|	grid.column(1).select();
		//		|	grid.column(1).deselect();
		//		|	grid.column(1).isSelected();
		//
		//		2. Use select api on select.row module
		//		|	grid.select.column.selectById(columnId);
		//		|	grid.select.column.deSelectById(columnId);
		//		|	grid.select.column.isSelected(columnId);
		//		|	grid.select.column.getSelected();//[]
		//		|	grid.select.column.clear();

		// name: [readonly] String
		//		module name
		name: 'selectColumn',

//        optional: ['columnResizer'],

		// columnMixin: Object
		//		A map of functions to be mixed into grid column object, so that we can use select api on column object directly
		//		- grid.column(1).select() | deselect() | isSelected();
		columnMixin: {
			select: function(){
				this.grid.select.column.selectById(this.id);
				return this;
			},
			deselect: function(){
				this.grid.select.column.deselectById(this.id);
				return this;
			},
			isSelected: function(){
				return this.grid._columnsById[this.id]._selected;
			}
		},

		//Public-----------------------------------------------------------------
/*=====
		selectById: function(columnId){
			// summary:
			//		Select a column by id.
		},
		
		deselectById: function(columnId){
			// summary:
			//		Deselect a column by id.
		},
		
		selectByIndex: function(columnIndex){
			// summary:
			//		Select a column by index
		},
		
		deSelectByIndex: function(columnIndex){
			// summary:
			//		Deselect a column by index.
		},		
=====*/
		
		getSelected: function(){
			// summary:
			//		Get id array of all selected columns
			return array.map(array.filter(this.grid._columns, function(col){
				return col._selected;
			}), function(col){
				return col.id;
			});
		},

		clear: function(silent){
			// summary:
			//		Deselected all selected columns;			
			query(".gridxColumnSelected", this.grid.domNode).forEach(function(node){
				domClass.remove(node, 'gridxColumnSelected');
			});
			array.forEach(this.grid._columns, function(col){
				col._selected = 0;	//0 as false
			});
			if(!silent){
				this._onSelectionChange();
			}
		},

		isSelected: function(){
			// summary:
			//		Check if the given column(s) are all selected.			
			var cols = this.grid._columnsById;
			return array.every(arguments, function(id){
				var col = cols[id];
				return col && col._selected;
			});
		},
		
		//Private---------------------------------------------------------------
		_type: 'column',

		_markById: function(args, toSelect){
			array.forEach(args, function(colId){
				var col = this.grid._columnsById[colId];
				if(col){
					col._selected = toSelect;
					this._doHighlight({column: col.index}, toSelect);
				}
			}, this);
		},

		_markByIndex: function(args, toSelect){
			var i, col, columns = this.grid._columns;
			for(i = 0; i < args.length; ++i){
				var arg = args[i];
				if(lang.isArrayLike(arg)){
					var start = arg[0],
						end = arg[1],
						count;
					if(start >= 0 && start < Infinity){
						if(!(end >= start && end < Infinity)){
							end = columns.length - 1;
						}
						for(; start < end + 1; ++start){
							col = columns[start];
							if(col){
								col._selected = toSelect;
								this._doHighlight({column: col.index}, toSelect);
							}
						}
					}
				}else if(arg >= 0 && arg < Infinity){
					col = columns[arg];
					if(col){
						col._selected = toSelect;
						this._doHighlight({column: arg}, toSelect);
					}
				}
			}
		},
		
		_init: function(){
			var t = this, g = t.grid;
			t.batchConnect(
				[g, 'onHeaderCellMouseDown', function(e){
					if(mouse.isLeft(e) && !domClass.contains(e.target, 'gridxArrowButtonNode')){
						t._start({column: e.columnIndex}, e.ctrlKey, e.shiftKey);
					}
				}],
				[g, 'onHeaderCellMouseOver', function(e){
					t._highlight({column: e.columnIndex});
				}],
				[g, 'onCellMouseOver', function(e){
					t._highlight({column: e.columnIndex});
				}],
				[g, sniff('ff') < 4 ? 'onHeaderCellKeyUp' : 'onHeaderCellKeyDown', function(e){
					if((e.keyCode == keys.SPACE || e.keyCode == keys.ENTER) && !domClass.contains(e.target, 'gridxArrowButtonNode')){
						t._start({column: e.columnIndex}, e.ctrlKey, e.shiftKey);
						t._end();
					}
				}],
				[g.header, 'onMoveToHeaderCell', '_onMoveToHeaderCell']
			);
		},

		_onRender: function(start, count){
			var i, j, end = start + count, g = this.grid, bn = g.bodyNode, node,
				cols = array.filter(g._columns, function(col){
					return col._selected;
				});
			for(i = cols.length - 1; i >= 0; --i){
				for(j = start; j < end; ++j){
					node = query(['[visualindex="', j, '"] [colid="', cols[i].id, '"]'].join(''), bn)[0];
					domClass.add(node, 'gridxColumnSelected');
				}
			}
		},

		_onMoveToHeaderCell: function(columnId, e){
			if(e.shiftKey && (e.keyCode == keys.LEFT_ARROW || e.keyCode == keys.RIGHT_ARROW)){
				var t = this, col = t.grid._columnsById[columnId];
				t._start({column: col.index}, e.ctrlKey, 1);	//1 as true
				t._end();
			}
		},

		_isSelected: function(target){
			var t = this, col = t.grid._columns[target.column], id = col.id;
			return t._isRange ? array.indexOf(t._refSelectedIds, id) >= 0 : col._selected;
		},

		_beginAutoScroll: function(){
			var autoScroll = this.grid.autoScroll;
			this._autoScrollV = autoScroll.vertical;
			autoScroll.vertical = false;
		},

		_endAutoScroll: function(){
			this.grid.autoScroll.vertical = this._autoScrollV;
		},

		_doHighlight: function(target, toHighlight){
			query('[colid="' + this.grid._columns[target.column].id + '"].gridxCell', this.grid.domNode).forEach(function(node){
				domClass.toggle(node, 'gridxColumnSelected', toHighlight);
			});
		},

		_focus: function(target){
			var g = this.grid;
			if(g.focus){
				//Seems breaking encapsulation...
				g.header._focusNode(query('[colid="' + g._columns[target.column].id + '"].gridxCell', g.header.domNode)[0]);
			}
		},

		_addToSelected: function(start, end, toSelect){
			var t = this, g = t.grid, a, i;
			if(!t._isRange){
				t._refSelectedIds = t.getSelected();
			}
			if(t._isRange && t._inRange(end.column, start.column, t._lastEndItem.column)){
				start = Math.min(end.column, t._lastEndItem.column);
				end = Math.max(end.column, t._lastEndItem.column);
				for(i = start; i <= end; ++i){
					g._columns[i]._selected = array.indexOf(t._refSelectedIds, g._columns[i].id) >= 0;
				}
			}else{
				a = Math.min(start.column, end.column);
				end = Math.max(start.column, end.column);
				start = a;
				for(i = start; i <= end; ++i){
					g._columns[i]._selected = toSelect;
				}
			}
		}
	}));
});
