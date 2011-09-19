dojo.provide("davinci.ve.actions.TableActions");

dojo.require("davinci.ve.properties.edit.dialogs");
dojo.require("davinci.actions.Action");
dojo.require("davinci.commands.CompoundCommand");
dojo.require("davinci.ve.widget");
dojo.require("davinci.ve.commands.AddCommand");
dojo.require("davinci.ve.commands.ModifyCommand");
dojo.require("davinci.ve.commands.RemoveCommand");
dojo.require("davinci.ve.commands.ReparentCommand");

dojo.declare("davinci.ve.actions._TableAction", davinci.actions.Action, {

	isEnabled: function(context){
		return !!(context && this._getCell(context));
	},

	_getCell: function(context){
		var selection = context.getSelection();
		if(selection.length === 0){
			return undefined;
		}
		var widget = selection[selection.length - 1];
		if(!widget.isHtmlWidget){
			return undefined;
		}
		var tagName = widget.getTagName();
		if(tagName == "td" || tagName == "th"){
			if(selection.length > 1){
				context.select(widget);
			}
			return widget.domNode;
		}
		return undefined;
	}

});

dojo.declare("davinci.ve.actions.AddColumnAction", davinci.ve.actions._TableAction, {

	name: "addColumn",
	iconClass: "editActionIcon editAddColumnIcon",

	run: function(context){
		if(!context){
			return;
		}
		var sel = this._getCell(context);
		if(!sel){
			return;
		}

		var matrix = new davinci.ve.actions.TableMatrix(sel);
		var rows = matrix.rows;
		var cells = matrix.cells;
		var pos = matrix.getPos(sel);
		var c = pos.c + matrix.getColSpan(sel) - 1; // the right-most column

		var command = new davinci.commands.CompoundCommand();
		for(var r = 0; r < rows.length; r++){
			var cols = cells[r];
			var cell = cols[c];
			if(cell && cols[c + 1] == cell){ // spanning to the next column
				var widget = davinci.ve.widget.byNode(cell);
				var properties = {colspan: matrix.getColSpan(cell) + 1};
				command.add(new davinci.ve.commands.ModifyCommand(widget, properties));
				r += (matrix.getRowSpan(cell) - 1); // skip rows covered by this cell
			}else{
				var data = {type: "html.td"};
				var parent = davinci.ve.widget.byNode(rows[r]);
				var nextCell = matrix.getNextCell(r, c + 1);
				var next = (nextCell ? davinci.ve.widget.byNode(nextCell) : undefined);
				command.add(new davinci.ve.commands.AddCommand(data, parent, next));
			}
		}
		context.getCommandStack().execute(command);
	}

});

dojo.declare("davinci.ve.actions.AddRowAction", davinci.ve.actions._TableAction, {

	name: "addRow",
	iconClass: "editActionIcon editAddRowIcon",

	run: function(context){
		if(!context){
			return;
		}
		var sel = this._getCell(context);
		if(!sel){
			return;
		}

		var matrix = new davinci.ve.actions.TableMatrix(sel);
		var rows = matrix.rows;
		var cells = matrix.cells;
		var pos = matrix.getPos(sel);
		var r = pos.r + matrix.getRowSpan(sel) - 1; // the bottom-most row
		if(r >= rows.length){
			r = rows.length - 1; // limit to the last row
		}
		var cols = cells[r];
		var nextCols = cells[r + 1];

		var command = new davinci.commands.CompoundCommand();
		var data = {type: "html.tr", children: []};
		for(var c = 0; c < cols.length; c++){
			var cell = cols[c];
			if(nextCols && nextCols[c] == cell){ // spanning to the next row
				var widget = davinci.ve.widget.byNode(cell);
				var properties = {rowspan: matrix.getRowSpan(cell) + 1}; 
				command.add(new davinci.ve.commands.ModifyCommand(widget, properties));
				c += (matrix.getColSpan(cell) - 1); // skip columns covered by this cell
			}else{
				data.children.push({type: "html.td"});
			}
		}
		var parent = davinci.ve.widget.byNode(rows[r].parentNode);
		var next = (r + 1 < rows.length ? davinci.ve.widget.byNode(rows[r + 1]) : undefined);
		command.add(new davinci.ve.commands.AddCommand(data, parent, next));
		context.getCommandStack().execute(command);
	}

});

