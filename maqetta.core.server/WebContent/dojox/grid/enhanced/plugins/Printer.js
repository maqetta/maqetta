dojo.provide("dojox.grid.enhanced.plugins.Printer");

dojo.require("dojox.grid.enhanced._Plugin");
dojo.require("dojox.grid.enhanced.plugins.exporter.TableWriter");

dojo.declare("dojox.grid.enhanced.plugins.Printer", dojox.grid.enhanced._Plugin, {
	// summary:
	//		Provide printGrid function to the grid.
	// example:
	//	|	dojo.require("dojox.grid.enhanced.plugins.Printer");
	//	|	dijit.byId("grid1").printGrid("my grid",					//A title for the grid,optional
	//	|								["cssfile1.css","cssfile2.css"],//An array of css files to decorate the printed gird,optional
	//	|								{table:"border='border'"}		//tagName:"attrbuteList" pairs, optional,
	//	|																//control the html tags in the generated html
	//	|	);
	
	// __printArgs: {
	//		title: String
	//			A title of the printed page can be specified. Optional.
	//			If given, it's shown in an <h1> tag at the top of the page.
	//		cssFiles: Array | String
	//			CSS file paths. Optional.
	//			Every row and column is given CSS classes, including:
	//				grid_row_{row-number}, grid_odd_row, grid_even_row, grid_header,
	//				grid_col_{col-number}, grid_odd_col, grid_even_col
	//			{row_number} and {col-number} are both integers starting from 1.
	//			Row classes are for <thead> and <tbody> tags.
	//			Column classes are for <th> and <td> tags.
	//			Users can use these classes in the CSS files, but cannot define their own.
	//		writerArgs: Object (Association Array)
	//			Arguments for TableWriter.
	//		fetchArgs: object?
	//			Any arguments for store.fetch
	// }
	
	// name: String
	//		Plugin name
	name: "printer",
	
	constructor: function(grid){
		// summary:
		//		only newed by _Plugin
		// inGrid: EnhancedGrid
		//		The grid to plug in to.
		this.grid = grid;
		this._mixinGrid(grid);
		
		//For print, we usually need the HTML instead of raw data.
		grid.setExportFormatter(function(data, cell, rowIndex, rowItem){
			return cell.format(rowIndex, rowItem);
		});
	},
	_mixinGrid: function(){
		var g = this.grid;
		g.printGrid = dojo.hitch(this, this.printGrid);
		g.printSelected = dojo.hitch(this, this.printSelected);
		g.exportToHTML = dojo.hitch(this, this.exportToHTML);
		g.exportSelectedToHTML = dojo.hitch(this, this.exportSelectedToHTML);
		g.normalizePrintedGrid = dojo.hitch(this, this.normalizeRowHeight);
	},
	printGrid: function(args){
		// summary:
		//		Print all the data in the grid, using title as a title,
		//		decorating generated html by cssFiles,
		//		using tagName:"attrbuteList" pairs(writerArgs) to control html tags
		//		in the generated html string.
		// tags:
		//		public
		// args: __printArgs?
		//		Arguments for print.
		this.exportToHTML(args, dojo.hitch(this, this._print));
	},
	printSelected: function(args){
		// summary:
		//		Print selected data. All other features are the same as printGrid.
		//		For meaning of arguments see function *printGrid*
		// tags:
		//		public
		// args: __printArgs?
		//		Arguments for print.
		this._print(this.exportSelectedToHTML(args));
	},
	exportToHTML: function(args, onExported){
		// summary:
		//		Export to HTML string, but do NOT print.
		//		Users can use this to implement print preview.
		//		For meaning of the 1st-3rd arguments see function *printGrid*.
		// tags:
		//		public
		// args: __printArgs?
		//		Arguments for print.
		// onExported: function(string)
		//		call back function
		args = this._formalizeArgs(args);
		var _this = this;
		this.grid.exportGrid("table", args, function(str){
			onExported(_this._wrapHTML(args.title, args.cssFiles, args.titleInBody + str));
		});
	},
	exportSelectedToHTML: function(args){
		// summary:
		//		Export selected rows to HTML string, but do NOT print.
		//		Users can use this to implement print preview.
		//		For meaning of arguments see function *printGrid*
		// tags:
		//		public
		// args: __printArgs?
		//		Arguments for print.
		args = this._formalizeArgs(args);
		var str = this.grid.exportSelected("table", args.writerArgs);
		return this._wrapHTML(args.title, args.cssFiles, args.titleInBody + str);	//String
	},
	_print: function(/* string */htmlStr){
		// summary:
		//		Do the print job.
		// tags:
		//		private
		// htmlStr: String
		//		The html content string to be printed.
		// returns:
		//		undefined
		var win, _this = this,
			fillDoc = function(w){
				var doc = win.document;
				doc.open();
				doc.write(htmlStr);
				doc.close();
				_this.normalizeRowHeight(doc);
			};
		if(!window.print){
			//We don't have a print facility.
			return;
		}else if(dojo.isChrome || dojo.isOpera){
			//referred from dijit._editor.plugins.Print._print()
			//In opera and chrome the iframe.contentWindow.print
			//will also print the outside window. So we must create a
			//stand-alone new window.
			win = window.open("javascript: ''", "", "status=0,menubar=0,location=0,toolbar=0,width=1,height=1,resizable=0,scrollbars=0");
			fillDoc(win);
			//Opera will stop at this point, showing the popping-out window.
			//If the user closes the window, the following codes will not execute.
			//If the user returns focus to the main window, the print function
			// is executed, but still a no-op.
			win.print();
			win.close();
		}else{
			//Put private things in deeper namespace to avoid poluting grid namespace.
			var fn = this._printFrame,
				dn = this.grid.domNode;
			if(!fn){
				var frameId = dn.id + "_print_frame";
				if(!(fn = dojo.byId(frameId))){
					//create an iframe to store the grid data.
					fn = dojo.create("iframe");
					fn.id = frameId;
					fn.frameBorder = 0;
					dojo.style(fn, {
						width: "1px",
						height: "1px",
						position: "absolute",
						right: 0,
						bottoom: 0,
						border: "none",
						overflow: "hidden"
					});
					if(!dojo.isIE){
						dojo.style(fn, "visibility","hidden");
					}
					dn.appendChild(fn);
				}
				//Reuse this iframe
				this._printFrame = fn;
			}
			win = fn.contentWindow;
			fillDoc(win);
			// IE requires the frame to be focused for
			// print to work, but since this is okay for all
			// no special casing.
			dijit.focus(fn);
			win.print();
		}
	},
	_wrapHTML: function(/* string */title, /* Array */cssFiles, /* string */body_content){
		// summary:
		//		Put title, cssFiles, and body_content together into an HTML string.
		// tags:
		//		private
		// title: String
		//		A title for the html page.
		// cssFiles: Array
		//		css file pathes.
		// body_content: String
		//		Content to print, not including <head></head> part and <html> tags
		// returns:
		//		the wrapped HTML string ready for print
		var html = ['<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">',
					'<html><head><title>', title,
					'</title><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></meta>'];
		for(var i = 0; i < cssFiles.length; ++i){
			html.push('<link rel="stylesheet" type="text/css" href="' + cssFiles[i] + '" />');
		}
		html.push('</head>');
		if(body_content.search(/^\s*<body/i) < 0){
			body_content = '<body>' + body_content + '</body>';
		}
		html.push(body_content);
		return html.join('\n');	//String
	},
	normalizeRowHeight: function(doc){
		var views = dojo.query("table.grid_view", doc.body);
		var headPerView = dojo.map(views, function(view){
			return dojo.query("thead.grid_header", view)[0];
		});
		var rowsPerView = dojo.map(views, function(view){
			return dojo.query("tbody.grid_row", view);
		});
		var rowCount = rowsPerView[0].length;
		var i, v, h, maxHeight = 0;
		for(v = views.length - 1; v >= 0; --v){
			h = dojo.contentBox(headPerView[v]).h;
			if(h > maxHeight){
				maxHeight = h;
			}
		}
		for(v = views.length - 1; v >= 0; --v){
			dojo.style(headPerView[v], "height", maxHeight + "px");
		}
		for(i = 0; i < rowCount; ++i){
			maxHeight = 0;
			for(v = views.length - 1; v >= 0; --v){
				h = dojo.contentBox(rowsPerView[v][i]).h;
				if(h > maxHeight){
					maxHeight = h;
				}
			}
			for(v = views.length - 1; v >= 0; --v){
				dojo.style(rowsPerView[v][i], "height", maxHeight + "px");
			}
		}
		var left = 0;
		for(v = 0; v < views.length; ++v){
			dojo.style(views[v], "left", left + "px");
			left += dojo.marginBox(views[v]).w;
		}
	},
	_formalizeArgs: function(args){
		args = (args && dojo.isObject(args)) ? args : {};
		args.title = String(args.title) || "";
		if(!dojo.isArray(args.cssFiles)){
			args.cssFiles = [args.cssFiles];
		}
		args.titleInBody = args.title ? ['<h1>', args.title, '</h1>'].join('') : '';
		return args;	//Object
	}
});
dojox.grid.EnhancedGrid.registerPlugin(dojox.grid.enhanced.plugins.Printer/*name:'printer'*/, {
	"dependency": ["exporter"]
});
