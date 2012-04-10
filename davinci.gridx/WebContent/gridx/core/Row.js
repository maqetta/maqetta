define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/Deferred"
], function(declare, lang, Deferred){

	return declare(/*===== "gridx.core.Row", =====*/[], {
		// summary:
		//		Represents a row of a grid
		// description:
		//		An instance of this class represents a grid row.
		//		This class should not be directly instantiated by users. It should be returned by grid APIs.

		/*=====
		// id: [readonly] String
		//		The ID of this row
		id: null,

		// grid: [readonly] gridx.Grid
		//		Reference to the grid
		grid: null,

		// model: [readonly] grid.core.model.Model
		//		Reference to this grid model
		model: null,
		=====*/

		constructor: function(grid, id){
			this.grid = grid;
			this.model = grid.model;
			this.id = id;
		},

		index: function(){
			// summary:
			//		Get the index of this row
			// returns:
			//		The row index
			return this.model.idToIndex(this.id);	//Integer
		},

		cell: function(column, isId){
			// summary:
			//		Get a cell object in this row
			// column: gridx.core.Column|Integer|String
			//		Column index or column ID or a column object
			// isId: Boolean?
			//		If the column parameter is a numeric ID, set this to true
			// returns:
			//		If the params are valid return the cell object, else return null.
			return this.grid.cell(this, column, isId);	//gridx.core.Cell|null
		},

		data: function(){
			// summary:
			//		Get the grid data in this row.
			// description:
			//		Grid data means the result of the formatter functions (if exist).
			//		It can be different from store data (a.k.a. raw data).
			// returns:
			//		An associative array using column IDs as keys and grid data as values
			return this.model.byId(this.id).data;	//Object
		},

		rawData: function(){
			// summary:
			//		Get the store data in this row.
			// description:
			//		Store data means the data defined in store. It is the data before applying the formatter functions.
			//		It can be different from grid data (a.k.a. formatted data)
			// returns:
			//		An associative array using store fields as keys and store data as values
			return this.model.byId(this.id).rawData;	//Object
		},

		item: function(){
			// summary:
			//		Get the store item of this row
			// description:
			//		If using the old dojo.data store, store items usually have complicated structures,
			//		and they are also useful when doing store operations.
			// returns:
			//		A store item
			return this.model.byId(this.id).item;	//Object
		},

		setRawData: function(rawData){
			// summary:
			//		Set new raw data of this row into the store
			// rawData: Object
			//		The new data to be set. It can be incomplete, only providing a few fields.
			// returns:
			//		If using server side store, a Deferred object is returned to indicate when the operation is finished.
			var t = this, 
				s = t.grid.store,
				item = t.item(),
				field, d;
			if(s.setValue){
				d = new Deferred;
				try{
					for(field in rawData){
						s.setValue(item, field, rawData[field]);
					}
					s.save({
						onComplete: lang.hitch(d, d.callback),
						onError: lang.hitch(d, d.errback)
					});
				}catch(e){
					d.errback(e);
				}
			}
			return d || Deferred.when(s.put(lang.mixin(lang.clone(item), rawData)));	//dojo.Deferred
		}
	});
});
