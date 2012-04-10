define([
	"dojo/_base/kernel",
	"dojo/_base/declare",
	"dojo/dom-class",
	"dojo/dom-geometry",
	"dojo/_base/lang",
	"dojo/_base/Deferred",
	"dojo/DeferredList",
	"dojo/query",
	"dojo/keys",
	"../util",
	"../core/_Module"
], function(kernel, declare, domClass, domGeometry, lang, Deferred, DeferredList, query, keys, util, _Module){
	function isExpando(cellNode){
		var n = cellNode.firstChild;
		return n && n.className && domClass.contains(n, 'gridxTreeExpandoCell') &&
			!domClass.contains(n, 'gridxTreeExpandoLoading');
	}

	return _Module.register(
	declare(/*===== "gridx.modules.Tree", =====*/_Module, {
		// summary:
		//		Tree Grid module.
		// description:
		//		This module is used for creation, destruction and management of the Tree Grid.
		//		There are two kind of Tree Grid: columnar or nested, it will be indicated by
		//		the argument `type`, and the layout of the TreeGrid will be defined by extended
		//		`structure` argument.
		// example:
		//		For the columnar Tree Grid, the column which is expandable is indicated by the 
		//		new added attribute `expandField`, and the value of the `expandField` is one 
		//		or more attribute names (attributes in the meta data) that specify that item's 
		//		children.
		//		See the quick sample below:
		//
		//		sample of data source
		//	|	{ identifier: 'name',
		//	|	  label: 'name',
		//	|	  items: [
		//	|	 	{ name:'Africa', type:'continent', children: [
		//	|	 		{ name:'Egypt', type:'country' }, 
		//	|	 		{ name:'Kenya', type:'country', children:[
		//	|	 			{ name:'Nairobi', type:'city', adults: 70400, popnum: 2940911 },
		//	|	 			{ name:'Mombasa', type:'city', adults: 294091, popnum: 707400 } ]
		//	|	 		},
		//	|	 		{ name:'Sudan', type:'country', children:
		//	|	 			{ name:'Khartoum', type:'city', adults: 480293, popnum: 1200394 } 
		//	|	 		} ]
		//	|	 	},
		//	|	  	{ name:'Asia', type:'continent', children:[
		//	|	  		{ name:'China', type:'country' },
		//	|	  		{ name:'India', type:'country' },
		//	|	  		{ name:'Russia', type:'country' },
		//	|	  		{ name:'Mongolia', type:'country' } ]
		//	|	  	},
		//	|		{ name:'Australia', type:'continent', population:'21 million', children:
		//	|			{ name:'Commonwealth of Australia', type:'country', population:'21 million'}
		//	|		} ]
		//	|	}
		//
		//		define the tree grid type
		//	|	var type = "columnar";
		//
		//		define the grid structure
		//	|	var structure = [
		//	|		{name: "Name", field: "name", expandLevel: 'all'},
		//	|		{name: "Type", field: "type"},
		//	|		{name: "Population", field: "population"}
		//	|	];
		//		
		//		For the nested TreeGrid, there could be more than one column can be expanded, 
		//		so the structure might be a little more complicated. There is ONLY one attribute
		//		name can be assigned to the `expandField` as children, and there would be a 
		//		attribute called `nestedLevel` to specify the hierarchy of the column.
		//		A quick sample:
		//
		//		sample of data source
		//		
		//	|	{ identifier: 'id',
		//	|	  items: [
		//	|		{ id: "1", playername: "Player 1", seasons: [
		//	|		 	{ id: "2", seasonindex: "Season 1", games: [
		//	|				{ id: "3", gameindex: "Game 1", quarters: [
		//	|					{id: "4", point: "3", rebound: "3", assistant: "1"},
		//	|					{id: "5", point: "5", rebound: "0", assistant: "0"},
		//	|					{id: "6", point: "0", rebound: "1", assistant: "3"},
		//	|					{id: "7", point: "2", rebound: "2", assistant: "0"} ]
		//	|				},
		//	|				{ id: "8", gameindex: "Game 2", quarters: [
		//	|					{id: "9", point: "3", rebound: "0", assistant: "2"},
		//	|					{id: "10", point: "0", rebound: "4", assistant: "1"},
		//	|					{id: "11", point: "5", rebound: "0", assistant: "1"},
		//	|					{id: "12", point: "10", rebound: "2", assistant: "0"} ]
		//	|				} ]
		//	|			},
		//	|			{ id: "13", seasonindex: "Season 2" } ]
		//	|		} ]
		//	|	}
		//
		//		define the tree grid type
		//	|	var type = "nested";
		//
		//		define the grid structure
		//	|	var structure = [
		//	|		{name: "Player", field: "playername", expandLevel: 1},
		//	|		{name: "Season", field: "seasonindex", expandLevel: 2},
		//	|		{name: "Game", field: "gameindex", expandLevel: 3},
		//	|		{name: "Point", field: "point"},
		//	|		{name: "Rebound", field: "rebound"},
		//	|		{name: "Assistant", field: "assistant"}
		//	|	];
		
		name: "tree",

		constructor: function(){
			var openned = [];
			this._openInfo = {
				'': {
					id: '',
					parentId: null,
					index: -1,
					count: 0,
					openned: openned
				}
			};
			this._parentOpenInfo = {
				'': openned
			};
		},
	
		getAPIPath: function(){
			// tags:
			//		protected extension
			return {
				tree: this
			};
		},
	
		preload: function(){
			// tags:
			//		protected extension
			var t = this,
				g = t.grid;
			g.domNode.setAttribute('role', 'treegrid');
			t.batchConnect(
				[g.body, 'collectCellWrapper', '_createCellWrapper'],
				[g, 'onCellClick', '_onCellClick']
			);
			t._initFocus();
			if(g.persist){
				var id, data = g.persist.registerAndLoad('tree', lang.hitch(t, t._persist));
				if(data){
					var openInfo = t._openInfo = data.openInfo
						parentOpenInfo = t._parentOpenInfo = data.parentOpenInfo;
					for(id in openInfo){
						 openInfo[id].openned = parentOpenInfo[id];
					}
					t._persisted = 1;
				}
			}
		},

		load: function(args){
			// tags:
			//		protected extension
			kernel.experimental('gridx/modules/Tree');
			var t = this;
			if(t._persisted){
				t.loaded.callback();
			}else{
				t.model.when({}, function(){
					t._openInfo[''].count = t.model.size();
				}).then(function(){
					t.loaded.callback();
				});
			}
		},
	
		//Public--------------------------------------------------------------------------------

		// nested: Boolean
		//		If set to true, the tree nodes can be shown in nested mode.
		nested: false,

		onExpand: function(id){
			// summary:
			//		Fired when a row is expanded.
			// tags:
			//		callback
			// id: String
			//		The ID of the expanded row
		},
		onCollapse: function(id){
			// summary:
			//		Fired when a row is collapsed.
			// tags:
			//		callback
			// id: String
			//		The ID of the collapsed row.
		},
	
		isExpanded: function(id){
			// summary:
			//		Check wheter a row is already expanded.
			// id: String
			//		The row ID
			// returns:
			//		Whether the row is expanded.
			return !!this._openInfo[id];	//Boolean
		},

		expand: function(id, skipUpdateBody){
			// summary:
			//		Expand the row.
			// id: String
			//		The row ID
			// skipUpdateBody: Boolean
			//		If set to true the grid will not automatically refresh itself after this method,
			//		so that several grid operations can be executed altogether.
			// returns:
			//		A deferred object indicating whether this expanding process has completed.
			var d = new Deferred(),
				t = this;
			if(id && !t.isExpanded(id)){
				t.model.when({
					parentId: id, 
					start: 0
				}, function(){
					t._logicExpand(id);
				}).then(function(){
					Deferred.when(skipUpdateBody || t._updateBody(id), function(){
						d.callback();
						t.onExpand(id);
					});
				});
			}else{
				d.callback();
			}
			return d;	//dojo.Deferred
		},
	
		collapse: function(id, skipUpdateBody){
			// summary:
			//		Collapse a row.
			// id: String
			//		The row ID
			// skipUpdateBody: Boolean
			//		If set to true the grid will not automatically refresh itself after this method,
			//		so that several grid operations can be executed altogether.
			// returns:
			//		A deferred object indicating whether this collapsing process has completed.
			var d = new Deferred(),
				t = this;
			if(id && t.isExpanded(id)){
				t._logicCollapse(id);
				Deferred.when(skipUpdateBody || t._updateBody(id), function(){
					d.callback();
					t.onCollapse(id);
				});
			}else{
				d.callback();
			}
			return d;	//dojo.Deferred
		},
	
		expandRecursive: function(id, skipUpdateBody){
			// summary:
			//		Recursively expand a row and all its descendants.
			// id: String
			//		The row ID
			// skipUpdateBody: Boolean
			//		If set to true the grid will not automatically refresh itself after this method,
			//		so that several grid operations can be executed altogether.
			// returns:
			//		A deferred object indicating whether this expanding process has completed.
			var t = this,
				m = t.model,
				d = new Deferred();
			t.expand(id, 1).then(function(){
				var i, dl = [], size = m.size(id);
				m.when({start: 0, parentId: id}, function(){
					for(i = 0; i < size; ++i){
						var childId = m.indexToId(i, id);
						dl.push(t.expandRecursive(childId, 1));
					}
				}).then(function(){
					new DeferredList(dl).then(function(){
						Deferred.when(skipUpdateBody || t._updateBody(id), function(){
							d.callback();
						});
					});
				});
			});
			return d;
		},
	
		collapseRecursive: function(id, skipUpdateBody){
			// summary:
			//		Recursively collapse a row recursively and all its descendants.
			// id: String
			//		The row ID
			// skipUpdateBody: Boolean
			//		If set to true the grid will not automatically refresh itself after this method,
			//		so that several grid operations can be executed altogether.
			// returns:
			//		A deferred object indicating whether this collapsing process has completed.
			var d = new Deferred(),
				success = lang.hitch(d, d.callback),
				fail = lang.hitch(d, d.errback),
				t = this,
				info = t._openInfo[id || ''],
				i, dl = [];
			if(info){
				for(i = info.openned.length - 1; i >= 0; --i){
					dl.push(t.collapseRecursive(info.openned[i], 1));
				}
				new DeferredList(dl).then(function(){
					if(id){
						t.collapse(id, skipUpdateBody).then(success, fail);
					}else if(!skipUpdateBody){
						t._updateBody().then(success, fail);
					}
				});
			}else{
				success();
			}
			return d;
		},
	
		//Package------------------------------------------------------------------------------
		getRowInfoByVisualIndex: function(visualIndex, rootStart){
			// summary:
			//		Get row info (including row index, row id, parent id, etc) by row visual index.
			// tags:
			//		package
			// visualIndex: Integer
			// rootStart: Integer
			// returns:
			//		A row info object
			var t = this,
				rootOpenned = t._openInfo[''].openned,
				root, i;
			for(i = 0; i < rootOpenned.length; ++i){
				root = t._openInfo[rootOpenned[i]];
				if(root.index < rootStart){
					visualIndex += root.count + 1;
				}else{
					break;
				}
			}
			var info = {
				parentId: '',
				preCount: 0
			};
			while(!info.found){
				info = t._getChild(visualIndex, info);
			}
			return info;	//Object
		},
	
		getVisualIndexByRowInfo: function(parentId, rowIndex, rootStart){
			// tags:
			//		package
			var index = this._getAbsoluteVisualIndex(parentId, rowIndex);
			return index >= 0 ? index - this._getAbsoluteVisualIndex('', rootStart) : null;
		},
	
		getVisualSize: function(start, count, parentId){
			// tags:
			//		package
			var info = this._openInfo[parentId || ''];
			if(info){
				var i, len = info.openned.length, child, size = count;
				for(i = 0; i < len; ++i){
					child = this._openInfo[info.openned[i]];
					if(child.index >= start && child.index < start + count){
						size += child.count;
					}
				}
				return size;
			}
			return 0;
		},
	
		//Private-------------------------------------------------------------------------------
		//_parentOpenInfo: null,
	
		//_openInfo: null,
	
		_createCellWrapper: function(wrappers, rowId, colId){
			var t = this,
				col = t.grid._columnsById[colId];
			if(col.expandLevel){
				var level = t.model.treePath(rowId).length;
				if(!t.arg('nested') || col.expandLevel == level){
					var hasChildren = t.model.hasChildren(rowId),
						isOpen = t.isExpanded(rowId),
						pad = 0, singlePad = 18,
						ltr = t.grid.isLeftToRight();
					if(!t.arg('nested')){
						pad = (level - 1) * singlePad;
					}
					wrappers.push({
						priority: 0,
						wrap: function(cellData){
							return ["<div class='gridxTreeExpandoCell ",
								isOpen ? "gridxTreeExpandoCellOpen" : "",
								"' style='padding-", ltr ? 'left' : 'right', ": ", pad + singlePad, "px;'>",
								"<span class='gridxTreeExpandoIcon ",
								hasChildren ? '' : 'gridxTreeExpandoIconNoChildren',
								"' ",
								"style='margin-", ltr ? 'left' : 'right', ": ", pad,"px;'>",
								"<span class='gridxTreeExpandoInner'>",
								isOpen ? "-" : "+",
								"</span></span><span class='gridxTreeExpandoContent'>",
								cellData,
								"</span></span>"
							].join('');
						}
					});
				}
			}
		},
	
		_onCellClick: function(e){
			if(isExpando(e.cellNode)){
				var t = this,
					pos = domGeometry.position(query('.gridxTreeExpandoIcon', e.cellNode)[0]);
				if(e.clientX >= pos.x && e.clientX <= pos.x + pos.w && e.clientY >= pos.y && e.clientY <= pos.y + pos.h){
					if(t.isExpanded(e.rowId)){
						t.collapse(e.rowId);
					}else{
						t.expand(e.rowId);
					}
				}
			}
		},
	
		_updateBody: function(id){
			var t = this,
				body = t.grid.body;
			if(body){
				body.updateRootRange(body.rootStart, body.rootCount);
				var rowNode = body.getRowNode({rowId: id}), n, expando,
					isOpen = t.isExpanded(id);
				if(rowNode){
					n = query('.gridxTreeExpandoCell', rowNode)[0];
					if(n){
						expando = query('.gridxTreeExpandoIcon', n)[0];
						expando.firstChild.innerHTML = 'o';
						domClass.add(n, 'gridxTreeExpandoLoading');
					}
				}
				var visualIndex = id ? t.getVisualIndexByRowInfo(t.model.treePath(id).pop(), t.model.idToIndex(id), body.rootStart) : -1;
				return body.refresh(visualIndex + 1).then(function(){
					if(n){
						expando.firstChild.innerHTML = isOpen ? '-' : '+';
						domClass.remove(n, 'gridxTreeExpandoLoading');
						domClass.toggle(n, 'gridxTreeExpandoCellOpen', isOpen);
					}
				});
			}
			return null;
		},

		_getAbsoluteVisualIndex: function(parentId, rowIndex){
			var info = this._openInfo[parentId || ''];
			if(info){
				var preCount = 0,
					openInfo = this._openInfo,
					func = function(info){
						preCount += rowIndex;
						var child, i;
						for(i = 0; i < info.openned.length; ++i){
							child = openInfo[info.openned[i]];
							if(child.index < rowIndex){
								preCount += child.count;
							}else{
								break;
							}
						}
						rowIndex = info.index;
						if(info.id){
							preCount++;
						}
						return openInfo[info.parentId];
					};
				while(info){
					info = func(info);
				}
				return preCount;
			}
			return -1;
		},
	
		_logicExpand: function(id){
			var t = this,
				m = t.model;
			if(m.hasChildren(id)){
				var parentId = m.treePath(id).pop(),
					openInfo = t._openInfo,
					poi = t._parentOpenInfo,
					parentOpenInfo = poi[parentId] = poi[parentId] || [];
				poi[id] = poi[id] || [];
				if(!openInfo[id]){
					var index = m.idToIndex(id),
						childCount = m.size(id),
						i = util.biSearch(parentOpenInfo, function(childId){
							return openInfo[childId].index - index;
						});
					if(parentOpenInfo[i] !== id){
						parentOpenInfo.splice(i, 0, id);
					}
					for(i = poi[id].length - 1; i >= 0; --i){
						childCount += openInfo[poi[id][i]].count;
					}
					openInfo[id] = {
						id: id,
						parentId: parentId,
						index: index,
						count: childCount,
						openned: poi[id]
					};
					var info = openInfo[parentId];
					while(info){
						info.count += childCount;
						info = openInfo[info.parentId];
					}
				}
			}
			//console.log('after expand:', id, dojo.clone(this._openInfo), dojo.clone(this._parentOpenInfo));
		},
	
		_logicCollapse: function(id){
			var t = this,
				info = t._openInfo[id];
			if(info){
				var openInfo = t._openInfo,
					parentId = t.model.treePath(id).pop(),
					parentOpenInfo = t._parentOpenInfo[parentId],
					i = util.biSearch(parentOpenInfo, function(childId){
						return openInfo[childId].index - info.index; 
					}),
					childCount = info.count;
				parentOpenInfo.splice(i, 1);
				info = openInfo[parentId];
				while(info){
					info.count -= childCount;
					info = openInfo[info.parentId];
				}
				delete openInfo[id];
			}
			//console.log('after collapse:', id,  dojo.clone(this._openInfo), dojo.clone(this._parentOpenInfo));
		},
	
		_getChild: function(visualIndex, info){
			var item = this._openInfo[info.parentId],
				i, len, preCount = info.preCount + item.index + 1,
				commonMixin = {
					found: true,
					visualIndex: visualIndex,
					count: 1
				};
	
			for(i = 0, len = item.openned.length; i < len; ++i){
				var childId = item.openned[i],
					child = this._openInfo[childId],
					vidx = child.index + preCount;
				if(vidx === visualIndex){
					return lang.mixin({
						parentId: item.id,
						start: child.index
					}, commonMixin);
				}else if(vidx > visualIndex){
					break;
				}else if(vidx + child.count >= visualIndex){
					return {
						parentId: childId, 
						preCount: preCount 
					};
				}
				preCount += child.count;
			}
			return lang.mixin({
				parentId: item.id,
				start: visualIndex - preCount
			}, commonMixin);
		},

		//Focus------------------------------------------------------------------
		_initFocus: function(){
			this.connect(this.grid, 'onCellKeyPress', '_onKey'); 
		},

		_onKey: function(e){
			if(e.keyCode == keys.ESCAPE){
				var t = this,
					m = t.model,
					treePath = m.treePath(e.rowId),
					parentId = treePath.pop(),
					parentLevel = treePath.length,
					grid = t.grid;
				if(parentId){
					var i, col, visualIndex;
					for(i = grid._columns.length - 1; i >= 0; --i){
						col = grid._columns[i];
						if(col.expandLevel && (!t.arg('nested') || col.expandLevel == parentLevel)){
							break;
						}
					}
					m.when({id: parentId}, function(){
						visualIndex = grid.body.getVisualIndex({
							parentId: treePath.pop(), 
							rowIndex: m.idToIndex(parentId)
						}).visualIndex;
					}).then(function(){
						grid.vScroller.scrollToRow(visualIndex).then(function(){
							grid.body._focusCell(null, visualIndex, col.index);
						});
					});
				}
			}else if(e.ctrlKey && isExpando(e.cellNode)){
				var ltr = grid.isLeftToRight();
				if(e.keyCode == (ltr ? keys.LEFT_ARROW : keys.RIGHT_ARROW) && t._openInfo[e.rowId]){
					t.collapse(e.rowId);
				}else if(e.keyCode == (ltr ? keys.RIGHT_ARROW : keys.LEFT_ARROW) && !t._openInfo[e.rowId]){
					t.expand(e.rowId);
				}
			}
		},
		//open state persist----------------------------------------------------
		_persist: function(){
			return {
				openInfo: this._openInfo, 
				parentOpenInfo: this._parentOpenInfo
			};
		}
	}));
});
