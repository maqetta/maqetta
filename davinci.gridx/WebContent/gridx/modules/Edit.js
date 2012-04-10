define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/json",
	"dojo/_base/Deferred",
	"dojo/_base/sniff",
	"dojo/dom-class",
	"dojo/keys",
	"../core/_Module",
	"../util",
	"dojo/date/locale",
	"dijit/form/TextBox"
], function(declare, lang, json, Deferred, sniff, domClass, keys, _Module, util, locale){
	
	/*=====
	var columnDefinitionEditorMixin = {
		// editable: Boolean
		//		If true then the cells in this column will be editable. Default is false.
		editable: false, 

		// alwaysEditing: Boolean
		//		If true then the cells in this column will always be in editing mode. Default is false.
		alwaysEditing: false,
	
		// applyWhen: String
		//		When alwaysEditing, the changed value will by default be applied to store when the editor is blurred.
		//		But sometimes it might be better to apply the change at a different time, for example: when the click
		//		a checkbox in a cell, it ususally is expected to take effect at once.
		//		This argument is a method name of the editor used in this column, for example: 'onClick'. If this
		//		argument is provided, the changes will be applied to the store when that method is called instead of
		//		'onBlur'.
		applyWhen: 'onBlur',

		// editor: Widget Class (Function) | String
		//		Set the dijit/widget to be used when a cell is in editing mode.
		//		The default dijit is dijit.form.TextBox.
		//		This attribute can either be the declared class name of a dijit or 
		//		the class construct function of a dijit (the one that is used behide "new" keyword).
		editor: "dijit.form.TextBox",
	
		// editorArgs: __GridCellEditorArgs
		editorArgs: null
	};
	
	var __GridCellEditorArgs = {
		// toEditor: Function(storeData, gridData) return anything
		//		By default the dijit used in an editing cell will use store value.
		//		If this default behavior can not meet the requirement (for example, store data is freely formatted date string,
		//		while the dijit is dijit.form.DateTextBox, which requires a Date object), this function can be used.
		toEditor: null,
	
		// fromEditor: Function(valueInEditor) return anything
		//		By default when applying an editing cell, the value of the editor dijit will be retreived by get('value') and
		//		directly set back to the store. If this can not meet the requirement, this getEditorValue function can be used
		//		to get a suitable value from editor.
		fromEditor: null,
	
		// dijitProperties: Properties for a dijit
		//		The properties to be used when creating the dijit in a editing cell.
		dijitProperties: null
	};
	=====*/
	function getTypeData(col, storeData, gridData){
		if(col.storePattern && (col.dataType == 'date' || col.dataType == 'time')){
			return locale.parse(storeData, col.storePattern);
		}
		return gridData;
	}

	function dateTimeFormatter(field, parseArgs, formatArgs, rawData){
		var d = locale.parse(rawData[field], parseArgs);
		return d ? locale.format(d, formatArgs) : rawData[field];
	}

	function getEditorValueSetter(toEditor){
		return toEditor && function(gridData, storeData, cellWidget){
			var v = toEditor(storeData, gridData);
			cellWidget.gridCellEditField.set('value', v);
		};
	}
	
	_Module._markupAttrs.push('!editable', '!alwaysEditing', 'editor', '!editorArgs', 'applyWhen');
	
	return _Module.register(
	declare(/*===== "gridx.modules.Edit", =====*/_Module, {
		// summary:
		//		This module provides editing mode for grid cells.
		// description:
		//		This module relies on an implementation of the CellWidget module.
		//		The editing mode means there will be an editable widget appearing in the grid cell.
		//		This implementation also covers "alwaysEditing" mode for grid columns,
		//		which means all the cells in this column are always in editing mode.

		name: 'edit',
	
		forced: ['cellWidget'],
	
		constructor: function(){
			this._editingCells = {};
			for(var i = 0, cols = this.grid._columns, len = cols.length; i < len; ++i){
				var c = cols[i];
				if(c.storePattern && c.field && (c.dataType == 'date' || c.dataType == 'time')){
					c.gridPattern = c.gridPattern || 
						(!lang.isFunction(c.formatter) && 
							(lang.isObject(c.formatter) || 
							 typeof c.formatter == 'string') && 
						c.formatter) || 
						c.storePattern;
					var pattern;
					if(lang.isString(c.storePattern)){
						pattern = c.storePattern;
						c.storePattern = {};
						c.storePattern[c.dataType + 'Pattern'] = pattern;
					}
					c.storePattern.selector = c.dataType;
					if(lang.isString(c.gridPattern)){
						pattern = c.gridPattern;
						c.gridPattern = {};
						c.gridPattern[c.dataType + 'Pattern'] = pattern;
					}
					c.gridPattern.selector = c.dataType;
					c.formatter = lang.partial(dateTimeFormatter, c.field, c.storePattern, c.gridPattern);
				}
			}
		},
	
		getAPIPath: function(){
			// tags:
			//		protected extension
			return {
				edit: this
			};
		},
	
		preload: function(){
			// tags:
			//		protected extension
			var t = this;
			t.connect(t.grid, 'onCellDblClick', '_onUIBegin');
			t.connect(t.grid.cellWidget, 'onCellWidgetCreated', '_onCellWidgetCreated');
			t._initAlwaysEdit();
			t._initFocus();
		},
	
		cellMixin: {
			beginEdit: function(){
				return this.grid.edit.begin(this.row.id, this.column.id);
			},
	
			cancelEdit: function(){
				this.grid.edit.cancel(this.row.id, this.column.id);
				return this;
			},
	
			applyEdit: function(){
				return this.grid.edit.apply(this.row.id, this.column.id);
			},
	
			isEditing: function(){
				return this.grid.edit.isEditing(this.row.id, this.column.id);
			}
		},
	
		columnMixin: {
			isEditable: function(){
				var col = this.grid._columnsById[this.id];
				return col.editable || col.alwaysEditing;
			},

			isAlwaysEditing: function(){
				return this.grid._columnsById[this.id].alwaysEditing;
			},
	
			setEditable: function(editable){
				this.grid._columnsById[this.id].editable = !!editable;
				return this;
			},
	
			editor: function(){
				return this.grid._columnsById[this.id].editor;
			},
	
			setEditor: function(/*dijit|short name*/dijitClass, args){
				this.grid.edit.setEditor(this.id, dijitClass, args);
				return this;
			}
		},
		
		//Public------------------------------------------------------------------------------
		begin: function(rowId, colId){
			// summary:
			//		Begin to edit a cell with defined editor widget.
			// rowId: String
			//		The row ID of this cell
			// colId: String
			//		The column ID of this cell
			// returns:
			//		A deferred object indicating when the cell has completely changed into eidting mode.
			var d = new Deferred(), t = this;
			if(!t.isEditing(rowId, colId)){
				var g = t.grid,
					rowIndex = t.model.idToIndex(rowId),
					col = g._columnsById[colId];
				if(rowIndex >= 0 && col.editable){
					g.cellWidget.setCellDecorator(rowId, colId, 
						t._getDecorator(colId), 
						getEditorValueSetter((col.editorArgs && col.editorArgs.toEditor) ||
							lang.partial(getTypeData, col))
					);
					t._record(rowId, colId);
					g.body.refreshCell(rowIndex, col.index).then(function(){
						t._focusEditor(rowId, colId);
						d.callback(true);
					});
				}else{
					d.callback(false);
				}
			}else{
				t._record(rowId, colId);
				t._focusEditor(rowId, colId);
				d.callback(true);
			}
			return d;	//dojo.Deferred
		},
	
		cancel: function(rowId, colId){
			// summary:
			//		Cancel the edit. And end the editing state.
			// rowId: String
			//		The row ID of this cell
			// colId: String
			//		The column ID of this cell
			// returns:
			//		A deferred object indicating when the cell value has been successfully restored.
			var d = new Deferred(),
				t = this,
				m = t.model,
				rowIndex = m.idToIndex(rowId);
			if(rowIndex >= 0){
				var g = t.grid,
					cw = g.cellWidget, 
					col = g._columnsById[colId];
				if(col){
					if(col.alwaysEditing){
						var rowCache = m.byId(rowId);
						cw = cw.getCellWidget(rowId, colId);
						cw.setValue(rowCache.data[colId], rowCache.rawData[col.field]);
						d.callback();
					}else{
						t._erase(rowId, colId);
						cw.restoreCellDecorator(rowId, colId);
						g.body.refreshCell(rowIndex, col.index).then(function(){
							d.callback();
						});
					}
				}
			}else{
				d.callback();
			}
			return d;	//dojo.Deferred
		},
	
		apply: function(rowId, colId){
			// summary:
			//		Apply the edit value to the grid store. And end the editing state.
			// rowId: String
			//		The row ID of this cell
			// colId: String
			//		The column ID of this cell
			// returns:
			//		A deferred object indicating when the change has been written back to the store.
			var d = new Deferred(),
				t = this,
				g = t.grid,
				cell = g.cell(rowId, colId, 1);
			if(cell){
				var widget = g.cellWidget.getCellWidget(rowId, colId);
				if(widget && widget.gridCellEditField){
					var v = widget.gridCellEditField.get('value');
					try{
						var editorArgs = cell.column.editorArgs;
						if(editorArgs && editorArgs.fromEditor){
							v = editorArgs.fromEditor(v);
						}else if(cell.column.storePattern){
							v = locale.format(v, cell.column.storePattern);
						}
						cell.setRawData(v).then(function(){
							if(cell.column.alwaysEditing){
								t._erase(rowId, colId);
								d.callback(true);
							}else{
								g.cellWidget.restoreCellDecorator(rowId, colId);
								t._erase(rowId, colId);
								g.body.refreshCell(cell.row.index(), cell.column.index()).then(function(){
									d.callback(true);
								});
							}
						});
					}catch(e){
						g.cellWidget.restoreCellDecorator(rowId, colId);
						t._erase(rowId, colId);
						console.warn('Can not apply change! Error message: ', e);
						d.callback(false);
						return d;	//dojo.Deferred
					}
					return d;	//dojo.Deferred
				}
			}
			d.callback(false);
			return d;	//dojo.Deferred
		},
	
		isEditing: function(rowId, colId){
			// summary:
			//		Check whether a cell is in editing mode.
			// rowId: String
			//		The row ID of this cell
			// colId: String
			//		The column ID of this cell
			// returns:
			//		Whether the cell is in eidting mode.
			var col = this.grid._columnsById[colId];
			if(col && col.alwaysEditing){
				return true;
			}
			var widget = this.grid.cellWidget.getCellWidget(rowId, colId);
			return !!widget && !!widget.gridCellEditField;	//Boolean
		},
	
		setEditor: function(colId, editor, args){
			// summary:
			//		Define the editor widget to edit a column of a grid.
			//		The widget should have a get and set method to get value and set value.
			// colId: String
			//		A column ID
			// editor: Function|String
			//		Class constructor or declared name of an editor widget
			// args: __GridCellEditorArgs?
			//		Any args that are related to this editor.
			var col = this.grid._columnsById[colId],
				editorArgs = col.editorArgs = col.editorArgs || {};
			col.editor = editor;
			if(args){
				editorArgs.toEditor = args.toEditor;
				editorArgs.fromEditor = args.fromEditor;
				editorArgs.dijitProperties = args.dijitProperties;
			}
		},
	
		//Private------------------------------------------------------------------
		_initAlwaysEdit: function(){
			for(var t = this, cols = t.grid._columns, i = cols.length - 1; i >= 0; --i){
				var col = cols[i];
				if(col.alwaysEditing){
					col.navigable = true;
					col.userDecorator = t._getDecorator(col.id);
					col.setCellValue = getEditorValueSetter((col.editorArgs && col.editorArgs.toEditor) ||
							lang.partial(getTypeData, col));
					col.decorator = function(){ return ''; };
					//FIXME: this breaks encapsulation
					col._cellWidgets = {};
					col._backupWidgets = [];
				}
			}
		},

		_getColumnEditor: function(colId){
			var editor = this.grid._columnsById[colId].editor;
			if(lang.isFunction(editor)){
				return editor.prototype.declaredClass;
			}else if(lang.isString(editor)){
				return editor;
			}else{
				return 'dijit.form.TextBox';
			}
		},

		_onCellWidgetCreated: function(widget, column){
			if(widget.gridCellEditField && column.alwaysEditing){
				var t = this,
					w = widget.gridCellEditField;
				widget.connect(w, column.applyWhen || 'onBlur', function(){
					var rn = widget.domNode.parentNode;
					while(rn && !domClass.contains(rn, 'gridxRow')){
						rn = rn.parentNode;
					}
					if(rn){
						t.apply(rn.getAttribute('rowid'), column.id);
					}
				});
			}
		},
	
		_focusEditor: function(rowId, colId){
			var cw = this.grid.cellWidget,
				func = function(){
					var widget = cw.getCellWidget(rowId, colId);
					if(widget && widget.gridCellEditField){
						widget.gridCellEditField.focus();
					}
				};
			if(sniff('webkit')){
				func();
			}else{
				setTimeout(func, 1);
			}
		},
	
		_getDecorator: function(colId){
			var className = this._getColumnEditor(colId),
				p, properties,
				col = this.grid._columnsById[colId],
				dijitProperties = (col.editorArgs && col.editorArgs.dijitProperties) || {},
				pattern = col.gridPattern || col.storePattern;
			if(pattern){
				lang.mixin(dijitProperties.constraints = dijitProperties.constraints || {}, pattern);
			}
			properties = json.toJson(dijitProperties);
			return function(){
				return ["<div data-dojo-type='", className, "' ",
					"data-dojo-attach-point='gridCellEditField' ",
					"class='gridxCellEditor gridxHasGridCellValue gridxUseStoreData' ",
					"data-dojo-props='",
					properties.substring(1, properties.length - 1),
					"'></div>"
				].join('');
			};
		},
	
		
		_record: function(rowId, colId){
			var cells = this._editingCells, r = cells[rowId];
			if(!r){
				r = cells[rowId] = {};
			}
			r[colId] = 1;
		},
	
		_erase: function(rowId, colId){
			var cells = this._editingCells, r = cells[rowId];
			if(r){
				delete r[colId];
			}
		},

		_applyAll: function(){
			var cells = this._editingCells, r, c;
			for(r in cells){
				for(c in cells[r]){
					this.apply(r, c);
				}
			}
		},

		_onUIBegin: function(evt){
			this._applyAll();
			return this.begin(evt.rowId, evt.columnId);
		},
	
		//Focus-----------------------------------------------------
		_initFocus: function(){
			var t = this, f = t.grid.focus;
			if(f){
				f.registerArea({
					name: 'edit',
					priority: 1,
					scope: t,
					doFocus: t._onFocus,
					doBlur: t._doBlur,
					onFocus: t._onFocus,
					onBlur: t._onBlur,
					connects: [
						t.connect(t.grid, 'onCellKeyPress', '_onKey'),
						t.connect(t, '_focusEditor', '_focus')
					]
				});
			}
		},

		_onFocus: function(evt){
			var t = this;
			if(evt){
				var n = evt.target;
				while(n && !domClass.contains(n, 'gridxCell')){
					n = n.parentNode;
				}
				if(n){
					var colId = n.getAttribute('colid'),
						rowId = n.parentNode.parentNode.parentNode.parentNode.getAttribute('rowid');
					if(t.isEditing(rowId, colId)){
						t._record(rowId, colId);
						//FIXME
//                        t._editing = true;
//                        t._focusCellCol = colId;
//                        t._focusCellRow = rowId;
						return true;
					}
				}
				return false;
			}
			return t._editing;
		},

		_doBlur: function(evt, step){
			var t = this, g = t.grid, body = g.body;
			if(t._editing){
				var rowIndex = body.getRowInfo({
						parentId: t.model.treePath(t._focusCellRow).pop(), 
						rowIndex: t.model.idToIndex(t._focusCellRow)
					}).visualIndex,
					colIndex = g._columnsById[t._focusCellCol].index,
					dir = step > 0 ? 1 : -1,
					checker = function(r, c){
						return g._columns[c].editable;
					};
				body._nextCell(rowIndex, colIndex, dir, checker).then(function(obj){
					util.stopEvent(evt);
					t._applyAll();
					t._focusCellCol = g._columns[obj.c].id;
					var rowInfo = body.getRowInfo({visualIndex: obj.r});
					t._focusCellRow = t.model.indexToId(rowInfo.rowIndex, rowInfo.parentId);
					//This breaks encapsulation a little....
					body._focusCellCol = obj.c;
					body._focusCellRow = obj.r;
					t.begin(t._focusCellRow, t._focusCellCol);
				});
				return false;
			}
			return true;
		},

		_onBlur: function(){
			this._applyAll();
			this._editing = false;
			return true;
		},
		
		_focus: function(rowId, colId){
			var t = this;
			t._editing = true;
			t._focusCellCol = colId;
			t._focusCellRow = rowId;
			t.grid.focus.focusArea('edit');
		},

		_blur: function(){
			this._editing = false;
			var focus = this.grid.focus;
			if(focus){
				if(sniff('ie')){
					setTimeout(function(){
						focus.focusArea('body');
					}, 1);
				}else{
					focus.focusArea('body');
				}
			}
		},

		_onKey: function(e){
			var t = this;
			if(t.grid._columnsById[e.columnId].editable){
				var editing = t.isEditing(e.rowId, e.columnId);
				if(e.keyCode == keys.ENTER){
					if(editing){
						t.apply(e.rowId, e.columnId).then(function(success){
							if(success){
								t._blur();
							}
						});
					}else if(t.grid.focus.currentArea() == 'body'){
						//If not doing this, some dijit, like DateTextBox/TimeTextBox will show validation error.
						util.stopEvent(e);
						t._onUIBegin(e);
					}
				}else if(e.keyCode == keys.ESCAPE && editing){
					t.cancel(e.rowId, e.columnId).then(lang.hitch(t, t._blur));
				}
			}
			if(t._editing && e.keyCode !== keys.TAB){
				e.stopPropagation();
			}
		}
	}));
});
