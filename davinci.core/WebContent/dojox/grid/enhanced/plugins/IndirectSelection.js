dojo.provide("dojox.grid.enhanced.plugins.IndirectSelection");

dojo.require("dojox.grid.cells.dijit");
dojo.require("dojox.grid.cells._base");

dojo.declare("dojox.grid.enhanced.plugins.IndirectSelection", null, {
	//	summary:
	//		 Provides indirect selection feature - swipe selecting row(s)
	// example:
	// 		 <div dojoType="dojox.grid.EnhancedGrid" plugins="{indirectSelection: true}" ...></div>
	// 	  or <div dojoType="dojox.grid.EnhancedGrid" plugins="{indirectSelection: {name: 'xxx', width:'30px', styles:'text-align: center;'}}" ...></div>	

	constructor: function(inGrid){
		this.grid = inGrid;
		//Hook grid.layout.setStructure(), so that indirect selection cell is included in the new structure
		dojo.connect(inGrid.layout, 'setStructure', dojo.hitch(inGrid.layout, this.addRowSelectCell));
	},
	
	addRowSelectCell: function(){
		//summary:
		//		Add the indirect selection cell(mapped to a column of checkboxes) to grid layout structure
		if(!this.grid.indirectSelection || this.grid.selectionMode == 'none'){
			return;
		}
		var rowSelectCellAdded = false, inValidFields = ['get', 'formatter', 'field', 'fields'],
		defaultCellDef = {type: dojox.grid.cells.DijitMultipleRowSelector, name: '', editable: true, width:'30px', styles:'text-align: center;'};
		dojo.forEach(this.structure, dojo.hitch(this, function(view){
			var cells = view.cells;
			if(cells && cells.length > 0 && !rowSelectCellAdded){
				var firstRow = cells[0];
				if(firstRow[0] && firstRow[0]['isRowSelector']){
					console.debug('addRowSelectCell() - row selector cells already added, return.');
					rowSelectCellAdded = true;
					return;
				}
				var selectDef, cellType = this.grid.selectionMode == 'single' ? dojox.grid.cells.DijitSingleRowSelector : dojox.grid.cells.DijitMultipleRowSelector;
				if(!dojo.isObject(this.grid.indirectSelection)){
					selectDef = dojo.mixin(defaultCellDef, {type: cellType});
				}else{
					selectDef = dojo.mixin(defaultCellDef, this.grid.indirectSelection, {type: cellType, editable: true});
					dojo.forEach(inValidFields, function(field){//remove invalid feilds
						if(field in selectDef){ delete selectDef[field]; }
					});
				}
				cells.length > 1 && (selectDef["rowSpan"] = cells.length);//for complicate layout
				dojo.forEach(this.cells, function(cell, i){
					if(cell.index >= 0){
						cell.index += 1;
						//console.debug('cell '+ (cell.index - 1) +  ' is updated to index ' + cell.index);
					}else{
						console.debug('Error:IndirectSelection.addRowSelectCell()-  cell ' + i + ' has no index!');
					}
				});
				var rowSelectCell = this.addCellDef(0, 0, selectDef);
				rowSelectCell.index = 0;
				firstRow.unshift(rowSelectCell);
				this.cells.unshift(rowSelectCell);
				this.grid.rowSelectCell = rowSelectCell;
				rowSelectCellAdded = true;
			}			
		}));		
		this.cellCount = this.cells.length;
	}
});

