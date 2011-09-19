dojo.provide("dojox.grid.enhanced.plugins.Search");

dojo.require("dojox.grid.enhanced._Plugin");
dojo.require("dojo.data.util.filter");

dojo.declare("dojox.grid.enhanced.plugins.Search", dojox.grid.enhanced._Plugin, {
	// summary:
	//		Search the grid using wildcard string or Regular Expression.
	
	// name: String
	//		plugin name
	name: "search",
	
	constructor: function(grid, args){
		this.grid = grid;
		args = (args && dojo.isObject(args)) ? args : {};
		this._cacheSize = args.cacheSize || -1;
		grid.searchRow = dojo.hitch(this, "searchRow");
	},
	searchRow: function(/* Object|RegExp|String */searchArgs, /* function(Integer, item) */onSearched){
		if(!dojo.isFunction(onSearched)){ return; }
		if(dojo.isString(searchArgs)){
			searchArgs = dojo.data.util.filter.patternToRegExp(searchArgs);
		}
		var isGlobal = false;
		if(searchArgs instanceof RegExp){
			isGlobal = true;
		}else if(dojo.isObject(searchArgs)){
			var isEmpty = true;
			for(var field in searchArgs){
				if(dojo.isString(searchArgs[field])){
					searchArgs[field] = dojo.data.util.filter.patternToRegExp(searchArgs[field]);
				}
				isEmpty = false;
			}
			if(isEmpty){ return; }
		}else{
			return;
		}
		this._search(searchArgs, 0, onSearched, isGlobal);
	},
	_search: function(/* Object|RegExp */searchArgs, /* Integer */start, /* function(Integer, item) */onSearched, /* Boolean */isGlobal){
		var _this = this,
			cnt = this._cacheSize,
			args = {
				"start": start,
				"onBegin": function(size){
					_this._storeSize = size;
				},
				"onComplete": function(items){
					if(!dojo.some(items, function(item, i){
						if(_this._checkRow(item, searchArgs, isGlobal)){
							onSearched(start + i, item);
							return true;
						}
						return false;
					})){
						if(cnt > 0 && start + cnt < _this._storeSize){
							_this._search(searchArgs, start + cnt, onSearched, isGlobal);
						}else{
							onSearched(-1, null);
						}
					}
				}
			};
		if(cnt > 0){
			args.count = cnt;
		}
		this.grid._storeLayerFetch(args);
	},
	_checkRow: function(/* store item */item, /* Object|RegExp */searchArgs, /* Boolean */isGlobal){
		var g = this.grid, s = g.store, i, field,
			cells = dojo.filter(g.layout.cells, function(cell){
				return !cell.hidden;
			});
		if(isGlobal){
			return dojo.some(cells, function(cell){
				try{
					if(cell.field){
						return String(s.getValue(item, cell.field)).search(searchArgs) >= 0;
					}
				}catch(e){
					console.log("Search._checkRow() error: ", e);
				}
				return false;
			});
		}else{
			for(field in searchArgs){
				if(searchArgs[field] instanceof RegExp){
					for(i = cells.length - 1; i >= 0; --i){
						if(cells[i].field == field){
							try{
								if(String(s.getValue(item, field)).search(searchArgs[field]) < 0){
									return false;
								}
								break;
							}catch(e){
								return false;
							}
						}
					}
					if(i < 0){ return false; }
				}
			}
			return true;
		}
	}
});
dojox.grid.EnhancedGrid.registerPlugin(dojox.grid.enhanced.plugins.Search/*name:'search'*/);
