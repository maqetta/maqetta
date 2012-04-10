define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"../../core/_Module",
	"./Exporter"
], function(declare, lang, _Module){

/*=====
	dojo.declare('__TableExportArgs', __ExportArgs, {
		natualWidth: false
		columnWidth: Associative array
	});
=====*/

	function cellattrs(args, col){
		var cw = args.columnWidth,
			w = (cw && cw[col.id]) || (args.natualWidth ? '' : col.getWidth()) || 'auto';
		return [' colid="', col.id, '" style="width:', w, '"'].join('');
	}

	return _Module.register(
	declare(/*===== "gridx.modules.exporter.Table", =====*/_Module, {
		// summary:
		//		This module provides the API to export grid contents to an HTML table, which is mainly used in print.

		name: 'exportTable',

		forced: ['exporter'],

		getAPIPath: function(){
			return {
				exporter: {
					toTable: lang.hitch(this, this.toTable)
				}
			};
		},
	
		//Public ---------------------------------------------------------------------
		toTable: function(/* __TableExportArgs */ args){
			// summary:
			//		Export the grid contents to HTML table according to the given args.
			//		This method should be called through grid.exporter.toCSV();
			// args: __TableExportArgs?
			//		The args to configure the export result and the export process.
			// returns:
			//		A deferred object indicating when the export process is completed,
			//		and then pass the exported HTML table (as string) to callbacks.
			return this.grid.exporter._export(this, args || {});	//dojo.Deferred
		},

		//Package --------------------------------------------------------------------
		initialize: function(/* __TableExportArgs */ args){
			// tags:
			//		private
			this._rst = ['<table class="grid"',
				args.natualWidth ? '' : ' style="table-layout:fixed;"',
				' border="0" cellpadding="0" cellspacing="0">'
			];
		},

		beforeHeader: function(){
			// tags:
			//		private
			this._rst.push('<thead><tr class="grid_header">');
		},

		handleHeaderCell: function(/* __ExportContext */ context, /* __TableExportArgs */ args){
			// tags:
			//		private
			var col = context.column;
			this._rst.push('<th class="grid_header_cell"', cellattrs(args, col), '>', col.name(), '</th>');
		},

		afterHeader: function(){
			// tags:
			//		private
			this._rst.push('</tr><thead>');
		},

		beforeBody: function(){
			// tags:
			//		private
			this._rst.push('<tbody>');
		},

		beforeRow: function(/* __ExportContext */  context){
			// tags:
			//		private
			var r = context.row, idx = r.index();
			this._rst.push('<tr class="grid_row grid_row_', idx % 2 ? 'even' : 'odd',
				'" rowid="', r.id, '" rowindex="', idx, '">');
		},

		handleCell: function(/* __ExportContext */  context, /* __TableExportArgs */ args){
			// tags:
			//		private
			this._rst.push('<td class="grid_cell"', cellattrs(args, context.column), '>', context.data, '</td>');
		},

		afterRow: function(){
			// tags:
			//		private
			this._rst.push('</tr>');
		},

		afterBody: function(){
			// tags:
			//		private
			this._rst.push('</tbody></table>');
		},

		getResult: function(){
			// tags:
			//		private
			return this._rst.join('');
		}
	}));
});