dojo.declare("dojox.grid.cells._SingleRowSelectorMixin", null, {
	//	summary:
	//		 Common attributes and functions to be mixed in for single selection	

	//alwaysEditing: Boolean
	//		Overwritten, see dojox.grid.cells._Widget
	//		True - always show the radio or checkbox widget
	alwaysEditing: true,
	
	//widgetMap: Object
	//		Cache all the radio or checkbox widgets
	widgetMap:{},
	
	//widget: Object
	//		The currently focused widget
	widget: null,
	
	//isRowSelector: Boolean
	//		Marker of indirect selection cell(column)
	isRowSelector: true,

	//defaultValue: Boolean
	//		Default value for radio or checkbox widget
	defaultValue: false,

	formatEditing: function(inDatum, inRowIndex){
		// summary:
		//		Overwritten, see dojox.grid.cells._Widget
		this.needFormatNode(inDatum, inRowIndex);
	},
	
	_formatNode: function(inDatum, inRowIndex){
		// summary:
		//		Overwritten, see dojox.grid.cells._Base
		this.formatNode(inDatum, inRowIndex);
	},

	setValue: function(inRowIndex, inValue){
		// summary:
		//		Overwritten, see dojox.grid.cells._Widget
		//		Simpily return, no action
		return;
	},
	
	get: function(inRowIndex){
		// summary:
		//		Overwritten, see dojox.grid.cells._Base
		//		return widget value of row(inRowIndex) -  true | false
		var widget = this.widgetMap[this.view.id] ? this.widgetMap[this.view.id][inRowIndex] : null;
		var value = widget ? widget.attr('checked') : '';
		return value;
	},
	
	_fireSelectionChanged: function(){
		// summary:
		//		Publish rowSelectionChangedTopic when new row selection is made
		dojo.publish(this.grid.rowSelectionChangedTopic,[this]);
	},
	
	_selectionChanged: function(obj){
		// summary:
		//		Subscriber of rowSelectionChangedTopic, update row selection accordingly
		// obj: Object
		//		Object that fired the rowSelectionChangedTopic
		if(obj == this || obj.grid && obj.grid != this.grid){
			//ignore if the topic is published by self
			return;
		}
		for (var i in this.widgetMap[this.view.id]){
			var idx = new Number(i);
			var widget = this.widgetMap[this.view.id][idx];
			var value = !!this.grid.selection.selected[idx];
			widget.attr('checked', value);
		}
		this.defaultValue = false;
		this.grid.edit.isEditing() && this.grid.edit.apply();
	},
	
	_toggleSingleRow: function(idx, value){
		// summary:
		//		toggle selection of a single row
		// idx: Integer
		//		Target row index
		// value: Boolean
		//		True - checked | False - unchecked
		var widget;
		dojo.hitch(this.grid.selection, dojox.grid.Selection.prototype[value ? 'addToSelection' : 'deselect'])(idx);
		if(this.widgetMap[this.view.id] && (widget = this.widgetMap[this.view.id][idx])){
			widget.attr('checked', value);			
		}
		this._fireSelectionChanged();
	},	

	inIndirectSelectionMode: function(){},
	
	toggleAllSelection: function(){}
});

