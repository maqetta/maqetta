define([
	"dojo/_base/declare"
], function(declare){

	return declare(/*===== "gridx.core.Cell", =====*/[], {
		// summary:
		//		Represents a cell of a grid
		// description:
		//		An instance of this class represents a grid cell.
		//		This class should not be directly instantiated by users. It should be returned by grid APIs.

		/*=====
		// row: [readonly] gridx.core.Row
		//		Reference to the row of this cell
		row: null,

		// column [readonly] gridx.core.Column
		//		Reference to the column of this cell
		column: null,

		// grid: [readonly] gridx.Grid
		//		Reference to the grid
		grid: null,

		// model: [readonly] grid.core.model.Model
		//		Reference to this grid model
		model: null,
		=====*/

		constructor: function(grid, row, column){
			var t=this;
			t.grid = grid;
			t.model = grid.model;
			t.row = row;
			t.column = column;
		},

		data: function(){
			// summary:
			//		Get the grid data of this cell.
			// description:
			//		Grid data means the result of the formatter functions (if exist).
			//		It can be different from store data (a.k.a. raw data).
			// returns:
			//		The grid data in this cell
			return this.model.byId(this.row.id).data[this.column.id];	//String|Number
		},

		rawData: function(){
			// summary:
			//		Get the store data of this cell.
			// description:
			//		If the column of this cell has a store field, then this method can return the store data of this cell.
			// returns:
			//		The store data of this cell
			var t = this, f = t.column.field();
			return f && t.model.byId(t.row.id).rawData[f];	//anything
		},

		setRawData: function(rawData){
			// summary:
			//		Set new raw data to this cell.
			// rawData:
			//		Anything that store can recognize as data
			// returns:
			//		If using server side store, a Deferred object is returned to indicate when the operation is finished.
			var obj = {};
			obj[this.column.field()] = rawData;
			return this.row.setRawData(obj);	//dojo.Deferred
		}
	});
});
