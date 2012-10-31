define([
	"davinci/ve/widget"
], function(
	Widget
) {

var GridHelper = function() {};
GridHelper.prototype = {

	getData: function(/*Widget*/ widget, /*Object*/ options){
		// summary:
		//		Serialize the passed DataGrid.
		//		Writes a dojo/method script tag as a child to the DataGrid to set the structure, if one doesn't already exist.
		//

		if(!widget){
			return undefined;
		}

		// call the old _getData
		var data = Widget._getData(widget, options);
		// only write the script tag if this call is for serializing and there is a structure to serialize
		if(data && options && options.serialize && widget.structure){
			// the JS that sets the structure, this=the DataGrid
			var value = "this.setStructure(" + this._serializeStructure(widget.structure) + ");";
			// if there is already a script tag, try to find a dojo/method script tag and append the JS to it
			if(data.scripts){
				if(!dojo.some(data.scripts, function(s){
					if(s.type == "dojo/method" && !s.name && s.value &&
						s.value.substring(0, 18) == "this.setStructure("){
						s.value = value;
						return true;
					}
					return false;
				})){ // not found
					data.scripts.push({type: "dojo/method", value: value});
				}
			}else{
				// make a new set of scripts with this setStructure call
				data.scripts = [{type: "dojo/method", value: value}];
			}
		}
		return data;
	},

	_serializeStructure: function(/*Object*/ structure){
		// summary:
		//		Serialize the passed DataGrid's structure.
		//		DataGrid does additional parsing to a structure once the DataGrid loads it, so undo that work and return the JSON.
		//

		if(!structure){
			return undefined;
		}
		var columns;
		try{
			columns = structure[0].cells[0];
		}catch(e){
		}
		if(!columns){
			return undefined;
		}

		// returned string
		var s = "";
		// serialize each column of the structure
		// assumption: there is only one row declaration
		dojo.forEach(columns, function(c){
			var cs = "";
			// parameters to serialize: field, name, width, editor
			var field = c.field;
			if(field || field === 0){
				cs += "field: " + (dojo.isString(field) ? "\"" + field + "\"" : field);  
			}
			var name = c.name;
			if(name){
				if(cs){
					cs += ", ";
				}
				cs += "name: \"" + name + "\"";
			}
			var width = c.width;
			if(width){
				if(cs){
					cs += ", ";
				}
				cs += "width: " + (dojo.isString(width) ? "\"" + width + "\"" : width);
			}
			var editor = c.editor;
			if(editor){
				// supported editors: Input, Bool, Select
				if(cs){
					cs += ", ";
				}
				if(editor == dojox.grid.editors.Input){
					cs += "editor: dojox.grid.editors.Input";
				}else if(editor == dojox.grid.editors.Bool){
					cs += "editor: dojox.grid.editors.Bool";
				}else if(editor == dojox.grid.editors.Select){
					cs += "editor: dojox.grid.editors.Select";
					var options = c.options;
					if(options){
						cs += ", options: " + dojo.toJson(options);
					}
				}
			}
			if(s){
				s += ", ";
			}
			s += "{" + cs + "}";
		});
		return "[{cells: [[" + s + "]]}]";
	}

};

return GridHelper;

});