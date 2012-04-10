define([
	"dojo/_base/declare",
	"dojo/_base/array",
	"dojo/_base/connect",
	"dojo/_base/event",
	"dojo/_base/query",
	"dojo/_base/window",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-style",
	"dojo/keys",
	"../core/_Module",
	"../core/model/extensions/Sort",
	"dojo/i18n!../nls/NestedSort"
], function(declare, array, connect, event, query, win, domClass, domConstruct, domStyle, keys, _Module, Sort, nls){
	
	var forEach = array.forEach,
		filter = array.filter,
		indexOf = array.indexOf,
		hasClass = domClass.contains,
		removeClass = domClass.remove,
		addClass = domClass.add;

	return declare(/*===== "gridx.modules.NestedSort", =====*/_Module, {
		name: 'sort',

		forced: ['header'],

//        required: ['vLayout'],

		modelExtensions: [Sort],

		_a11yText: {
			'dojoxGridDescending'   : '&#9662;',
			'dojoxGridAscending'    : '&#9652;',
			'dojoxGridAscendingTip' : '&#1784;',
			'dojoxGridDescendingTip': '&#1783;',
			'dojoxGridUnsortedTip'  : 'x' //'&#10006;'
		},

		constructor: function(){
			this._sortData = [];
		},

		getAPIPath: function(){
			return {
				sort: this
			};
		},

		preload: function(args){
			var t = this;
			t._sortData = t.arg('preSort') || t._sortData;
			//persistence support
			if(t.grid.persist){
				var d = t.grid.persist.registerAndLoad('sort', function(){
					return t._sortData;
				});
				if(d){
					t._sortData = d;
				}
			}
			t._sortData = filter(t._sortData, function(d){
				return t.isSortable(d.colId);
			});
			if(t._sortData.length){
				t.grid.model.sort(t._sortData);
			}
		},

		load: function(args){
			this._init();
			this.loaded.callback();
		},

		columnMixin: {
			isSorted: function(){
				return this.grid.sort.isSorted(this.id);
			},
			isSortable: function(){
				return this.grid.sort.isSortable(this.id);
			}
		},
		
		getSortData: function(){
			return this._sortData;
		},
		
		sort: function(sortData){
			var t = this;
			t._sortData = filter(sortData, function(d){
				return t.isSortable(d.colId);
			});
			t._doSort();
			t._updateUI();
		},
		
		isSorted: function(colId){
			return array.some(this._sortData, function(d){
				return d.colId == colId;
			});
		},

		_doSort: function(){
			var g = this.grid,
				d = this._sortData;
			g.model.sort(d.length ? d : null);
			g.body.refresh();
		},
		
		clear: function(){
			//summary:
			//	Clear the sorting state
			this._sortData.length = 0;
			this._doSort();
			this._updateUI();
		},

		isSortable: function(colId){
			var col = this.grid._columnsById[colId];
			return col && (col.sortable || col.sortable === undefined);
		},

		//Private---------------------------------------------------------------------------
		_init: function(){
			var t = this,
				n = t.grid.header.domNode,
				f = function(){
					t._initHeader();
					t._initFocus();
					t._updateUI();
				};
			t.connect(n, 'onclick', '_onHeaderClick');
			t.connect(n, 'onmouseover', '_onMouseOver');
			t.connect(n, 'onmouseout', '_onMouseOver');
			t.connect(t.grid.header, 'onRender', f);
			f();
		},
		
		_initHeader: function(){
			var t = this,
				table = t.grid.header.domNode.firstChild.firstChild,
				tds = table.rows[0].cells;
			if(query('.gridxSortBtn', table).length)return;
			forEach(table.rows[0].cells, function(td){
				var colid = td.getAttribute('colid');
				if(t.isSortable(colid)){
					domConstruct.create('div', {
						className: 'gridxSortBtn gridxSortBtnNested'
					}, td, 'first');
					domConstruct.create('div', {
						className: 'gridxSortBtn gridxSortBtnSingle'
					}, td, 'first');
				}
			});
		},
		
		_onHeaderClick: function(e){
			var t = this,
				btn = e.target,
				sortData = t._sortData,
				colid;
			t._markFocus(e);
			if(hasClass(btn, 'gridxSortBtn')){
				colid = btn.parentNode.getAttribute('colid');
			}else{
				return;
			}
			if(hasClass(btn, 'gridxSortBtnSingle')){
				//single sort
				if(sortData.length > 1){
					sortData.length = 0;
				}
				var d = filter(sortData, function(data){
					return data.colId === colid;
				})[0];
				sortData.length = 0;
				if(d){
					sortData.push(d);
				}
				t._sortColumn(colid);
			}else if(hasClass(btn, 'gridxSortBtnNested')){
				//nested sort
				t._sortColumn(colid);
			}
			event.stop(e);
		},
		
		_onMouseOver: function(e){
			var g = this.grid;
			domClass.toggle(g.header.domNode, 'gridxHeaderHover', e.type == 'mouseover');
			//FIXME: this is ugly...
			if(g.autoHeight){
				g.vLayout.reLayout();
			}
		},

		_sortColumn: function(colid){
			//summary:
			//	Sort one column in nested sorting state
			var t = this,
				sortData = t._sortData;
			if(t.isSortable(colid)){
				var d = filter(sortData, function(d){
					return d.colId === colid;
				})[0];
				if(d){
					if(d.descending){
						sortData.splice(indexOf(sortData, d), 1);
					}
					d.descending = !d.descending;
				}else{
					sortData.push({
						colId: colid,
						descending: false
					});
				}
				t._doSort();
				t._updateUI();
			}
		},
		
		_updateUI: function(){
			var t = this,
				g = t.grid,
				dn = g.domNode,
				sortData = t._sortData;
			removeClass(dn, 'gridxSingleSorted');
			removeClass(dn, 'gridxNestedSorted');
			
			query('th', g.header.domNode).forEach(function(cell){
				var colid = cell.getAttribute('colid');
				if(t.isSortable(colid)){
					forEach(['', 'Desc', 'Asc', 'Main'], function(s){
						removeClass(cell, 'gridxCellSorted' + s);
					});
					var singleBtn = cell.childNodes[0],
						nestedBtn = cell.childNodes[1],
						a11y = hasClass(win.body(), 'dijit_a11y'),
						a11yText = t._a11yText;
					singleBtn.title = nls.singleSort + ' - ' + nls.ascending;
					nestedBtn.title = nls.nestedSort + ' - ' + nls.ascending;
					singleBtn.innerHTML = a11y ? a11yText.dojoxGridAscendingTip : '&nbsp;';
					nestedBtn.innerHTML = sortData.length + 1 + (a11y ? a11yText.ascending : '');
					var d = filter(sortData, function(data){
						return data.colId === colid;
					})[0];
					t._setWaiState(cell, colid, d);
					if(d){
						nestedBtn.innerHTML = indexOf(sortData, d) + 1;
						addClass(cell, 'gridxCellSorted');
						if(d == sortData[0]){
							addClass(cell, 'gridxCellSortedMain');
						}
						var len = sortData.length;
						if(d.descending){
							addClass(cell, 'gridxCellSortedDesc');
							if(len == 1){
								singleBtn.title = nls.singleSort + ' - ' + nls.unsorted;
								if(a11y){
									singleBtn.innerHTML = a11yText.dojoxGridUnsortedTip;
								}
							}else{
								nestedBtn.title = nls.nestedSort + ' - ' + nls.unsorted;
								if(a11y){
									nestedBtn.innerHTML = a11yText.dojoxGridUnsortedTip;
								}
							}
						}else{
							addClass(cell, 'gridxCellSortedAsc');
							if(len == 1){
								singleBtn.title = nls.singleSort + ': ' + nls.descending;
								if(a11y){
									singleBtn.innerHTML = a11yText.dojoxGridDescendingTip;
								}
							}else{
								nestedBtn.title = nls.nestedSort + ' - ' + nls.descending;
								if(a11y){
									nestedBtn.innerHTML = a11yText.dojoxGridDescendingTip;
								}
							}
						}
					}
				}
			});
			if(sortData.length == 1){
				addClass(dn, 'gridxSingleSorted');
			}else if(sortData.length > 1){
				addClass(dn, 'gridxNestedSorted');
			}
		},
		
		//Focus and keyboard support---------------------------------------------------------------------------
		_initFocus: function(){
			var t = this,
				g = t.grid,
				headerNode = g.header.domNode;
			if(g.focus){
				t._initRegions();
				g.focus.registerArea({
					name: 'header',
					priority: 0,
					focusNode: headerNode,
					scope: t,
					doFocus: t._doFocus,
					doBlur: t._blurNode,
					onBlur: t._blurNode,
					connects: [
						t.connect(headerNode, 'onkeypress', '_onKeyPress')
					]
				});
			}
		},

		_doFocus: function(e){
			this._focusRegion(this._getCurrentRegion() || this._focusRegions[0]);
			return true;
		},

		_blurNode: function(e){
			return true;
		},

		_onKeyPress: function(e){
			var t = this,
				ltr = t.grid.isLeftToRight(),
				nextKey = ltr ? keys.RIGHT_ARROW : keys.LEFT_ARROW,
				previousKey = ltr ? keys.LEFT_ARROW : keys.RIGHT_ARROW;
			switch(e.keyCode){
				case previousKey:
					t._focusPrevious();
					break;
				case nextKey:
					t._focusNext();
					break;
				case keys.ENTER:
				case keys.SPACE:
					t._onHeaderClick(e);
					break;
			}
		},

		_onBlur: function(e){
			this._blurRegion(e.target);
		},

		_focusNext: function(){
			var t = this,
				i = t._currRegionIdx,
				rs = t._focusRegions;
			while(rs[i+1] && domStyle.get(rs[++i], 'display') === 'none'){}
			if(rs[i]){
				t._focusRegion(rs[i]);
			}
		},

		_focusPrevious: function(){
			var t = this,
				i = t._currRegionIdx,
				rs = t._focusRegions;
			while(rs[i-1] && (domStyle.get(rs[--i], 'display') === 'none' || hasClass(rs[i], 'gridxSortBtn'))){}
			if(rs[i]){
				t._focusRegion(rs[i]);
			}
		},

		_markFocus: function(e){
			var region = e.target,
				i = indexOf(this._focusRegions, region);
			if(i >= 0){
				this._focusRegion(region);
			}
		},

		_initRegions: function(){
			var t = this;
			forEach(t._nconns, connect.disconnect);
			t._focusRegions = [];
			t._nconns = [];
			query('.gridxCell', t.grid.header.domNode).forEach(function(cell){
				var children = cell.childNodes;
				forEach([2, 1, 0], function(i){
					if(children[i]){
						children[i].setAttribute('tabindex', '-1');
						t._focusRegions.push(children[i]);
						t._nconns.push(t.connect(children[i], 'onblur', '_onBlur'));
						return;
					}
				});
			});
			t._currRegionIdx = -1;
		},

		_focusRegion: function(region){
			// summary
			//		Focus the given region
			//console.debug(region);
			if(region){
				region.focus();
				var t = this,
					header = t._getRegionHeader(region);
				addClass(header, 'gridxCellSortFocus');
				if(hasClass(region, 'gridxSortNode')){
					addClass(region, 'gridxSortNodeFocus');
				}else if(hasClass(region, 'gridxSortBtn')){
					addClass(region, 'gridxSortBtnFocus');
				}
				addClass(t.grid.header.domNode, 'gridxHeaderFocus');
				t._currRegionIdx = indexOf(t._focusRegions, region);
				//firefox and ie will lost focus when region is invisible, focus it again.
				region.focus();
			}
		},

		_blurRegion: function(region){
			if(region){
				var header = this._getRegionHeader(region);
				removeClass(header, 'gridxCellSortFocus');
				removeClass(region, 'gridxSortNodeFocus');
				removeClass(region, 'gridxSortBtnFocus');
				removeClass(this.grid.header.domNode, 'gridxHeaderFocus');
			}
		},

		_getCurrentRegion: function(){
			return this._currRegionIdx === -1 ? null : this._focusRegions[this._currRegionIdx];
		},

		_getRegionHeader: function(region){
			while(region && !hasClass(region, 'gridxCell')){
				region = region.parentNode;
			}
			return region;
		},
		
		//a11y support ----------------------------
		_setWaiState: function(cell, colid, data){
			var col = this.grid.column(colid),
				columnInfo = 'Column ' + col.name(),
				orderState = 'none', orderAction = 'ascending';
			if(data){
				orderState = data.descending ? 'descending' : 'ascending';
				orderAction = data.descending ? 'none' : 'descending';
			}
			var a11ySingleLabel = columnInfo + ' - is sorted by ' + orderState + '. Choose to sort by ' + orderAction,
				a11yNestedLabel = columnInfo + ' - is nested sorted by ' + orderState + '. Choose to nested sort by ' + orderAction;
			cell.childNodes[0].setAttribute("aria-label", a11ySingleLabel);
			cell.childNodes[1].setAttribute("aria-label", a11yNestedLabel);
		}
	});
});