dojo.declare("dojox.grid.cells._MultipleRowSelectorMixin", null, {
	//	summary:
	//		 Common attributes and functions to be mixed in for multiple selection

	//swipeStartRowIndex: Integer
	//		Start row index for swipe selection
	swipeStartRowIndex: -1,

	//swipeMinRowIndex: Integer
	//		Min row index for swipe selection	
	swipeMinRowIndex: -1,
	
	//swipeMinRowIndex: Integer
	//		Max row index for swipe selection
	swipeMaxRowIndex: -1,
	
	//toSelect: Boolean
	//		selection new state
	toSelect: false,
	
	//lastClickRowIdx: Integer
	//		Row index for last click, used for range selection via Shift + click	
	lastClickRowIdx: -1,
	
	//toggleAllTrigerred: Boolean
	//		Whether toggle all has been triggered or not	
	toggleAllTrigerred: false,

	//_inDndSelection: Boolean
	//		Whether in DnD row selection progress or not	
	_inDndSelection: false,

	domousedown: function(e){
		//summay:
		//		Event hanlder for mouse down event
		// e: Event
		//		Mouse down event
		if(e.target.tagName == 'INPUT'){
			this._startSelection(e.rowIndex);
			//console.debug('domousedown()- set swipeStartRowIndex='+this.swipeStartRowIndex + ' toSelect='+this.toSelect);
		}
		dojo.stopEvent(e);
	},
	
	domousemove: function(e){
		// summay:
		//		Event hanlder for mouse move event
		// e: Event
		//		Mouse move event
		this._updateSelection(e, 0);
	},
		
	onRowMouseOver: function(e){
		// summary:
		//		Event fired when mouse moves over a data row.
		// e: Event
		//		Decorated event object which contains reference to grid, cell, and rowIndex
		this._updateSelection(e, 0);
		if(this.grid.dnd){
			this._inDndSelection = this.grid.select.isInSelectingMode('row');
		}
	},
	
	domouseup: function(e){
		// summay:
		//		Event hanlder for mouse up event
		// e: Event
		//		Mouse up event
		dojo.isIE && this.view.content.decorateEvent(e);//TODO - why only e in IE hasn't been decoreated?
		var inSwipeSelection = e.cellIndex >= 0 && (this.inIndirectSelectionMode() || this._inDndSelection) && !this.grid.edit.isEditRow(e.rowIndex);
		inSwipeSelection && this._focusEndingCell(e.rowIndex, e.cellIndex);
		this._finisheSelect();
	},
	
	dokeyup: function(e){
		// summay:
		//		Event hanlder for key up event
		// e: Event
		//		Key up event
		if(!e.shiftKey){
			this._finisheSelect();
		}
	},
	
	_startSelection: function(rowIndex){
		// summay:
		//		Initilize parameters to start a new swipe selection
		// rowIndex: Integer
		//		Index of the start row
		this.swipeStartRowIndex = this.swipeMinRowIndex = this.swipeMaxRowIndex = rowIndex;
		this.toSelect = !this.widgetMap[this.view.id][rowIndex].attr('checked');
	},
	
	_updateSelection: function(e, delta){
		// summay:
		//		Update row selections, fired during a swipe selection
		// e: Event
		//		Event of the current row,
		// delta: Integer
		//		Row index delta, used for swipe selection via Shift + Cursor
		//		0: not via Shift + Cursor, -1 : Shift +  Up, 1 : Shift + Down
		if(this.swipeStartRowIndex < 0){
			return;
		}
		var byKey = delta !=0;//whether via Shift + Cursor
		//this.defaultValue = false;
		//index delta between the current row and starting row
		var deltaRow = e.rowIndex - this.swipeStartRowIndex + delta;
		deltaRow > 0 && (this.swipeMaxRowIndex < e.rowIndex + delta) && (this.swipeMaxRowIndex = e.rowIndex + delta)
		deltaRow < 0 && (this.swipeMinRowIndex > e.rowIndex + delta) && (this.swipeMinRowIndex = e.rowIndex + delta);
		// only when the min != max, there is a RANGE for selection
		if (this.swipeMinRowIndex != this.swipeMaxRowIndex) {
			for (var i in this.widgetMap[this.view.id]) {
				var idx = new Number(i);
				var inRange = (idx >= (deltaRow > 0 ? this.swipeStartRowIndex : e.rowIndex + delta) &&
				idx <= (deltaRow > 0 ? e.rowIndex + delta : this.swipeStartRowIndex));
				var outOfRange = (idx >= this.swipeMinRowIndex && idx <= this.swipeMaxRowIndex);
				if (inRange && !(deltaRow == 0 && !this.toSelect)) {
					(this.widgetMap[this.view.id][idx]).attr('checked', this.toSelect);
					dojo.hitch(this.grid.selection, dojox.grid.Selection.prototype[this.toSelect ? 'addToSelection' : 'deselect'])(idx);
				//}else if (outOfRange && (this.toSelect || !byKey)) {
				}else if (outOfRange && !byKey) {
					(this.widgetMap[this.view.id][idx]).attr('checked', !this.toSelect);
					dojo.hitch(this.grid.selection, dojox.grid.Selection.prototype[!this.toSelect ? 'addToSelection' : 'deselect'])(idx);
				}
			}
		}
		this._fireSelectionChanged();
	},
	
	swipeSelectionByKey: function(e, delta){
		// summay:
		//		Update row selections, fired when Shift + Cursor is used for swipe selection
		//		See dojox.grid.enhanced._Events.onKeyDown
		// e: Event
		//		Event of the current row,
		// delta: Integer
		//		Row index delta, used for swipe selection via Shift + Cursor
		//		-1 : Shift +  Up, 1 : Shift + Down
		if(this.swipeStartRowIndex < 0) {
			//A new swipe selection starts via Shift + Cursor			
			this.swipeStartRowIndex = e.rowIndex;
			if(delta > 0){//Shift + Down
				this.swipeMaxRowIndex = e.rowIndex + delta;
				this.swipeMinRowIndex = e.rowIndex;
			}else{//Shift + UP
				this.swipeMinRowIndex = e.rowIndex + delta;
				this.swipeMaxRowIndex = e.rowIndex;	
			}
			this.toSelect = this.widgetMap[this.view.id][e.rowIndex].attr('checked');
		}
		this._updateSelection(e, delta);
	},
	
	_finisheSelect: function(){
		// summay:
		//		Reset parameters to end a swipe selection
		this.swipeStartRowIndex = -1;
		this.swipeMinRowIndex = -1;
		this.swipeMaxRowIndex = -1;
		this.toSelect = false;
	},
	
	inIndirectSelectionMode: function(){
		// summay:
		//		Reset parameters to end a swipe selection
		// return: Boolean
		//		Whether in swipe selection		
		return this.swipeStartRowIndex >= 0;
	},
	
	toggleAllSelection:function(checked){
		// summay:
		//		Toggle between select all and deselect all
		// checked: Boolean
		//		True - select all, False - deselect all
		for (var i in this.widgetMap[this.view.id]){
			var idx = new Number(i);
			var widget = this.widgetMap[this.view.id][idx];
			widget.attr('checked', checked);
			dojo.hitch(this.grid.selection, dojox.grid.Selection.prototype[checked ? 'addToSelection' : 'deselect'])(idx);
		}
		!checked && this.grid.selection.deselectAll();
		this.defaultValue = checked;
		this.toggleAllTrigerred = true;
		this._fireSelectionChanged();
	}
});

