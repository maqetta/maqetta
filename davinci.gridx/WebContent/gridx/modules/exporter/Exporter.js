define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"../../core/_Module",
	"dojo/_base/Deferred",
	"dojo/_base/array"
], function(declare, lang, _Module, Deferred, array){

/*=====
	__ExportArgs = function(){
		//columns: String[]?
		//		An array of column ID. Indicates which columns to be exported. 
		//		If invalid or empty array, export all grid columns.
		//start: Number?
		//		Indicates from which row to start exporting. If invalid, 
		//		default to 0.
		//count: Number?
		//		Indicates the count of rows export.
		//		If invalid, export all rows up to the end of grid.
		//selectedOnly: Boolean?
		//		Whether only export selected rows. This constraint is applied 
		//		upon the rows specified by start and count parameters.
		//		This paramter and the filter parameter can be used togetther. 
		//		Default to false.
		//filter: Function?
		//		A predicate function (returns Boolean) to judge whether to 
		//		export a row. 
		//		This constraint is applied upon the result rows of the 
		//		selectedOnly parameter, if provided.
		//useStoreData: Boolean?
		//		Indicates whether to export grid data (formatted data) or 
		//		store data. Default to false.
		//formatters: Associative array?
		//		A customized way to export data, if neither grid data nor store 
		//		data could meet the requirement. 
		//		This is an associative array from column id to formatter function. 
		//		A grid cell object will be passed into that function as an argument.
		//omitHeader: Boolean?
		//		Indicates whether to export grid header. Default to false.
		//progressStep: Number?
		//		Number of rows in each progress. Default to 0 (invalid means only one progress).
		//		After each progress, the deferred.progress() is called, so the 
		//		exporting process can be controlled by the user.
	};
=====*/

/*=====
	var __ExportContext = function(){
		//columnIds: String[]
		//		Available for header.
		//column: Grid Column
		//		Available for header cell or a body cell.
		//row: Grid Row
		//		Available for a row or a body cell.
		//cell: Grid Cell
		//		Available for a body cell
	};
=====*/

	function check(writer, method, context, args){
		return !writer[method] || false !== writer[method](context || args, args);
	}

	function prepareReqs(args, rowIndexes, size){
		var reqs = [],
			i, start = 0, end = 0,
			ps = args.progressStep;
		if(typeof args.start == 'number' && args.start >= 0){
			start = args.start;
		}
		if(typeof args.count == 'number' && args.count > 0){
			end = start + args.count;
		}
		end = end || size;
		if(rowIndexes){
			rowIndexes = array.filter(rowIndexes, function(idx){
				return idx >= start && idx < end;
			});
			if(rowIndexes.length && (!ps || rowIndexes.length <= ps)){
				reqs.push(rowIndexes);
			}else{
				for(i = 0; i < rowIndexes.length; i += ps){
					reqs.push(rowIndexes.slice(i, i + ps));
				}
			}
		}else{
			var count = end - start;
			if(!ps || count <= ps){
				reqs.push({
					start: start,
					count: count
				});
			}else{
				for(i = start; i < end; i += ps){
					reqs.push({
						start: i,
						count: i + ps < end ? ps : end - i
					});
				}
			}
		}
		reqs.p = 0;
		return reqs;
	}

	function first(req, grid){
		return lang.isArray(req) ? {
			p: 0,
			row: grid.row(req[0])
		} : {
			p: req.start,
			row: grid.row(req.start)
		};
	}

	function next(req, grid, prevRow){
		var p = prevRow.p + 1,
			isArray = lang.isArray(req);
		return p < (isArray ? req.length : req.start + req.count) ? {
			p: p,
			row: grid.row(isArray ? req[p] : p)
		} : null;
	}

	return _Module.register(
	declare(_Module, {
		name: 'exporter',

		getAPIPath: function(){
			return {
				'exporter': this
			};
		},
	
		//Package ---------------------------------------------------------------------
		_export: function(writer, /* __ExportArgs */ args){
			// summary:
			//		Go through the grid using the given args and writer implementation.
			//		Return a dojo.Deferred object. Users can cancel and see progress 
			//		of the exporting process.
			//		Pass the exported result to the callback function of the Deferred object.
			// tags:
			//		private
			var d = new Deferred,
				t = this,
				model = t.model,
				cols = t._getColumns(args),
				s = t.grid.select,
				sr = s && s.row,
				sc = s && s.column,
				waitForRows,
				rowIds,
				context = {
					columnIds: cols
				},
				success = function(){
					check(writer, 'afterBody', context, args);
					d.callback(writer.getResult());
				},
				fail = lang.hitch(d, d.errback);
			
			try{
				check(writer, 'initialize', 0, args);
				if(!args.omitHeader && check(writer, 'beforeHeader', context, args)){
					array.forEach(cols, function(cid){
						context.column = t.grid.column(cid, 1);	//1 as true
						check(writer, 'handleHeaderCell', context, args);
					});
					check(writer, 'afterHeader', context, args);
				}
				if(check(writer, 'beforeBody', context, args)){
					if(args.selectedOnly && sr && (!sc || !sc.getSelected().length)){
						waitForRows = model.when().then(function(){
							rowIds = sr.getSelected();
						}, fail);
					}
					Deferred.when(waitForRows, function(){
						var rowIdxes,
							waitForRowIndex = rowIds && model.when({id: rowIds}, function(){
								rowIdxes = array.map(rowIds, function(id){
									return model.idToIndex(id);
								});
								rowIdxes.sort(function(a, b){
									return a - b;
								});
							}, fail);
						Deferred.when(waitForRowIndex, function(){
							var dd = new Deferred,
								rowCount = model.size();
							t._fetchRows(d, writer, context, args, dd, prepareReqs(args, rowIdxes, rowCount));
							dd.then(success, fail);
						}, fail);
					}, fail);
				}else{
					d.callback(writer.getResult());
				}
			}catch(e){
				fail(e);
			}
			return d;
		},

		//Private---------------------------------------------------------------------------
		_fetchRows: function(defer, writer, context, args, d, reqs){
			var t = this,
				g = t.grid,
				f = args.filter,
				cols = context.columnIds,
				req = reqs[reqs.p++],
				fail = lang.hitch(d, d.errback),
				func = function(){
					t.model.when(req, function(){
						for(var r = first(req, g); r && r.row; r = next(req, g, r)){
							context.row = r.row;
							if((!f || f(r.row)) && check(writer, 'beforeRow', context, args)){
								for(var i = 0; i < cols.length; ++i){
									var col = g.column(cols[i], 1),	//1 as true
										cell = context.cell = g.cell(r.row, col);
									context.column = col;
									context.data = t._format(args, cell);
									check(writer, 'handleCell', context, args);
								}
								check(writer, 'afterRow', context, args);
							}
						}
					}).then(function(){
						t._fetchRows(defer, writer, context, args, d, reqs);
					}, fail);
				};
			if(req){
				defer.progress(reqs.p / reqs.length);
				if(reqs.length > 1){
					setTimeout(func, 10);
				}else{
					func();
				}
			}else{
				d.callback();
			}
		},

		_format: function(args, cell){
			var fs = args.formatters,
				cid = cell.column.id;
			if(fs && lang.isFunction(fs[cid])){
				return fs[cid](cell);
			}else if(args.useStoreData){
				return cell.rawData() || '';
			}
			return cell.data() || '';
		},

		_getColumns: function(args){
			var g = this.grid,
				colsById = g._columnsById,
				s = g.select,
				sc = s && s.column,
				cols;
			if(lang.isArrayLike(args.columns) && args.columns.length){
				cols = array.filter(args.columns, function(cid){
					return colsById[cid];
				});
				cols.sort(function(a, b){
					return colsById[a].index - colsById[b].index;
				});
			}else{
				cols = array.map(g._columns, function(c){
					return c.id;
				});
			}
			return cols;
		}
	}));
});