dojo.declare("davinci.ve.actions.RemoveColumnAction", davinci.ve.actions._TableAction, {

	name: "removeColumn",
	iconClass: "editActionIcon editRemoveColumnIcon",

	run: function(context){
		if(!context){
			return;
		}
		var sel = this._getCell(context);
		if(!sel){
			return;
		}

		var matrix = new davinci.ve.actions.TableMatrix(sel);
		var rows = matrix.rows;
		var cells = matrix.cells;
		var pos = matrix.getPos(sel);
		var c = pos.c;

		var command = new davinci.commands.CompoundCommand();
		for(var r = 0; r < rows.length; r++){
			var cols = cells[r];
			var cell = cols[c];
			var widget = davinci.ve.widget.byNode(cell);
			var colspan = matrix.getColSpan(cell);
			if(colspan > 1){
				var properties = {colspan: colspan - 1};
				command.add(new davinci.ve.commands.ModifyCommand(widget, properties));
			}else{
				command.add(new davinci.ve.commands.RemoveCommand(widget));
			}
			r += (matrix.getRowSpan(cell) - 1); // skip rows covered by this cell
		}
		context.getCommandStack().execute(command);
	}

});

dojo.declare("davinci.ve.actions.RemoveRowAction", davinci.ve.actions._TableAction, {

	name: "removeRow",
	iconClass: "editActionIcon editRemoveRowIcon",

	run: function(context){
		if(!context){
			return;
		}
		var sel = this._getCell(context);
		if(!sel){
			return;
		}

		var matrix = new davinci.ve.actions.TableMatrix(sel);
		var rows = matrix.rows;
		var cells = matrix.cells;
		var pos = matrix.getPos(sel);
		var r = pos.r;
		var cols = cells[r];

		var command = new davinci.commands.CompoundCommand();
		var widget = undefined;
		for(var c = 0; c < cols.length; c++){
			var cell = cols[c];
			var rowspan = matrix.getRowSpan(cell);
			var colspan = matrix.getColSpan(cell);
			if(rowspan > 1){
				widget = davinci.ve.widget.byNode(cell);
				var properties = {rowspan: rowspan - 1};
				command.add(new davinci.ve.commands.ModifyCommand(widget, properties));
				if(matrix.getPos(cell).r == r && r + 1 < rows.length){ // on the row to delete
					var parent = davinci.ve.widget.byNode(rows[r + 1]);
					var nextCell = matrix.getNextCell(r + 1, c + colspan);
					var next = (nextCell ? davinci.ve.widget.byNode(nextCell) : undefined);
					command.add(new davinci.ve.commands.ReparentCommand(widget, parent, next));
				}
			}
			c += (colspan - 1); // skip rows covered by this cell
		}
		widget = davinci.ve.widget.byNode(rows[r]);
		command.add(new davinci.ve.commands.RemoveCommand(widget));
		context.getCommandStack().execute(command);
	}

});

