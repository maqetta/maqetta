dojo.provide("dojox.grid._Selector");

dojo.require("dojox.grid.Selection");
dojo.require("dojox.grid._View");
dojo.require("dojox.grid._Builder");

(function(){
	dojox.grid._InputSelectorHeaderBuilder = dojo.extend(function(view){
		dojox.grid._HeaderBuilder.call(this, view);
	},dojox.grid._HeaderBuilder.prototype,{
		generateHtml: function(){
			var w = this.view.contentWidth || 0;
			var selectedCount = this.view.grid.selection.getSelectedCount();
			var checked = (selectedCount && selectedCount == this.view.grid.rowCount) ? ' dijitCheckBoxChecked dijitChecked' : '';
			return '<table style="width:' + w + 'px;" ' +
				'border="0" cellspacing="0" cellpadding="0" ' +
				'role="presentation"><tr><th style="text-align: center;">' +
				'<div class="dojoxGridCheckSelector dijitReset dijitInline dijitCheckBox' + checked + '"></div></th></tr></table>';
		},
		doclick: function(e){
			var selectedCount = this.view.grid.selection.getSelectedCount();

			this.view._selectionChanging = true;
			if(selectedCount==this.view.grid.rowCount){
				this.view.grid.selection.deselectAll();
			}else{
				this.view.grid.selection.selectRange(0, this.view.grid.rowCount-1);
			}
			this.view._selectionChanging = false;
			this.view.onSelectionChanged();
			return true;
		}
	});

	dojox.grid._SelectorContentBuilder = dojo.extend(function(view){
		dojox.grid._ContentBuilder.call(this, view);
	},dojox.grid._ContentBuilder.prototype,{
		generateHtml: function(inDataIndex, inRowIndex){
			var w = this.view.contentWidth || 0;
			return '<table class="dojoxGridRowbarTable" style="width:' + w + 'px;" border="0" ' +
				'cellspacing="0" cellpadding="0" role="presentation"><tr>' +
				'<td  style="text-align: center;" class="dojoxGridRowbarInner">' + this.getCellContent(inRowIndex) + '</td></tr></table>';
		},
		getCellContent: function(inRowIndex){
			return '&nbsp;';
		},
		findTarget: function(){
			var t = dojox.grid._ContentBuilder.prototype.findTarget.apply(this, arguments);
			return t;
		},
		domouseover: function(e){
			this.view.grid.onMouseOverRow(e);
		},
		domouseout: function(e){
			if(!this.isIntraRowEvent(e)){
				this.view.grid.onMouseOutRow(e);
			}
		},
		doclick: function(e){
			var idx = e.rowIndex;
			var selected = this.view.grid.selection.isSelected(idx);
			var mode = this.view.grid.selection.mode;

			if(!selected){
				if(mode == 'single'){
					this.view.grid.selection.select(idx);
				}else if(mode != 'none'){
					this.view.grid.selection.addToSelection(idx);
				}
			}else{
				this.view.grid.selection.deselect(idx);
			}

			return true;
		}
	});

	dojox.grid._InputSelectorContentBuilder = dojo.extend(function(view){
		dojox.grid._SelectorContentBuilder.call(this, view);
	},dojox.grid._SelectorContentBuilder.prototype,{
		getCellContent: function(rowIndex){
			var v = this.view;
			var type = v.inputType == "checkbox" ? "CheckBox" : "Radio";
			var checked = !!v.grid.selection.isSelected(rowIndex) ? ' dijit' + type + 'Checked dijitChecked' : '';
			return '<div class="dojoxGridCheckSelector dijitReset dijitInline dijit' + type + checked + '"></div>';
		}
	});

	dojo.declare("dojox.grid._Selector", dojox.grid._View, {
		inputType: '',
		selectionMode: '',

		// summary:
		//	Custom grid view. If used in a grid structure, provides a small selectable region for grid rows.
		defaultWidth: "2em",
		noscroll: true,
		padBorderWidth: 2,

		_contentBuilderClass: dojox.grid._SelectorContentBuilder,

		postCreate: function(){
			this.inherited(arguments);

			if(this.selectionMode){
				this.grid.selection.mode = this.selectionMode;
			}
			this.connect(this.grid.selection, 'onSelected', 'onSelected');
			this.connect(this.grid.selection, 'onDeselected', 'onDeselected');
		},
		buildRendering: function(){
			this.inherited(arguments);
			this.scrollboxNode.style.overflow = "hidden";
		},
		getWidth: function(){
			return this.viewWidth || this.defaultWidth;
		},
		resize: function(){
			this.adaptHeight();
		},
		setStructure: function(s){
			this.inherited(arguments);
			if(s.defaultWidth){
				this.defaultWidth = s.defaultWidth;
			}
		},
		adaptWidth: function(){
			// Only calculate this here - rather than every call to buildRowContent
			if(!("contentWidth" in this) && this.contentNode){
				this.contentWidth = this.contentNode.offsetWidth - this.padBorderWidth;
			}
		},
		// styling
		doStyleRowNode: function(inRowIndex, inRowNode){
			var n = [ "dojoxGridRowbar dojoxGridNonNormalizedCell" ];
			if(this.grid.rows.isOver(inRowIndex)){
				n.push("dojoxGridRowbarOver");
			}
			if(this.grid.selection.isSelected(inRowIndex)){
				n.push("dojoxGridRowbarSelected");
			}
			inRowNode.className = n.join(" ");
		},
		// event handlers
		onSelected: function(inIndex){
			this.grid.updateRow(inIndex);
		},
		onDeselected: function(inIndex){
			this.grid.updateRow(inIndex);
		}
	});
	if(!dojox.grid._View.prototype._headerBuilderClass &&
		!dojox.grid._View.prototype._contentBuilderClass){
		dojox.grid._Selector.prototype.postCreate = function(){
			this.connect(this.scrollboxNode,"onscroll","doscroll");
			dojox.grid.util.funnelEvents(this.contentNode, this, "doContentEvent", [ 'mouseover', 'mouseout', 'click', 'dblclick', 'contextmenu', 'mousedown' ]);
			dojox.grid.util.funnelEvents(this.headerNode, this, "doHeaderEvent", [ 'dblclick', 'mouseover', 'mouseout', 'mousemove', 'mousedown', 'click', 'contextmenu' ]);
			if(this._contentBuilderClass){
				this.content = new this._contentBuilderClass(this);
			}else{
				this.content = new dojox.grid._ContentBuilder(this);
			}
			if(this._headerBuilderClass){
				this.header = new this._headerBuilderClass(this);
			}else{
				this.header = new dojox.grid._HeaderBuilder(this);
			}
			//BiDi: in RTL case, style width='9000em' causes scrolling problem in head node
			if(!dojo._isBodyLtr()){
				this.headerNodeContainer.style.width = "";
			}
			this.connect(this.grid.selection, 'onSelected', 'onSelected');
			this.connect(this.grid.selection, 'onDeselected', 'onDeselected');
		};
	}

	dojo.declare("dojox.grid._RadioSelector", dojox.grid._Selector, {
		inputType: 'radio',
		selectionMode: 'single',

		_contentBuilderClass: dojox.grid._InputSelectorContentBuilder,

		buildRendering: function(){
			this.inherited(arguments);
			this.headerNode.style.visibility = "hidden";
		},
		
		renderHeader: function(){}
	});

	dojo.declare("dojox.grid._CheckBoxSelector", dojox.grid._Selector, {
		inputType: 'checkbox',
		_headerBuilderClass: dojox.grid._InputSelectorHeaderBuilder,
		_contentBuilderClass: dojox.grid._InputSelectorContentBuilder,
		postCreate: function(){
			this.inherited(arguments);
			this.connect(this.grid, 'onSelectionChanged', 'onSelectionChanged');
			this.connect(this.grid, 'updateRowCount', '_updateVisibility');
		},
		renderHeader: function(){
			this.inherited(arguments);
			this._updateVisibility(this.grid.rowCount);
		},
		_updateVisibility: function(rowCount){
			this.headerNode.style.visibility = rowCount ? "" : "hidden";
		},
		onSelectionChanged: function(){
			if(this._selectionChanging){ return; }
			var inputDiv = dojo.query('.dojoxGridCheckSelector', this.headerNode)[0];
			var g = this.grid;
			var s = (g.rowCount && g.rowCount == g.selection.getSelectedCount());
			g.allItemsSelected = s||false;
			dojo.toggleClass(inputDiv, "dijitChecked", g.allItemsSelected);
			dojo.toggleClass(inputDiv, "dijitCheckBoxChecked", g.allItemsSelected);
		}
	});
})();
