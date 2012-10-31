define([
    	"dojo/_base/declare",
    	"davinci/ve/utils/GeomUtils"
], function(declare, GeomUtils){

createTableBodyData = function(context) {
	var data = {
		type: "html.tbody", 
		context: context,
		children: []
	};
	return data;
};

createTableColGroupData = function(context) {
	var data = {
		type: "html.colgroup", 
		context: context,
		children: []
	};
	return data;
};

createTableColData = function(context) {
	var data = {
		type: "html.col", 
		context: context
	};
	return data;
};

createTableRowData = function(context) {
	var data = {
		type: "html.tr", 
		context: context,
		children: []
	};
	return data;
};

createTableCellData = function(context) {
	var data = {
		type: "html.td", 
		context: context,
		children: "&nbsp;"
	};
	return data;
};

createTableHeaderData = function(context) {
	var data = {
		type: "html.th", 
		context: context,
		children: "&nbsp;"
	};
	return data;
};

var TableMatrix = declare(null, {

	table: null, //the <table>
	tbody: null, //the <tbody>
	colgroup: null, // the <colgroup>
	cols: null, // array of cols (<col>)
	rows: null, // array of rows (<tr>)
	cells: null, // 2D array of cells (<td>|<th>)

	constructor: function(node){
		// find table
		var table = undefined;
		while(node){
			if(node.nodeType === 1 && node.nodeName.toLowerCase() == "table"){
				table = this.table = node;
				break;
			}
			node = node.parentNode;
		}
		// find rows
		this.rows = [];
		node = table.firstChild;
		while(node){
			if(node.nodeType === 1){
				var name = node.nodeName.toLowerCase();
				if (name == "colgroup") {
					this.colgroup = node;
				} else if(name == "tbody"){
					this.tbody = node;
					node = node.firstChild;
					continue;
				}else if(name == "tr"){
					this.rows.push(node);
				}
			}
			node = node.nextSibling;
		}
		// find cells
		this.cells = [];
		for(var r = 0; r < this.rows.length; r++){
			if(!this.cells[r]){
				this.cells[r] = [];
			}
			var cols = this.cells[r];
			var c = 0;
			for(node = this.rows[r].firstChild; node; node = node.nextSibling){
				if(node.nodeType !== 1){
					continue;
				}
				var name = node.nodeName.toLowerCase();
				if(name != "td" && name != "th"){
					continue;
				}
				while(cols[c]){
					c++;
				}
				var colspan = this.getColSpan(node);
				var rowspan = this.getRowSpan(node);
				while(colspan > 0){
					cols[c] = node;
					for(var i = 1; i < rowspan && r + i < this.rows.length; i++){
						if(!this.cells[r + i]){
							this.cells[r + i] = [];
						}
						this.cells[r + i][c] = node;
					}
					c++;
					colspan--;
				}
			}
		}
		//find columns (if we found a colgroup earlier)
		if (this.colgroup) {
			this.cols = [];
			node = this.colgroup.firstChild;
			while(node){
				var name = node.nodeName.toLowerCase();
				if (name == "col") {
					this.cols.push(node);
				}
				node = node.nextSibling;
			}
		}
	},

	getNumRows: function() {
		return this.rows.length;
	},
	
	getNumCols: function() {
		if (this.cells.length) {
			return this.cells[0].length;
		}
		return 0;
	},
	
	getCell: function(r, c){
		return this.cells[r][c];
	},

	getNextCell: function(r, c){
		var row = this.rows[r];
		var cols = this.cells[r];
		var cell = cols[c];
		while(cell && cell.parentNode != row){ // skip cells spanning from the previous row
			c++;
			cell = cols[c];
		}
		return cell;
	},

	getPos: function(cell){
		var row = cell.parentNode;
		for(var r = 0; r < this.rows.length; r++){
			if(this.rows[r] == row){
				var cols = this.cells[r];
				for(var c = 0; c < cols.length; c++){
					if(cols[c] == cell){
						return {r: r, c: c};
					}
				}
				return undefined;
			}
		}
		return undefined;
	},

	getColSpan: function(cell){
		var colspan = cell.getAttribute("colspan");
		return (colspan ? parseInt(colspan) : 1);
	},

	getRowSpan: function(cell){
		var rowspan = cell.getAttribute("rowspan");
		return (rowspan ? parseInt(rowspan) : 1);
	},
	
	//<col> and <colgroup> elements use "span" rather than "colspan"
	getSpan: function(col){
		var span = col.getAttribute("span");
		return (span ? parseInt(span) : 1);
	},
	
	getColElement: function(cellColPosition) {
		var returnCol = null;
		if (cellColPosition >= 0) {
			if (this.colgroup) {
				var adjustedColCount = 0;
				dojo.some(this.cols, function(col) {
					adjustedColCount += this.getSpan(col);
					if (cellColPosition <= adjustedColCount - 1) {
						returnCol = col;
						return true;
					} 
				}.bind(this));
			}
		}
		return returnCol;
	},
	
	getAdjustedColIndex: function(colToFind) {
		var returnVal = -1;
		if (this.colgroup) {
			var adjustedColIndex = 0;
			dojo.some(this.cols, function(col) {
				if (col == colToFind) {
					returnVal = adjustedColIndex;
					return true;
				}
				adjustedColIndex += this.getSpan(col);
			}.bind(this));
		}
		return returnVal;
	},
	
	getMarginBoxPageCoordsForColumns: function(colIndex, span) {
		var rows = this.rows;
		var cells = this.cells;
		
		var returnBox = null;
		for (var spanCount = 0; spanCount < span; spanCount++) {
			var startingWidth = returnBox ? returnBox.w : 0;
			for (var rowIndex = 0; rowIndex < rows.length; rowIndex++) {
				var cell = cells[rowIndex][colIndex + spanCount];
				var cellBox = GeomUtils.getMarginBoxPageCoords(cell);
				if (returnBox) {
					returnBox.w = Math.max(returnBox.w, startingWidth + cellBox.w);
				} else {
					//Initialize
					returnBox = cellBox;
				}
			}
			//Use tbody as for the height of the column
			var tbodyBox = GeomUtils.getMarginBoxPageCoords(this.tbody);
			returnBox.h = tbodyBox.h;
			returnBox.t = tbodyBox.t;
		}

		return returnBox;
	},
	
	isFirstRowHeader: function() {
		var returnVal = false;
		if (this.rows.length > 0) {
			var cols = this.cells[0];
			dojo.some(cols, function(col) {
				if (col.nodeName.toLowerCase() === "th") {
					//We found a TH, so assume first row is header until find a TD
					returnVal = true;
				} else {
					//We found a TD, so our result is false
					returnVal = false;
					
					//break out of loop
					return true;
				}
			});
		} 
		return returnVal;
	}
});

//Make available some "static" functions
TableMatrix.createTableBodyData = createTableBodyData;
TableMatrix.createTableColGroupData = createTableColGroupData;
TableMatrix.createTableColData = createTableColData ;
TableMatrix.createTableRowData = createTableRowData;
TableMatrix.createTableCellData = createTableCellData;
TableMatrix.createTableHeaderData = createTableHeaderData;

return TableMatrix;

});
 