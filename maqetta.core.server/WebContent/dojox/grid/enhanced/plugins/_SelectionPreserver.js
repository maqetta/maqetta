dojo.provide("dojox.grid.enhanced.plugins._SelectionPreserver");

dojo.declare("dojox.grid.enhanced.plugins._SelectionPreserver", null, {
	// summary:
	//		Preserve selections across various user actions.
	//
	// description:
	//		When this feature turned on, Grid will try to preserve selections across various user actions, e.g. sorting, filtering etc.
	//		Precondition - Identifier(id) is required for store, as id is used for differentiating row items.
	//		Known issue - The preserved selections might be inaccurate if some unloaded rows are selected by range previously(e.g.SHIFT + click)
	//
	// example:
	// |	//To turn on this - set 'keepSelection' attribute to true
	// |	<div dojoType="dojox.grid.EnhancedGrid" keepSelection = true .../>
	
	//_connects: Array
	//		List of all connections.
	_connects: [],
	
	constructor: function(selection){
		this.selection = selection;
		var grid = this.grid = selection.grid;
		grid.onSelectedById = this.onSelectedById;
		this.reset();

		var oldClearData = grid._clearData;
		var _this = this;
		grid._clearData = function(){
			_this._updateMapping(!grid._noInternalMapping);
			_this._trustSelection = [];
			oldClearData.apply(grid, arguments);
		};
		this.connect(grid, '_setStore', 'reset');
		this.connect(grid, '_addItem', '_reSelectById');
		this.connect(selection, 'addToSelection', dojo.hitch(this, '_selectById', true));
		this.connect(selection, 'deselect', dojo.hitch(this, '_selectById', false));
		this.connect(selection, 'selectRange', dojo.hitch(this, '_updateMapping', true, true, false));
		this.connect(selection, 'deselectRange', dojo.hitch(this, '_updateMapping', true, false, false));
		this.connect(selection, 'deselectAll', dojo.hitch(this, '_updateMapping', true, false, true));
	},
	destroy: function(){
		this.reset();
		dojo.forEach(this._connects, dojo.disconnect);
		delete this._connects;
	},
	connect: function(obj, event, method){
		// summary:
		//		Connects specified obj/event to specified method of this object.
		var conn = dojo.connect(obj, event, this, method);
		this._connects.push(conn);
		return conn;
	},
	reset: function(){
		this._idMap = [];
		this._selectedById = {};
		this._trustSelection = [];
		this._defaultSelected = false;
	},
	_reSelectById: function(item, index){
		// summary:
		//		When some rows is fetched, determine whether it should be selected.
		//		When this function is called, grid.selection.selected[] is not trustable.
		var s = this.selection, g = this.grid;
		if(item && g._hasIdentity){
			var id = g.store.getIdentity(item);
			if(this._selectedById[id] === undefined){
				if(!this._trustSelection[index]){
					s.selected[index] = this._defaultSelected;
				}
			}else{
				s.selected[index] = this._selectedById[id];
			}
			this._idMap.push(id);
			g.onSelectedById(id, index, s.selected[index]);
		}
	},
	_selectById: function(toSelect, inItemOrIndex){
		// summary:
		//		Record selected rows by ID.
		if(this.selection.mode == 'none' || !this.grid._hasIdentity){ return; }
		var item = inItemOrIndex;
		if(typeof inItemOrIndex == "number" || typeof inItemOrIndex == "string"){
			var entry = this.grid._by_idx[inItemOrIndex];
			item = entry && entry.item;
		}
		if(item){
			var id = this.grid.store.getIdentity(item);
			this._selectedById[id] = !!toSelect;
		}else{
			this._trustSelection[inItemOrIndex] = true;
		}
	},
	onSelectedById: function(id, rowIndex, value){},
	
	_updateMapping: function(trustSelection, isSelect, isForAll, from, to){
		// summary:
		//		This function trys to keep the selection info updated when range selection is performed.
		//		1. Calculate how many unloaded rows are there;
		//		2. update _selectedById data if grid.selection._selected can be trusted, so loaded but unselected rows can
		//			be properly recorded.
		var s = this.selection, g = this.grid, flag = 0, unloaded = 0, i, id;
		for(i = g.rowCount - 1; i >= 0; --i){
			if(!g._by_idx[i]){
				++unloaded;
				flag += s.selected[i] ? 1 : -1;
			}else{
				id = g._by_idx[i].idty;
				if(id && (trustSelection || this._selectedById[id] === undefined)){
					this._selectedById[id] = !!s.selected[i];
				}
			}
		}
		if(unloaded){
			this._defaultSelected = flag > 0;
		}
		if(!isForAll && from !== undefined && to !== undefined){
			isForAll = !g.usingPagination && Math.abs(to - from + 1) === g.rowCount;
		}
		// When deselectAll, make sure every thing is deselected, even if it was selected but not loaded now.
		// This occurs only when pagination's "All" is used.
		if(isForAll && !g.usingPagination){
			for(i = this._idMap.length; i >= 0; --i){
				this._selectedById[this._idMap[i]] = isSelect;
			}
		}
	}
});
