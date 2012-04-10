define([
	"dojo/_base/declare"
], function(declare){

	return declare(/*===== "gridx.core.Column", =====*/[], {
		// summary:
		//		Represents a column of a grid
		// description:
		//		An instance of this class represents a grid column.
		//		This class should not be directly instantiated by users. It should be returned by grid APIs.

		/*=====
		// id: [readonly] String
		//		The ID of this column
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
			//		Get the index of this column
			// returns:
			//		The index of this column
			var c = this.grid._columnsById[this.id];
			return c ? c.index : -1;	//Integer
		},

		cell: function(row, isId){
			// summary:
			//		Get a cell object in this column
			// row: gridx.core.Row|Integer|String
			//		Row index or row ID or a row object
			// returns:
			//		If the params are valid and the row is in cache return a cell object, else return null
			return this.grid.cell(row, this, isId);	//gridx.core.Cell|null
		},

		name: function(){
			// summary:
			//		Get the name of this column.
			// description:
			//		Column name is the string displayed in the grid header cell.
			//		Column names can be anything. Two columns can share one name. But they must have different IDs.
			// returns:
			//		The name of this column
			return this.grid._columnsById[this.id].name || '';	//String
		},

		setName: function(name){
			// summary:
			//		Set the name of this column
			// name: String
			//		The new name
			// returns:
			//		Return self reference, so as to cascade methods
			this.grid._columnsById[this.id].name = name;
			return this;	//gridx.core.Column
		},

		field: function(){
			// summary:
			//		Get the store field of this column
			// description:
			//		If a column corresponds to a field in store, this method returns the field.
			//		It's possible for a column to have no store field related.
			// returns:
			//		The store field of this column
			return this.grid._columnsById[this.id].field || null;	//String
		},

		getWidth: function(){
			// summary:
			//		Get the width of this column
			// returns:
			//		The CSS value of column width
			return this.grid._columnsById[this.id].width;	//String
		}
	});
});