dojo.declare("dojox.grid.cells.DijitSingleRowSelector", [dojox.grid.cells._Widget, dojox.grid.cells._SingleRowSelectorMixin], {
	//	summary:
	//		Indirect selection cell for single selection mode, using dijit.form.RadioButton

	//widgetClass: Class
	//		widget class that will be used for indirect selection cell(column)
	widgetClass: dijit.form.RadioButton,
	
	constructor: function(){
		dojo.subscribe(this.grid.rowSelectionChangedTopic, this, this._selectionChanged);
		dojo.subscribe(this.grid.sortRowSelectionChangedTopic, this, this._selectionChanged);
		this.grid.indirectSelector = this;
	},

	formatNode: function(inDatum, inRowIndex){
		// summary:
		//		Overwritten, see dojox.grid.cells._Widget
		if(!this.widgetClass){
			return inDatum;
		}
		!this.widgetMap[this.view.id] && (this.widgetMap[this.view.id] = {});
		var currWidget = this.widgetMap[this.view.id][inRowIndex];
		
		var cellNode = this.getNode(inRowIndex);
		if(!cellNode){
			return;
		}
		var noAttachedWidget = !cellNode.firstChild || (currWidget && currWidget.domNode != cellNode.firstChild);
		var inNode = noAttachedWidget && !cellNode.firstChild ? cellNode.appendChild(dojo.create('div')) : cellNode.firstChild;
		
		if(!currWidget || dojo.isIE){
			!this.widgetProps && (this.widgetProps = {});
			this.widgetProps.name = 'select_' + this.view.id;
			var value = this.getDefaultValue(currWidget, inRowIndex);
			this.widget = currWidget = this.createWidget(inNode, inDatum, inRowIndex);
			this.widgetMap[this.view.id][inRowIndex] = currWidget;
			this.widget.attr('checked', value);
			dojo.connect(currWidget, '_onClick', dojo.hitch(this, function(e){
				this._selectRow(e, inRowIndex);
			}));
			dojo.connect(currWidget.domNode, 'onkeyup', dojo.hitch(this, function(e){
				e.keyCode == dojo.keys.SPACE && this._selectRow(e, inRowIndex, true);					
			}));			
			dojo.hitch(this.grid.selection, dojox.grid.Selection.prototype[value ? 'addToSelection' : 'deselect'])(inRowIndex);
		}else{
			this.widget = currWidget;
			dojo.addClass(this.widget.domNode, 'dojoxGridWidgetHidden');
			noAttachedWidget && this.attachWidget(inNode, inDatum, inRowIndex);
		}
		this.grid.rowHeightChanged(inRowIndex);
		//this.focus(inRowIndex);
		dojo.removeClass(this.widget.domNode, 'dojoxGridWidgetHidden');
		(inRowIndex == this.grid.lastRenderingRowIdx) && dojo.removeClass(this.grid.domNode, 'dojoxGridSortInProgress');
	},
	
	getDefaultValue: function(widget, inRowIndex){
		// summary:
		//		Get defaulst value for a widget
		// widget: Object
		//		Target widget
		// inRowIndex: Integer
		//		Row index of the widget			
		// return: Boolean
		//		True - checked | False - unchecked
		var value = widget ? widget.attr('checked') : this.defaultValue;
		if(!widget){
			if(this.grid.nestedSorting){
				value =  value || this.grid.getStoreSelectedValue(inRowIndex);	
			}
			value = this.grid.selection.isSelected(inRowIndex) ? true : value;
		}
		return value;
	},
	
	focus: function(inRowIndex){
		// summary:
		//		Set focus to the widget in the target row
		// inRowIndex: Integer
		//		Target row			
		var widget = this.widgetMap[this.view.id][inRowIndex];
		if(widget){
			setTimeout(dojo.hitch(widget, function(){
				dojox.grid.util.fire(this, "focus");
			}), 0);
		}
	},
	
	_focusEndingCell: function(inRowIndex, cellIndex){
		// summary:
		//		At the end of a swipe selection, set focus to the ending grid cell(inRowIndex,cellIndex)
		// inRowIndex: Integer
		//		Row index
		// cellIndex: Integer
		//		Column index							
		var cell = this.grid.getCell(cellIndex);
		this.grid.focus.setFocusCell(cell, inRowIndex);
		this.grid.isDndSelectEnable && this.grid.focus._blurRowBar();
	},

	_selectRow: function(e, inRowIndex, preChange){
		// summary:
		//		Select the target row
		// e: Event
		//		Event fired on the target row		
		// inRowIndex: Integer
		//		Target row index
		// preChange: Boolean
		//		Whether triggered before the selection state change of the target row
											
		//if(preChange){ //fix seleting radio by space only works in Moz
		if(dojo.isMoz && preChange){
			return;
		}
		dojo.stopEvent(e);
		//this.grid.selection.clickSelect(inRowIndex);
		this._focusEndingCell(inRowIndex, 0);

		var value = !this.grid.selection.selected[inRowIndex];
		this.grid.selection.deselectAll();
		this.grid.selection.addToSelection(inRowIndex);
		
		if (!dojo.isMoz) {//fix seleting radio by space only works in Moz
			var widget = this.widgetMap[this.view.id][inRowIndex];
			widget.attr('checked', true);
		}
		this._fireSelectionChanged();
	},
	
	toggleRow: function(idx, value) {
		// summary:
		//		toggle selection of a single row
		// idx: Integer
		//		Target row index
		// value: Boolean
		//		True - checked | False - unchecked
		var currSelectIdx = dojo.hitch(this.grid.selection, dojox.grid.Selection.prototype.getFirstSelected)();
		if(idx != currSelectIdx && !value || idx == currSelectIdx && value){return;}
		
		var widget;			
		if(idx != currSelectIdx && value && this.widgetMap[this.view.id] && (widget = this.widgetMap[this.view.id][currSelectIdx])){
			//fix - current selected widget isn't unchecked
			widget.attr('checked', false);			
		}
		this.grid.selection.deselectAll();
		this._toggleSingleRow(idx, value);
	},
	
	setDisabled: function(idx, disabled){
		// summary:
		//		toggle 'disabled' | 'enabled' of the selector widget in row idx
		// idx: Integer
		//		Row index
		// disabled: Boolean
		//		True - disabled | False - enabled
		if(this.widgetMap[this.view.id]){
			var widget = this.widgetMap[this.view.id][idx];
			widget && widget.attr('disabled', disabled);
		} 
	}
});

