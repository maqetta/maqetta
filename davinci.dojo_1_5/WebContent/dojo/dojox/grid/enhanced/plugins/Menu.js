dojo.provide("dojox.grid.enhanced.plugins.Menu");

dojo.declare("dojox.grid.enhanced.plugins.Menu", null, {
	//	summary:
	//		 Provides context menu support, including header menu, row menu, cell menu and selected region menu
	// example:
	// 		 <div dojoType="dojox.grid.EnhancedGrid" 
	//			  plugins="{menus:{headerMenu:"headerMenuId", rowMenu:"rowMenuId", cellMenu:"cellMenuId", 
	//							   selectedRegionMenu:"selectedRegionMenuId"}}" ...>
	//		</div>

	constructor: function(inGrid){
		inGrid.mixin(inGrid, this);
	},
	
	_initMenus: function(){
		//summary:
		//		Initilize all the required menus
		var wrapper = this.menuContainer;
		!this.headerMenu && (this.headerMenu = this._getMenuWidget(this.menus['headerMenu']));		
		!this.rowMenu && (this.rowMenu = this._getMenuWidget(this.menus['rowMenu']));
		!this.cellMenu && (this.cellMenu = this._getMenuWidget(this.menus['cellMenu']));
		!this.selectedRegionMenu && (this.selectedRegionMenu = this._getMenuWidget(this.menus['selectedRegionMenu']));
		this.headerMenu && this.set('headerMenu', this.headerMenu) && this.setupHeaderMenu();
		this.rowMenu && this.set('rowMenu', this.rowMenu);
		this.cellMenu && this.set('cellMenu', this.cellMenu);
		this.isDndSelectEnable && this.selectedRegionMenu && dojo.connect(this.select, 'setDrugCoverDivs', dojo.hitch(this, this._bindDnDSelectEvent));
	},
	
	_getMenuWidget: function(menuId){
		//summary:
		//		Fetch the required menu widget(should already been created)
		//menuId: String
		//		Id of the target menu widget
		//return: Widget
		//		Target menu widget
		if(!menuId){
			return;
		}
		var menu = dijit.byId(menuId);
		if(!menu){
			throw new Error("Menu '" + menuId +"' not existed");	
		}
		return menu;
	},

	_bindDnDSelectEvent: function(){
		//summary:
		//		Hook callback to DnD, so othat appropriate menu will be shown on selected regions	
		dojo.forEach(this.select.coverDIVs, dojo.hitch(this, function(cover){
			//this.selectedRegionMenu.unBindDomNode(this.domNode);
			this.selectedRegionMenu.bindDomNode(cover);
			dojo.connect(cover, "contextmenu", dojo.hitch(this, function(e){
				dojo.mixin(e, this.select.getSelectedRegionInfo());
				this.onSelectedRegionContextMenu(e);
			}));
		}));
	},
	
	_setRowMenuAttr: function(menu){
		//summary:
		//		Set row menu widget
		//menu: Widget - dijit.Menu
		//		Row menu widget
		this._setRowCellMenuAttr(menu, 'rowMenu');
	},
	
	_setCellMenuAttr: function(menu){
		//summary:
		//		Set cell menu widget
		//menu: Widget - dijit.Menu
		//		Cell menu widget		
		this._setRowCellMenuAttr(menu, 'cellMenu');
	},
	
	_setRowCellMenuAttr: function(menu, menuType){
		//summary:
		//		Bind menus to Grid
		//menu: Widget - dijit.Menu
		//		Menu widget	
		//menuType: String
		//		Menu type
		if(!menu){ return; }
		if(this[menuType]){
			this[menuType].unBindDomNode(this.domNode);
		}
		this[menuType] = menu;
		this[menuType].bindDomNode(this.domNode);
	},

	// TODO: this code is not accessible.  Shift-F10 won't open a menu.  (I think
	// this function never even gets called.)
	showRowCellMenu: function(e){
		//summary:
		//		Show row or cell menus
		//e: Event
		//		Fired from dojox.grid.enhanced._Events.onRowContextMenu
		var inRowSelectorView = e.sourceView.declaredClass == 'dojox.grid._RowSelector';
		// !e.cell means the cell is in the rowbar.
		// this.selection.isSelected(e.rowIndex) should remove?
		//if(this.rowMenu && (!e.cell || this.selection.isSelected(e.rowIndex)) && (!this.focus.cell || this.focus.cell != e.cell)){
		if(this.rowMenu && (!e.cell || this.selection.isSelected(e.rowIndex))){
			this.rowMenu._openMyself({
				target: e.target,
				coords: "pageX" in e ? {
					x: e.pageX,
					y: e.pageY
				} : null
			});
			dojo.stopEvent(e);
			return;
		}
		if(inRowSelectorView || e.cell && e.cell.isRowSelector){
			dojo.stopEvent(e);
			return;	
		}
		if(this.isDndSelectEnable) {
			this.select.cellClick(e.cellIndex, e.rowIndex);
			this.focus.setFocusCell(e.cell, e.rowIndex);
		}
		if(this.cellMenu){
			this.cellMenu._openMyself({
				target: e.target,
				coords: "pageX" in e ? {
					x: e.pageX,
					y: e.pageY
				} : null
			});
		}
	}
});
