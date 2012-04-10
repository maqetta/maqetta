define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"./_Base",
	"../../core/model/extensions/Mark"
], function(declare, lang, _Base, Mark){

	return declare(_Base, {
		modelExtensions: [Mark],

		selectById: function(rowId, columnId){
			// summary:
			//		Select a cell by its id.
			var t = this, m = t.model;
			if(t.arg('enabled')){
				m.markById(rowId, 1, t._getMarkType(columnId));
				m.when();
			}
		},
		
		deselectById: function(rowId, columnId){
			// summary:
			//		Deselect a cell by its id.
			var t = this, m = t.model;
			if(t.arg('enabled')){
				m.markById(rowId, 0, t._getMarkType(columnId));
				m.when();
			}
		},
		
		isSelected: function(rowId, columnId){
			// summary:
			//		Check if a cell is already selected.
			return this.model.isMarked(rowId, this._getMarkType(columnId));
		},

		//Private-----------------------------------------------------------------
		_init: function(){
			var t = this, m = t.model;
			t.batchConnect(
				[m, 'onMarked', lang.hitch(t, '_onMark', 1)],
				[m, 'onMarkRemoved', lang.hitch(t, '_onMark', 0)]
			);
		}
	});
});
