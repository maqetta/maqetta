define([
	"dojo/_base/declare",
	"../../core/_Module"
], function(declare, _Module){

	return _Module.register(
	declare(/*===== "gridx.modules.move.Column", =====*/_Module, {
		// summary:
		//		This module provides several APIs to move columns within grid.
		// description:
		//		This module does not include any UI. So different kind of column dnd UI implementations can be built
		//		upon this module.

		name: 'moveColumn',
		
		getAPIPath: function(){
			// tags:
			//		protected extension
			return {
				move: {
					column: this
				}
			};
		},
	
		columnMixin: {
			moveTo: function(target, skipUpdateBody){
				this.grid.move.column.moveRange(this.index(), 1, target, skipUpdateBody);
				return this;
			}
		},
		
		//public---------------------------------------------------------------

		move: function(columnIndexes, target, skipUpdateBody){
			// summary:
			//		Move some columns to the given target position
			// columnIndexes: Integer[]
			//		The current indexes of columns to move
			// target: Integer
			//		The moved columns will be inserted before the column with this index.
			// skipUpdateBody: Boolean?
			//		If set to true, grid body won't be refreshed immediately
			//		so that several grid operations can be efficiently executed altogether.
			if(typeof columnIndexes === 'number'){
				columnIndexes = [columnIndexes];
			}
			var map = [], i, len, columns = this.grid._columns, pos, movedCols = [];
			for(i = 0, len = columnIndexes.length; i < len; ++i){
				map[columnIndexes[i]] = true;
			}
			for(i = map.length - 1; i >= 0; --i){
				if(map[i]){
					movedCols.unshift(columns[i]);
					columns.splice(i, 1);
				}
			}
			for(i = 0, len = columns.length; i < len; ++i){
				if(columns[i].index >= target){
					pos = i;
					break;
				}
			}
			if(pos === undefined){
				pos = columns.length;
			}
			this._moveComplete(movedCols, pos, skipUpdateBody);
		},
	
		moveRange: function(start, count, target, skipUpdateBody){
			// summary:
			//		Move a range of columns to a given target position
			// start: Integer
			//		The index of the first column to move
			// count: Integer
			//		The count of columns to move
			// skipUpdateBody: Boolean?
			//		If set to true, grid body won't be refreshed immediately
			//		so that several grid operations can be efficiently executed altogether.
			if(target < start || target > start + count){
				if(target > start + count){
					target -= count;
				}
				this._moveComplete(this.grid._columns.splice(start, count), target, skipUpdateBody);
			}
		},
		
		//Events--------------------------------------------------------------------
		onMoved: function(){
			// summary:
			//		Fired when column move is performed successfully
			// tags:
			//		callback
		},
		
		//Private-------------------------------------------------------------------
		_moveComplete: function(movedCols, target, skipUpdateBody){
			var g = this.grid, map = {}, i, columns = g._columns;
			for(i = movedCols.length - 1; i >= 0; --i){
				map[movedCols[i].index] = target + i;
			}
			columns.splice.apply(columns, [target, 0].concat(movedCols));
			for(i = columns.length - 1; i >= 0; --i){
				columns[i].index = i;
			}
			g.header.refresh();
			if(!skipUpdateBody){
				g.body.refresh();
				this.onMoved(map);
			}
		}	
	}));
});

