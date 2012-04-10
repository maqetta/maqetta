define([
	"dojo/_base/declare",
	"dojo/_base/array",
	"dojo/dom-geometry",
	"dojo/dom-class",
	"dojo/_base/query",
	"./_Base",
	"../../core/_Module"
], function(declare, array, domGeometry, domClass, query, _Base, _Module){

	return _Module.register(
	declare(/*===== "gridx.modules.dnd.Column", =====*/_Base, {
		name: 'dndColumn',
		
		required: ['_dnd', 'selectColumn', 'moveColumn'],

		getAPIPath: function(){
			return {
				dnd: {
					column: this
				}
			};
		},

		preload: function(){
			this.inherited(arguments);
			this._selector = this.grid.select.column;
		},
	
		//Public---------------------------------------------------------------------------------------
		//For now can not drag in any columns
		accept: [],

		provide: ['grid/columns'],

		//Package--------------------------------------------------------------------------------------
		_checkDndReady: function(evt){
			var t = this;
            if(t._selector.isSelected(evt.columnId)){
				t._selectedColIds = t._selector.getSelected();
				t.grid.dnd._dnd.profile = t;
				return true;
			}
			return false;
		},

		onDraggedOut: function(/*source*/){
			//TODO: Support drag columns out (remove columns).
		},

		//Private--------------------------------------------------------------------------------------
		_cssName: "Column",

		_onBeginDnd: function(source){
			source.delay = this.arg('delay');
		},

		_getDndCount: function(){
			return this._selectedColIds.length;
		},

		_onEndDnd: function(){},

		_buildDndNodes: function(){
			var gid = this.grid.id;
			return array.map(this._selectedColIds, function(colId){
				return ["<div id='", gid, "_dndcolumn_", colId, "' gridid='", gid, "' columnid='", colId, "'></div>"].join('');
			}).join('');
		},
	
		_onBeginAutoScroll: function(){
			var autoScroll = this.grid.autoScroll;
			this._autoScrollV = autoScroll.vertical;
			autoScroll.vertical = false;
		},

		_onEndAutoScroll: function(){
			this.grid.autoScroll.vertical = this._autoScrollV;
		},

		_getItemData: function(id){
			return id.substring((this.grid.id + '_dndcolumn_').length);
		},
		
		//---------------------------------------------------------------------------------------------
		_calcTargetAnchorPos: function(evt, containerPos){
			var node = evt.target,
				t = this,
				g = t.grid,
				ltr = g.isLeftToRight(),
				columns = g._columns,
				ret = {
					height: containerPos.h + "px",
					width: '',
					top: ''
				},
				func = function(n){
					var id = n.getAttribute('colid'),
						index = g._columnsById[id].index,
						first = n,
						last = n,
						firstIdx = index,
						lastIdx = index;
					if(t._selector.isSelected(id)){
						firstIdx = index;
						while(firstIdx > 0 && t._selector.isSelected(columns[firstIdx - 1].id)){
							--firstIdx;
						}
						first = query(".gridxHeaderRow [colid='" + columns[firstIdx].id + "']", g.headerNode)[0];
						lastIdx = index;
						while(lastIdx < columns.length - 1 && t._selector.isSelected(columns[lastIdx + 1].id)){
							++lastIdx;
						}
						last = query(".gridxHeaderRow [colid='" + columns[lastIdx].id + "']", g.headerNode)[0];
					}
					if(first && last){
						var firstPos = domGeometry.position(first),
							lastPos = domGeometry.position(last),
							middle = (firstPos.x + lastPos.x + lastPos.w) / 2,
							pre = evt.clientX < middle;
						if(pre){
							ret.left = (firstPos.x - containerPos.x - 1) + "px";
						}else{
							ret.left = (lastPos.x + lastPos.w - containerPos.x - 1) + "px";
						}
						t._target = pre ^ ltr ? lastIdx + 1 : firstIdx;
					}else{
						delete t._target;
					}
					return ret;
				};
			while(node){
				if(domClass.contains(node, 'gridxCell')){
					return func(node);
				}
				node = node.parentNode;
			}
			//For FF, when dragging from another grid, the evt.target is always grid.bodyNode!
			// so have to get the cell node by position, which is relatively slow.
			var rowNode = query(".gridxRow", g.bodyNode)[0],
				rowPos = domGeometry.position(rowNode.firstChild);
			if(rowPos.x + rowPos.w <= evt.clientX){
				ret.left = (rowPos.x + rowPos.w - containerPos.x - 1) + 'px';
				t._target = columns.length;
			}else if(rowPos.x >= evt.clientX){
				ret.left = (rowPos.x - containerPos.x - 1) + 'px';
				t._target = 0;
			}else if(query(".gridxCell", rowNode).some(function(cellNode){
				var cellPos = domGeometry.position(cellNode);
				if(cellPos.x <= evt.clientX && cellPos.x + cellPos.w >= evt.clientX){
					node = cellNode;
					return true;
				}
			})){
				return func(node);
			}
			return ret;
		},
		
		_onDropInternal: function(nodes, copy){
			var t = this;
			if(t._target >= 0){
				var indexes = array.map(t._selectedColIds, function(colId){
					return t.grid._columnsById[colId].index;
				});
				t.grid.move.column.move(indexes, t._target);
			}
		},
		
		_onDropExternal: function(/*source, nodes, copy*/){
			//TODO: Support drag in columns from another grid or non-grid source
		}
	}));
});