dojo.declare("davinci.ve.actions.JoinColumnAction", davinci.ve.actions._TableAction, {

	name: "joinColumn",
	iconClass: "editActionIcon editJoinColumnIcon",

	run: function(context){
		if(!context){
			return;
		}
		var sel = this._getCell(context);
		if(!sel){
			return;
		}

		var matrix = new davinci.ve.actions.TableMatrix(sel);
		var rows = matrix.rows;
		var cells = matrix.cells;
		var pos = matrix.getPos(sel);
		var cs = matrix.getColSpan(sel);
		var nc = pos.c + cs; // the next column
		if(nc >= cells[pos.r].length){ // the last column
			return;
		}
		var nr = pos.r + matrix.getRowSpan(sel); // the next row
		if(nr > rows.length){
			nr = rows.length; // limit to the last row
		}

		var command = new davinci.commands.CompoundCommand();
		var widget = undefined;
		var parent = davinci.ve.widget.byNode(sel);
		var properties = undefined;
		for(var r = pos.r; r < nr; r++){
			var cell = cells[r][nc];
			if(!cell){
				continue;
			}
			if(r > 0 && cells[r - 1][nc] == cell){ // spanning from the previous row
				return;
			}
			var rowspan = matrix.getRowSpan(cell);
			if(r + rowspan > nr){ // spanning to the next row
				return;
			}
			var colspan = matrix.getColSpan(cell);
			widget = davinci.ve.widget.byNode(cell);
			if(colspan > 1){
				properties = {colspan: colspan - 1};
				command.add(new davinci.ve.commands.ModifyCommand(widget, properties));
			}else{
				dojo.forEach(davinci.ve.widget.getChildren(widget), function(w){
					command.add(new davinci.ve.commands.ReparentCommand(w, parent));
				});
				command.add(new davinci.ve.commands.RemoveCommand(widget));
			}
			r += (rowspan - 1); // skip rows covered by this cell
		}
		widget = parent;
		properties = {colspan: cs + 1};
		command.add(new davinci.ve.commands.ModifyCommand(widget, properties));
		context.getCommandStack().execute(command);
	}

});

dojo.declare("davinci.ve.actions.JoinRowAction", davinci.ve.actions._TableAction, {

	name: "joinRow",
	iconClass: "editActionIcon editJoinRowIcon",

	run: function(context){
		if(!context){
			return;
		}
		var sel = this._getCell(context);
		if(!sel){
			return;
		}

		var matrix = new davinci.ve.actions.TableMatrix(sel);
		var rows = matrix.rows;
		var cells = matrix.cells;
		var pos = matrix.getPos(sel);
		var rs = matrix.getRowSpan(sel);
		var nr = pos.r + rs; // the next row
		if(nr >= rows.length){ // the last row
			return;
		}
		var nc = pos.c + matrix.getColSpan(sel); // the next column

		var command = new davinci.commands.CompoundCommand();
		var widget = undefined;
		var properties = undefined;
		for(var c = pos.c; c < nc; c++){
			var cell = cells[nr][c];
			if(!cell){
				continue;
			}
			if(c > 0 && cells[nr][c - 1] == cell){ // spanning from the previous column
				return;
			}
			var colspan = matrix.getColSpan(cell);
			if(c + colspan > nc){ // spanning to the next column
				return;
			}
			var rowspan = matrix.getRowSpan(cell);
			widget = davinci.ve.widget.byNode(cell);
			if(rowspan > 1 && nr + 1 < rows.length){
				properties = {rowspan: rowspan - 1};
				command.add(new davinci.ve.commands.ModifyCommand(widget, properties));
				// move to the next row
				var parent = davinci.ve.widget.byNode(rows[nr + 1]);
				var nextCell = matrix.getNextCell(nr + 1, c + colspan);
				var next = (nextCell ? davinci.ve.widget.byNode(nextCell) : undefined);
				command.add(new davinci.ve.commands.ReparentCommand(widget, parent, next));
			}else{
				var parent = davinci.ve.widget.byNode(sel);
				dojo.forEach(davinci.ve.widget.getChildren(widget), function(w){
					command.add(new davinci.ve.commands.ReparentCommand(w, parent));
				});
				command.add(new davinci.ve.commands.RemoveCommand(widget));
			}
			c += (colspan - 1); // skip columns covered by this cell
		}
		widget = davinci.ve.widget.byNode(sel);
		properties = {rowspan: rs + 1};
		command.add(new davinci.ve.commands.ModifyCommand(widget, properties));
		context.getCommandStack().execute(command);
	}

});

