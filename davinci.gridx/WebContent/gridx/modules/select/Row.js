define([
	"dojo/_base/declare",
	"dojo/_base/array",
	"dojo/_base/sniff",
	"dojo/dom-class",
	"dojo/keys",
	"./_RowCellBase",
	"../../core/_Module"
], function(declare, array, sniff, domClass, keys, _RowCellBase, _Module){

	return _Module.register(
	declare(/*===== "gridx.modules.select.Row", =====*/_RowCellBase, {
		// summary:
		//		Provides simple row selection.
		// description:
		//		This module provides a simple way for selecting rows by clicking or SPACE key, or CTRL + Click to select multiple rows.
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
		name: "selectRow",
		
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
		
		//Public API--------------------------------------------------------------------------------
		
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
		
		isSelected: function(rowId){
			// summary:
			//		Check if a row is already selected.
		},
=====*/

		getSelected: function(){
			// summary:
			//		Get id array of all selected rows
			return this.model.getMarkedIds();
		},
		
		clear: function(){
			// summary:
			//		Deselected all selected rows;
			if(this.arg('enabled')){
				var model = this.model;
				array.forEach(model.getMarkedIds(), function(id){
					model.markById(id, 0);
				});
				model.when();
			}
		},
		
		//Private--------------------------------------------------------------------------------
		_type: 'row',

		_init: function(){
			var t = this, g = t.grid;
			t.inherited(arguments);
			t.model._spTypes.select = 1;
			t.batchConnect(
				[g, 'onRowMouseDown', function(e){
					if(t.arg('triggerOnCell') || !e.columnId){
						t._select(e.rowId, e.ctrlKey);
					}
				}],
				[g, sniff('ff') < 4 ? 'onRowKeyUp' : 'onRowKeyDown', function(e){
					if((t.arg('triggerOnCell') || !e.columnId) && e.keyCode == keys.SPACE){
						t._select(e.rowId, e.ctrlKey);
					}
				}]
			);
		},

		_onMark: function(toMark, id, type){
			if(type == 'select'){
				var t = this;
				t._highlight(id, toMark);
				//Fire event when the row is loaded, so users can use the row directly.
				t.model.when({id: id}, function(){
					t[toMark ? 'onSelected' : 'onDeselected'](t.grid.row(id, true));
				});
			}
		},
		
		_highlight: function(rowId, toHighlight){
			var node = this.grid.body.getRowNode({rowId: rowId});
			if(node){
				domClass.toggle(node, "gridxRowSelected", toHighlight);
				this.onHighlightChange({row: parseInt(node.getAttribute('visualindex'), 10)}, !!toHighlight);
			}
		},

		_markById: function(id, toMark){
			var m = this.model;
			m.markById(id, toMark);
			m.when();
		},

		_onRender: function(start, count){
			var t = this, model = t.model, end = start + count, i, id;
			for(i = start; i < end; ++i){
				id = model.indexToId(t.grid.body.getRowInfo({visualIndex: i}).rowIndex);
				if(model.isMarked(id)){
					t._highlight(id, 1);
				}
			}
		}
	}));
});