dojo.declare("dojox.grid.cells.DijitMultipleRowSelector", [dojox.grid.cells.DijitSingleRowSelector, dojox.grid.cells._MultipleRowSelectorMixin], {
	//summary:
	//		Indirect selection cell for multiple or extended mode, using dijit.form.CheckBox

	//widgetClass: Class
	//		widget class that will be used for indirect selection cell(column)
	widgetClass: dijit.form.CheckBox,
	
	constructor: function(){
		dojo.connect(dojo.doc, 'onmouseup', this, 'domouseup');
		this.grid.indirectSelector = this;
	},
	
	_selectRow: function(e, inRowIndex, preChange){
		// summary:
		//		Select the target row or range or rows
		// e: Event
		//		Event fired on the target row		
		// inRowIndex: Integer
		//		Target row index
		// preChange: Boolean
		//		Whether triggered before the selection state change of the target row
		
		dojo.stopEvent(e);
		this._focusEndingCell(inRowIndex, 0);
		var delta = inRowIndex - this.lastClickRowIdx;
		if(this.lastClickRowIdx >= 0 && !e.ctrlKey && !e.altKey && e.shiftKey){
			var newValue = this.widgetMap[this.view.id][inRowIndex].attr('checked');
			newValue = preChange ? !newValue : newValue;
			for (var i in this.widgetMap[this.view.id]) {
				var idx = new Number(i);
				var inRange = (idx >= (delta > 0 ? this.lastClickRowIdx : inRowIndex) 
				  			   && idx <= (delta > 0 ? inRowIndex :this.lastClickRowIdx));
				if(inRange){
					var widget = this.widgetMap[this.view.id][idx];
					widget.attr('checked', newValue);
					dojo.hitch(this.grid.selection, dojox.grid.Selection.prototype[newValue ? 'addToSelection' : 'deselect'])(idx);
				}
			}
		}else{
			//this.grid.selection.clickSelect(inRowIndex, true);	
			var value = !this.grid.selection.selected[inRowIndex];
			var widget = this.widgetMap[this.view.id][inRowIndex];
			widget.attr('checked', value);
			dojo.hitch(this.grid.selection, dojox.grid.Selection.prototype[value ? 'addToSelection' : 'deselect'])(inRowIndex);
		}
		//this.defaultValue = false;
		this.lastClickRowIdx = inRowIndex;
		this._fireSelectionChanged();
	},

	toggleRow: function(idx, value) {
		// summary:
		//		Overwritten
		this._toggleSingleRow(idx, value);
	}	
});
