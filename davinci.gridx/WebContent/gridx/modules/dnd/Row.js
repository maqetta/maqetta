define([
	"dojo/_base/declare",
	"dojo/_base/array",
	"dojo/_base/Deferred",
	"dojo/_base/lang",
	"dojo/dom-class",
	"dojo/dom-geometry",
	"dojo/_base/sniff",
	"./_Base",
	"../../core/_Module"
], function(declare, array, Deferred, lang, domClass, domGeometry, sniff, _Base, _Module){

	var hitch = lang.hitch,
		forEach = array.forEach;

	function getSourceData(source, nodes){
		if(source.grid){
			var d = new Deferred(),
				success = hitch(d, d.callback),
				fail = hitch(d, d.errback),
				dataArr = [],
				sg = source.grid,
				rowIds = sg.dnd.row._selectedRowIds;
			sg.model.when({id: rowIds}, function(){
				forEach(rowIds, function(id){
					var idx = sg.model.idToIndex(id),
						row = sg.model.byId(id);
					if(row){
						dataArr.push(lang.clone(row.rawData));
					}
				});
			}).then(function(){
				success(dataArr);
			}, fail);
			return d;
		}else{
			return source.getGridDndRowData && source.getGridDndRowData(nodes) || [];
		}
	}

	return _Module.register(
	declare(/*===== "gridx.modules.dnd.Row", =====*/_Base, {
		name: 'dndRow',
		
		required: ['_dnd', 'moveRow'],

		getAPIPath: function(){
			return {
				dnd: {
					row: this
				}
			};
		},

		//Public---------------------------------------------------------------------------
		//Can drag in what kind of stuff
		accept: ['grid/rows'],

		//Can drag out what kind of stuff
		provide: ['grid/rows'],

		onDraggedOut: function(targetSource){
			var t = this,
				targetAccept = [];
			if(targetSource.grid){
				targetAccept = targetSource.grid.dnd._dnd.profile.arg('accept');
			}else{
				for(var n in targetSource.accept){
					targetAccept.push(n);
				}
			}
			if(!t.checkArg('copyWhenDragOut', targetAccept)){
				var g = t.grid,
					m = g.model,
					s = g.store,
					rowIds = t._selectedRowIds;
				if(s.fetch){
					var items = [];
					g.model.when({id: rowIds}, function(){
						forEach(rowIds, function(id){
							var row = m.byId(id);
							if(row){
								items.push(row.item);
							}
						});
					}).then(function(){
						forEach(items, s.deleteItem, s);
						s.save();
					});
				}else{
					forEach(rowIds, s.remove, s);
				}
			}
		},
	
		//Package-----------------------------------------------------------------------------------
        _checkDndReady: function(evt){
			var t = this, m = t.model;
            if(!m.isMarked || m.isMarked(evt.rowId)){
				t.grid.dnd._dnd.profile = t;
				t._selectedRowIds = m.getMarkedIds ? m.getMarkedIds() : [evt.rowId];
				return true;
			}
			return false;
        },

		//Private-----------------------------------------------------------------------------
		_cssName: 'Row',

		_onBeginDnd: function(source){
			source.delay = this.arg('delay');
		},

		_getDndCount: function(){
			return this._selectedRowIds.length;
		},

		_onEndDnd: function(){},

		_buildDndNodes: function(){
			var gid = this.grid.id;
			return array.map(this._selectedRowIds, function(rowId){
				return ["<div id='", gid, '_dndrow_', rowId, "' gridid='", gid, "' rowid='", rowId, "'></div>"].join('');
			}).join('');
		},

		_onBeginAutoScroll: function(){
			var autoScroll = this.grid.autoScroll;
			this._autoScrollH = autoScroll.horizontal;
			autoScroll.horizontal = false;
		},

		_onEndAutoScroll: function(){
			this.grid.autoScroll.horizontal = this._autoScrollH;
		},

		_getItemData: function(id){
			return id.substring((this.grid.id + '_dndrow_').length);
		},
		
		//----------------------------------------------------------------------------
		_calcTargetAnchorPos: function(evt, containerPos){
			var t = this,
				node = evt.target,
				body = t.grid.body,
				ret = {
					width: containerPos.w + "px",
					height: '',
					left: ''
				},
				isSelected = function(n){
					return t.model.isMarked && t.model.isMarked(n.getAttribute('rowid'));
				},
				getVIdx = function(n){
					return parseInt(n.getAttribute('visualindex'), 10);
				},
				calcPos = function(node){
					var n = node, first = n, last = n;
					if(isSelected(n)){
						var prenode = n.previousSibling;
						while(prenode && isSelected(prenode)){
							n = prenode;
							prenode = prenode.previousSibling;
						}
						first = n;
						n = node;
						var nextnode = n.nextSibling;
						while(nextnode && isSelected(nextnode)){
							n = nextnode;
							nextnode = nextnode.nextSibling;
						}
						last = n;
					}
					if(first && last){
						var firstPos = domGeometry.position(first),
							lastPos = domGeometry.position(last),
							middle = (firstPos.y + lastPos.y + lastPos.h) / 2;
						if(evt.clientY < middle){
							t._target = getVIdx(first);
							ret.top = (firstPos.y - containerPos.y) + "px";
						}else{
							t._target = getVIdx(last) + 1;
							ret.top = (lastPos.y + lastPos.h - containerPos.y) + "px";
						}
					}else{
						delete t._target;
					}
					return ret;
				};
			if(!sniff('ff')){
				//In FF, this conflicts with the overflow:hidden css rule for grid row DIV, which is required by ColumnLock.
				while(node){
					if(domClass.contains(node, 'gridxRow')){
						return calcPos(node);
					}
					node = node.parentNode;
				}
			}
			var bn = body.domNode,
				nodes = bn.childNodes;
			if(!nodes.length){
				ret.top = '0px';
				t._target = 0;
			}else{
				node = bn.firstChild;
				var idx = getVIdx(node),
					pos = domGeometry.position(node);
				if(idx === 0 && evt.clientY <= pos.y + pos.h){
					ret.top = (pos.y - containerPos.y) + 'px';
					t._target = 0;
				}else{
					node = bn.lastChild;
					idx = getVIdx(node);
					pos = domGeometry.position(node);
					if(idx === body.visualCount - 1 && evt.clientY > pos.y + pos.h){
						ret.top = (pos.y + pos.h - containerPos.y) + 'px';
						t._target = body.visualCount;
					}else{
						var rowFound = array.some(nodes, function(rowNode){
							pos = domGeometry.position(rowNode);
							if(pos.y <= evt.clientY && pos.y + pos.h >= evt.clientY){
								node = rowNode;
								return true;
							}
						});
						return rowFound ? calcPos(node) : null;
					}
				}
			}
			return ret;
		},

		_onDropInternal: function(nodes, copy){
			var t = this, g = t.grid;
			if(t._target >= 0){
				t.model.when({id: t._selectedRowIds}, function(){
					var indexes = array.map(t._selectedRowIds, function(rowId){
						return t.model.idToIndex(rowId);
					});
					g.move.row.move(indexes, g.body.getRowInfo({
						visualIndex: t._target
					}).rowIndex);
				});
			}
		},

		_onDropExternal: function(source, nodes, copy){
			var d = new Deferred(),
				success = hitch(d, d.callback),
				fail = hitch(d, d.errback),
				g = this.grid,
				target = this._target,
				targetRow, preRow,
				sourceData = getSourceData(source, nodes);
			g.model.when([target - 1, target], function(){
				targetRow = g.model.byIndex(target);
				preRow = g.model.byIndex(target - 1);
			}).then(function(){
				//Inserting and deleting (and other operations that changes store) are better to happen outside 
				//"model.when", because during "when", it is not allowed to clear cache.
				Deferred.when(sourceData, function(dataArr){
					if(dataArr && dataArr.length){
						var inserted = g.model.insert(dataArr, preRow && preRow.item, targetRow && targetRow.item);
						Deferred.when(inserted, success, fail);
					}
				}, fail);
			}, fail);
			return d;
		}
	}));
});
