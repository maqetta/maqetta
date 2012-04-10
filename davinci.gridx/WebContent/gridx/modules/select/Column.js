define([
	"dojo/_base/declare",
	"dojo/_base/query",
	"dojo/_base/array",
	"dojo/_base/sniff",
	"dojo/dom-class",
	"dojo/keys",
	"./_Base",
	"../../core/_Module"
], function(declare, query, array, sniff, domClass, keys, _Base, _Module){

	return _Module.register(
	declare(/*===== "gridx.modules.select.Column", =====*/_Base, {
		// summary:
		//		Provides simple column selection.
		// description:
		//		This module provides a simple way for selecting columns by clicking or SPACE key, or CTRL + Click to select multiple columns.
		//
		// example:
		//		1. Use select api on grid column object obtained from grid.column(i)
		//		|	grid.column(1).select();
		//		|	grid.column(1).deselect();
		//		|	grid.column(1).isSelected();
		//
		//		2. Use select api on select.column module
		//		|	grid.select.column.selectById(columnId);
		//		|	grid.select.column.deSelectById(columnId);
		//		|	grid.select.column.isSelected(columnId);
		//		|	grid.select.column.getSelected();//[]
		//		|	grid.select.column.clear();

		// name: [readonly] String
		//		module name
		name: "selectColumn",

		// columnMixin: Object
		//		A map of functions to be mixed into grid column object, so that we can use select api on column object directly
		//		- grid.column(1).select() | deselect() | isSelected();
		columnMixin: {
			select: function(){
				this.grid.select.column._markById(this.id, 1);
				return this;
			},
			deselect: function(){
				this.grid.select.column._markById(this.id, 0);
				return this;
			},
			isSelected: function(){
				return this.grid.select.column.isSelected(this.id);
			}
		},
		
		//Public API----------------------------------------------------------------------
		selectById: function(/*String*/id){
			// summary:
			//		Select target column by id
			this._markById(id, 1);
		},
		
		deselectById: function(/*String*/id){
			// summary:
			//		Deselect target column by id
			this._markById(id, 0);
		},
		
		isSelected: function(/*String*/id){
			// summary:
			//		Check if a column is selected 
			var c = this.grid._columnsById[id];
			return !!(c && c._selected);
		},
		
		getSelected: function(){
			// summary:
			//		Get array of column id of all selected columns
			var ids = [], i, c,
				g = this.grid,
				cols = g._columns,
				count = cols.length;
			for(i = 0; i < count; ++i){
				c = cols[i];
				if(c._selected){
					ids.push(c.id);
				}
			}
			return ids;
		},
		
		clear: function(){
			// summary:
			//		Clear all column selections
			var columns = this.grid._columns, i, count = columns.length;
			for(i = 0; i < count; ++i){
				this._markById(columns[i].id, 0);
			}
		},
		
		//Private-------------------------------------------------------------------------------
		_type: 'column',

		_init: function(){
			var t = this;
			t.batchConnect(
				[t.grid, 'onHeaderCellClick', function(e){
					if(!domClass.contains(e.target, 'gridxArrowButtonNode')){
						t._select(e.columnId, e.ctrlKey);
					}
				}],
				[t.grid, sniff('ff') < 4 ? 'onHeaderCellKeyUp' : 'onHeaderCellKeyDown', function(e){
					if(e.keyCode == keys.SPACE || e.keyCode == keys.ENTER){
						t._select(e.columnId, e.ctrlKey);
					}
				}]
			);
		},

		_markById: function(id, toSelect){
			var t = this, c = t.grid._columnsById[id];
			if(t.arg('enabled')){
				toSelect = !!toSelect;
				if(c && !c._selected == toSelect){
					c._selected = toSelect;
					t._highlight(id, toSelect);
					t[toSelect ? "onSelected" : "onDeselected"](t.grid.column(id, 1));
				}
			}
		},
		
		_highlight: function(id, toHighlight){
			var t = this, g = t.grid;
			query("[colid='" + id + "']", g.bodyNode).forEach(function(node){
				domClass.toggle(node, 'gridxColumnSelected', toHighlight);
				t.onHighlightChange({column: g._columnsById[id].index}, toHighlight);
			});
		},

		_onRender: function(start, count){
			var i, j, node,
				end = start + count,
				g = this.grid,
				bn = g.bodyNode,
				cols = array.filter(g._columns, function(col){
					return col._selected;
				});
			for(i = cols.length - 1; i >= 0; --i){
				for(j = start; j < end; ++j){
					node = query(['[visualindex="', j, '"] [colid="', cols[i].id, '"]'].join(''), bn)[0];
					domClass.add(node, 'gridxColumnSelected');
				}
			}
		}
	}));
});
