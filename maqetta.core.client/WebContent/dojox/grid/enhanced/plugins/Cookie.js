dojo.provide("dojox.grid.enhanced.plugins.Cookie");

dojo.require("dojox.grid.enhanced._Plugin");
dojo.require("dojo.cookie");
dojo.require("dojox.grid._RowSelector");
dojo.require("dojox.grid.cells._base");

(function(){
	// Generate a cookie key for the given grid.
	var _cookieKeyBuilder = function(grid){
		return window.location + "/" + grid.id;
	};
	
	//Utilities:
	var _getCellsFromStructure = function(structure){
		var cells = [];
		if(!dojo.isArray(structure)){
			structure = [structure];
		}
		dojo.forEach(structure,function(viewDef){
			if(dojo.isArray(viewDef)){
				viewDef = {"cells" : viewDef};
			}
			var rows = viewDef.rows || viewDef.cells;
			if(dojo.isArray(rows)){
				if(!dojo.isArray(rows[0])){
					rows = [rows];
				}
				dojo.forEach(rows, function(row){
					if(dojo.isArray(row)){
						dojo.forEach(row, function(cell){
							cells.push(cell);
						});
					}
				});
			}
		});
		return cells;
	};
	
	// Persist column width
	var _loadColWidth = function(colWidths, grid){
		if(dojo.isArray(colWidths)){
			var oldFunc = grid._setStructureAttr;
			grid._setStructureAttr = function(structure){
				if(!grid._colWidthLoaded){
					grid._colWidthLoaded = true;
					var cells = _getCellsFromStructure(structure);
					for(var i = cells.length - 1; i >= 0; --i){
						if(typeof colWidths[i] == "number"){
							cells[i].width = colWidths[i] + "px";
						}
					}
				}
				oldFunc.call(grid, structure);
				grid._setStructureAttr = oldFunc;
			};
		}
	};
	
	var _saveColWidth = function(grid){
		return dojo.map(dojo.filter(grid.layout.cells, function(cell){
			return !(cell.isRowSelector || cell instanceof dojox.grid.cells.RowIndex);
		}), function(cell){
			return dojo[dojo.isWebKit ? "marginBox" : "contentBox"](cell.getHeaderNode()).w;
		});
	};
	
	// Persist column order
	var _loadColumnOrder = function(colOrder, grid){
		if(colOrder && dojo.every(colOrder, function(viewInfo){
			return dojo.isArray(viewInfo) && dojo.every(viewInfo, function(subrowInfo){
				return dojo.isArray(subrowInfo) && subrowInfo.length > 0;
			});
		})){
			var oldFunc = grid._setStructureAttr;
			var isCell = function(def){
				return ("name" in def || "field" in def || "get" in def);
			};
			var isView = function(def){
				return (def !== null && dojo.isObject(def) &&
						("cells" in def || "rows" in def || ("type" in def && !isCell(def))));
			};
			grid._setStructureAttr = function(structure){
				if(!grid._colOrderLoaded){
					grid._colOrderLoaded = true;
					grid._setStructureAttr = oldFunc;
					structure = dojo.clone(structure);
					if(dojo.isArray(structure) && !dojo.some(structure, isView)){
						structure = [{ cells: structure }];
					}else if(isView(structure)){
						structure = [structure];
					}
					var cells = _getCellsFromStructure(structure);
					dojo.forEach(dojo.isArray(structure) ? structure : [structure], function(viewDef, viewIdx){
						var cellArray = viewDef;
						if(dojo.isArray(viewDef)){
							viewDef.splice(0, viewDef.length);
						}else{
							delete viewDef.rows;
							cellArray = viewDef.cells = [];
						}
						dojo.forEach(colOrder[viewIdx], function(subrow){
							dojo.forEach(subrow, function(cellInfo){
								var i, cell;
								for(i = 0; i < cells.length; ++i){
									cell = cells[i];
									if(dojo.toJson({'name':cell.name,'field':cell.field}) == dojo.toJson(cellInfo)){
										break;
									}
								}
								if(i < cells.length){
									cellArray.push(cell);
								}
							});
						});
					});
				}
				oldFunc.call(grid, structure);
			};
		}
	};
	
	var _saveColumnOrder = function(grid){
		var colOrder = dojo.map(dojo.filter(grid.views.views, function(view){
			return !(view instanceof dojox.grid._RowSelector);
		}), function(view){
			return dojo.map(view.structure.cells, function(subrow){
				return dojo.map(dojo.filter(subrow, function(cell){
					return !(cell.isRowSelector || cell instanceof dojox.grid.cells.RowIndex);
				}), function(cell){
					return {
						"name": cell.name,
						"field": cell.field
					};
				});
			});
		});
		return colOrder;
	};
	
	// Persist sorting order
	var _loadSortOrder = function(sortOrder, grid){
		try{
			if(dojo.isObject(sortOrder)){
				grid.setSortIndex(sortOrder.idx, sortOrder.asc);
			}
		}catch(e){
			//setSortIndex will finally call _fetch, some exceptions will be throw
			//'cause the grid hasn't be fully loaded now. Just ignore them.
		}
	};
	
	var _saveSortOrder = function(grid){
		return {
			idx: grid.getSortIndex(),
			asc: grid.getSortAsc()
		};
	};
	
	if(!dojo.isIE){
		// Now in non-IE, widgets are no longer destroyed on page unload,
		// so we have to destroy it manually to trigger saving cookie.
		dojo.addOnWindowUnload(function(){
			dojo.forEach(dijit.findWidgets(dojo.body()), function(widget){
				if(widget instanceof dojox.grid.EnhancedGrid && !widget._destroyed){
					widget.destroyRecursive();
				}
			});
		});
	}
	
	dojo.declare("dojox.grid.enhanced.plugins.Cookie", dojox.grid.enhanced._Plugin, {
		// summary:
		//		This plugin provides a way to persist some grid features in cookie.
		//		Default persistable features are:
		//		column width:	"columnWidth" (handler name)
		//		column order:	"columnOrder"
		//		sorting order:	"sortOrder"
		//
		//		Grid users can define new persistable features
		//		by calling the following before grid is initialized (that is, during "preInit");
		//		|	grid.addCookieHandler({
		//		|		name: "a name for the new persistable feature",
		//		|		onLoad: function(savedObject, grid){
		//		|			//load the cookie.
		//		|		},
		//		|		onSave: function(grid){
		//		|			//save the cookie.
		//		|		}
		//		|	});
		
		// name: String
		//		Plugin name
		name: "cookie",
		
		_cookieEnabled: true,
		
		constructor: function(grid, args){
			this.grid = grid;
			args = (args && dojo.isObject(args)) ? args : {};
			this.cookieProps = args.cookieProps;
			this._cookieHandlers = [];
			this._mixinGrid();
			
			//Column width & simple sorting & column reorder are base grid features, so they must be supported.
			this.addCookieHandler({
				name: "columnWidth",
				onLoad: _loadColWidth,
				onSave: _saveColWidth
			});
			this.addCookieHandler({
				name: "columnOrder",
				onLoad: _loadColumnOrder,
				onSave: _saveColumnOrder
			});
			this.addCookieHandler({
				name: "sortOrder",
				onLoad: _loadSortOrder,
				onSave: _saveSortOrder
			});
			
			dojo.forEach(this._cookieHandlers, function(handler){
				if(args[handler.name] === false){
					handler.enable = false;
				}
			}, this);
		},
		destroy:function(){
			this._saveCookie();
			this._cookieHandlers = null;
			this.inherited(arguments);
		},
		_mixinGrid: function(){
			var g = this.grid;
			g.addCookieHandler = dojo.hitch(this, "addCookieHandler");
			g.removeCookie = dojo.hitch(this, "removeCookie");
			g.setCookieEnabled = dojo.hitch(this, "setCookieEnabled");
			g.getCookieEnabled = dojo.hitch(this, "getCookieEnabled");
		},
		_saveCookie: function(){
			if(this.getCookieEnabled()){
				var cookie = {},
					chs = this._cookieHandlers,
					cookieProps = this.cookieProps,
					cookieKey = _cookieKeyBuilder(this.grid);
				for(var i = chs.length-1; i >= 0; --i){
					if(chs[i].enabled){
						//Do the real saving work here.
						cookie[chs[i].name] = chs[i].onSave(this.grid);
					}
				}
				cookieProps = dojo.isObject(this.cookieProps) ? this.cookieProps : {};
				dojo.cookie(cookieKey, dojo.toJson(cookie), cookieProps);
			}else{
				this.removeCookie();
			}
		},
		onPreInit: function(){
			var grid = this.grid,
				chs = this._cookieHandlers,
				cookieKey = _cookieKeyBuilder(grid),
				cookie = dojo.cookie(cookieKey);
			if(cookie){
				cookie = dojo.fromJson(cookie);
				for(var i = 0; i < chs.length; ++i){
					if(chs[i].name in cookie && chs[i].enabled){
						//Do the real loading work here.
						chs[i].onLoad(cookie[chs[i].name], grid);
					}
				}
			}
			this._cookie = cookie || {};
			this._cookieStartedup = true;
		},
		addCookieHandler: function(args){
			// summary:
			//		If a grid plugin wants cookie service, call this.
			//		This must be called during preInit.
			// args: Object
			//		An object with the following structure:
			//	|	{
			//	|		name: "some-string",
			//	|		onLoad: /* void */ function(/* object */partOfCookie, /* EDG */grid){...},
			//	|		onSave: /* object */ function(/* EDG */grid){...}
			//	|	}
			if(args.name){
				var dummy = function(){};
				args.onLoad = args.onLoad || dummy;
				args.onSave = args.onSave || dummy;
				if(!("enabled" in args)){
					args.enabled = true;
				}
				for(var i = this._cookieHandlers.length - 1; i >= 0; --i){
					if(this._cookieHandlers[i].name == args.name){
						this._cookieHandlers.splice(i, 1);
					}
				}
				this._cookieHandlers.push(args);
				if(this._cookieStartedup && args.name in this._cookie){
					args.onLoad(this._cookie[args.name], this.grid);
				}
			}
		},
		removeCookie: function(){
			// summary:
			//		Remove cookie for this grid.
			var key = _cookieKeyBuilder(this.grid);
			dojo.cookie(key, null, {expires: -1});
		},
		setCookieEnabled: function(cookieName, enabled){
			// summary:
			//		A setter to enable|disable cookie support for a particular Grid feature.
			// cookieName: String?
			//		Name of a cookie handler if provided, otherwise for all cookies.
			// enabled: Boolean
			if(arguments.length == 2){
				var chs = this._cookieHandlers;
				for(var i = chs.length - 1; i >= 0; --i){
					if(chs[i].name === cookieName){
						chs[i].enabled = !!enabled;
					}
				}
			}else{
				this._cookieEnabled = !!cookieName;
				if(!this._cookieEnabled){ this.removeCookie(); }
			}
		},
		getCookieEnabled: function(cookieName){
			// summary:
			//		A getter to check cookie support of a particular Grid feature.
			// cookieName: String?
			//		Name of a cookie handler if provided, otherwise for all cookies.
			if(dojo.isString(cookieName)){
				var chs = this._cookieHandlers;
				for(var i = chs.length - 1; i >= 0; --i){
					if(chs[i].name == cookieName){ return chs[i].enabled; }
				}
				return false;
			}
			return this._cookieEnabled;
		}
	});
	dojox.grid.EnhancedGrid.registerPlugin(dojox.grid.enhanced.plugins.Cookie/*name:'cookie'*/, {"preInit": true});
})();
