define([
    	"dojo/_base/declare"
], function(declare){

return declare("davinci.ve.actions.TableMatrix", null, {

	rows: null, // array of rows (<tr>)
	cells: null, // 2D array of cells (<td>|<th>)

	constructor: function(node){
		// find table
		var table = undefined;
		while(node){
			if(node.nodeType === 1 && node.nodeName.toLowerCase() == "table"){
				table = node;
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
				if(name == "tbody"){
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
		var rowspan = cell.getAttribute("rowspan")
		return (rowspan ? parseInt(rowspan) : 1);
	}

});
});
 