dojo.declare("davinci.ve.actions.SplitColumnAction", davinci.ve.actions._TableAction, {

	name: "splitColumn",
	iconClass: "editActionIcon editSplitColumnIcon",

	run: function(context){
		if(!context){
			return;
		}
		var sel = this._getCell(context);
		if(!sel){
			return;
		}

		var matrix = new davinci.ve.actions.TableMatrix(sel);
		var rows = matrix.rows;
		var cells = matrix.cells;
		var pos = matrix.getPos(sel);
		var cs = matrix.getColSpan(sel);
		var rs = matrix.getRowSpan(sel);

		var command = new davinci.commands.CompoundCommand();
		var properties = undefined;
		if(cs > 1){
			var widget = davinci.ve.widget.byNode(sel);
			properties = {colspan: cs - 1};
			command.add(new davinci.ve.commands.ModifyCommand(widget, properties));
		}else{
			// span other cells in the column
			for(var r = 0; r < rows.length; r++){
				if(r == pos.r){
					// skip the cell to split
					r += (rs - 1);
					continue;
				}
				var cell = cells[r][pos.c];
				var widget = davinci.ve.widget.byNode(cell);
				properties = {colspan: matrix.getColSpan(cell) + 1};
				command.add(new davinci.ve.commands.ModifyCommand(widget, properties));
				r += (matrix.getRowSpan(cell) - 1); // skip rows covered by this cell
			}
		}
		var data = {type: "html.td"};
		if(rs > 1){
			data.properties = {rowspan: rs};
		}
		var parent = davinci.ve.widget.byNode(rows[pos.r]);
		var nextCell = matrix.getNextCell(pos.r, pos.c + cs);
		var next = (nextCell ? davinci.ve.widget.byNode(nextCell) : undefined);
		command.add(new davinci.ve.commands.AddCommand(data, parent, next));
		context.getCommandStack().execute(command);
	}

});

dojo.declare("davinci.ve.actions.SplitRowAction", davinci.ve.actions._TableAction, {

	name: "splitRow",
	iconClass: "editActionIcon editSplitRowIcon",

	run: function(context){
		if(!context){
			return;
		}
		var sel = this._getCell(context);
		if(!sel){
			return;
		}

		var matrix = new davinci.ve.actions.TableMatrix(sel);
		var rows = matrix.rows;
		var cells = matrix.cells;
		var pos = matrix.getPos(sel);
		var cs = matrix.getColSpan(sel);
		var rs = matrix.getRowSpan(sel);

		var command = new davinci.commands.CompoundCommand();
		var data = {type: "html.td"};
		if(cs > 1){
			data.properties = {colspan: cs};
		}
		if(rs > 1 && pos.r + rs <= rows.length){
			var widget = davinci.ve.widget.byNode(sel);
			var properties = {rowspan: rs - 1};
			command.add(new davinci.ve.commands.ModifyCommand(widget, properties));
			var r = pos.r + rs - 1; // the bottom-most row
			var parent = davinci.ve.widget.byNode(rows[r]);
			var nextCell = matrix.getNextCell(r, pos.c + cs);
			var next = (nextCell ? davinci.ve.widget.byNode(nextCell) : undefined);
			command.add(new davinci.ve.commands.AddCommand(data, parent, next));
		}else{
			// add a new row
			data = {type: "html.tr", children: [data]};
			var parent = davinci.ve.widget.byNode(rows[pos.r].parentNode);
			var next = (pos.r + rs < rows.length ? davinci.ve.widget.byNode(rows[pos.r + rs]) : undefined);
			command.add(new davinci.ve.commands.AddCommand(data, parent, next));
			// span other cells in the row
			var cols = cells[pos.r];
			for(var c = 0; c < cols.length; c++){
				if(c == pos.c){
					// skip the cell to split
					c += (cs - 1);
					continue;
				}
				var cell = cols[c];
				var widget = davinci.ve.widget.byNode(cell);
				var properties = {rowspan: matrix.getRowSpan(cell) + 1};
				command.add(new davinci.ve.commands.ModifyCommand(widget, properties));
				c += (matrix.getColSpan(cell) - 1); // skip columns covered by this cell
			}
		}
		context.getCommandStack().execute(command);
	}

});


dojo.declare("davinci.ve.actions.TableMatrix", null, {

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
