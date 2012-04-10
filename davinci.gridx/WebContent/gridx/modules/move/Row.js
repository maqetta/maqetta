define([
	"dojo/_base/declare",
	"../../core/_Module",
	"../../core/model/extensions/Move"
], function(declare, _Module, Move){

	return _Module.register(
	declare(/*===== "gridx.modules.move.Row", =====*/_Module, {
		// summary:
		//		This module provides some APIs to move rows within grid
		// description:
		//		This module requires the "Move" model extension.
		//		This module does not include any UI. So different kind of row dnd UI implementations can be built
		//		upon this module.

		name: 'moveRow',
		
		modelExtensions: [Move],

		constructor: function(){
			this.connect(this.model, 'onMoved', '_onMoved');
		},
	
		getAPIPath: function(){
			// tags:
			//		protected extension
			return {
				move: {
					row: this
				}
			};
		},
		
		rowMixin: {
			moveTo: function(target, skipUpdateBody){
				this.grid.move.row.move([this.index()], target, skipUpdateBody);
				return this;
			}
		},
		
		//Public-----------------------------------------------------------------
		move: function(rowIndexes, target, skipUpdateBody){
			// summary:
			//		Move some rows to target position
			// rowIndexes: Integer[]
			//		An array of row indexes
			// target: Integer
			//		The rows will be moved to the position before the target row
			// skipUpdateBody: Boolean?
			//		If set to true, the grid will not refresh immediately, so that several
			//		grid operations can be done altogether.
			var m = this.model;
			m.moveIndexes(rowIndexes, target);
			if(!skipUpdateBody){
				m.when();
			}
		},
		
		moveRange: function(start, count, target, skipUpdateBody){
			// summary:
			//		Move a range of rows to target position
			// start: Integer
			//		The index of the first row to be moved
			// count: Integer
			//		The count of rows to be moved
			// skipUpdateBody: Boolean?
			//		
			var m = this.model;
			m.move(start, count, target);
			if(!skipUpdateBody){
				m.when();
			}
		},
		
		//Events------------------------------------------------------------------
		onMoved: function(/* rowIndexMapping */){
			// summary:
			//		Fired when row move is performed successfully
			// tags:
			//		callback
		},
		
		//Private-----------------------------------------------------------------
		_onMoved: function(){
			this.grid.body.refresh();
			this.onMoved();
		}
	}));
});
