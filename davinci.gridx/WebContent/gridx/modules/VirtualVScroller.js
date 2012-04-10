define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/_base/sniff",
	"dojo/_base/event",
	"dojo/_base/Deferred",
	"dojo/query",
	"./VScroller",
	"../core/_Module"
], function(declare, lang, array, sniff, event, Deferred, query, VScroller, _Module){
	
	return _Module.register(
	declare(/*===== "gridx.modules.VirtualVScroller", =====*/VScroller, {
		// summary:
		//		This module implements lazy-rendering when virtically scrolling grid.
		// description:
		//		This module takes a DOMNode-based way to implement lazy-rendering.
		//		It tries to remove all the DOMNodes that are out of the grid body viewport,
		//		so that the DOMNodes in grid are always limited to a very small number.

		constructor: function(grid, args){
			if(grid.autoHeight){
				lang.mixin(this, new VScroller(grid, args));
			}else{
				this._scrolls = [];
			}
		},

		//Public ----------------------------------------------------

		// buffSize: Integer
		//		The count row nodes that should be maintained above/below the grid body viewport.
		//		The total count row nodes consists of the count of rows that are visible, and buffSize * 2.
		buffSize: 5,
		
		// lazy: Boolean
		//		If this argument is set to true, the grid will not fetch data during scrolling.
		//		Instead, it'll fetch data after the scrolling process is completed (plus a timeout).
		//		This is useful when a large slow server side data store is used, because frequent
		//		data fetch requests are avoided.
		lazy: false,
		
		// lazyTimeout: Number
		//		This is the timeout for the "lazy" argument.
		lazyTimeout: 50,
	
		scrollToRow: function(rowVisualIndex, toTop){
			// tags:
			//		extension
			var d = new Deferred(), t = this, s = t._scrolls,
				f = function(){
					t._subScrollToRow(rowVisualIndex, d, toTop);
				};
			s.push(d);
			if(s.length > 1){
				s[s.length - 2].then(f);
			}else{
				f();
			}
			return d;
		},

		//Private -------------------------------------------------
		_subScrollToRow: function(rowVisualIndex, defer, toTop){
			var t = this,
				dif = 0,
				rowHeight = t._avgRowHeight,
				bn = t.grid.bodyNode,
				dn = t.domNode,
				bst = bn.scrollTop,
				dst = dn.scrollTop,
				node = query('[visualindex="' + rowVisualIndex + '"]', bn)[0],
				finish = function(success){
					t._scrolls.splice(array.indexOf(t._scrolls, defer), 1);
					defer.callback(success);
				};
			if(node){
				var offsetTop = node.offsetTop;
				if(offsetTop + node.offsetHeight > bst + bn.clientHeight){
					dif = offsetTop - bst;
					if(!toTop){
						dif += node.offsetHeight - bn.clientHeight;
					}
				}else if(offsetTop < bst || (toTop && offsetTop > bst)){
					dif = offsetTop - bst;
				}else{
					finish(true);
					return;
				}
			}else if(bn.childNodes.length){
				//Find a visible node.
				var n = bn.firstChild;
				while(n && n.offsetTop < bst){
					n = n.nextSibling;
				}
				var idx = n && n.getAttribute('visualindex');
				if(n && rowVisualIndex < idx){
					dif = (rowVisualIndex - idx) * rowHeight;
				}else{
					n = bn.lastChild;
					while(n && n.offsetTop + n.offsetHeight > bst + bn.clientHeight){
						n = n.previousSibling;
					}
					idx = n && n.getAttribute('visualindex');
					if(n && rowVisualIndex > idx){
						dif = (rowVisualIndex - idx) * rowHeight;
					}else{
						finish(false);
						return;
					}
				}
			}else{
				finish(false);
				return;
			}
			var istop = dst === 0 && dif < 0,
				isbottom = dst >= dn.scrollHeight - dn.offsetHeight && dif > 0;
			if(istop || isbottom){
				t._doVirtualScroll(1);
			}else{
				dn.scrollTop += dif / t._ratio;
			}
			if((istop && bn.firstChild.getAttribute('visualindex') == 0) || 
					(isbottom && bn.lastChild.getAttribute('visualindex') == t.grid.body.visualCount - 1)){
				finish(false);
				return;
			}
			setTimeout(function(){
				t._subScrollToRow(rowVisualIndex, defer, toTop);
			}, 5);
		},
	
		_init: function(args){
			var t = this;
			t._rowHeight = {};
			t._syncHeight();
			t.connect(t.grid, '_onResizeEnd', function(){
				t._doScroll(0, 1);
			});
			t._doScroll(0, 1);
		},
	
		_doVirtualScroll: function(forced){
			var t = this,
				dn = t.domNode,
				a = dn.scrollTop,
				deltaT = t._ratio * (a - (t._lastScrollTop || 0));
	
			if(forced || deltaT){
				t._lastScrollTop = a;
	
				var buffSize = t.arg('buffSize'),
					scrollRange = dn.scrollHeight - dn.offsetHeight,
					body = t.grid.body,
					visualStart = body.visualStart,
					visualEnd = visualStart + body.visualCount,
					bn = t.grid.bodyNode,
					firstRow = bn.firstChild,
					firstRowTop = firstRow && firstRow.offsetTop - deltaT,
					lastRow = bn.lastChild,
					lastRowBtm = lastRow && lastRow.offsetTop - deltaT + lastRow.offsetHeight,
					bnTop = bn.scrollTop,
					bnBtm = bnTop + bn.clientHeight,
					h = t._avgRowHeight,
					pageRowCount = Math.ceil(dn.offsetHeight / h) + 2 * buffSize,
					start, end, pos, d;
				if(firstRow && firstRowTop > bnTop && firstRowTop < bnBtm){
					//Add some rows to the front
					end = body.renderStart;
					d = Math.ceil((firstRowTop - bnTop) / h) + buffSize;
					start = a === 0 ? visualStart : Math.max(end - d, visualStart);
					pos = "top";
//                    console.log('top: ', start, end);
				}else if(lastRow && lastRowBtm > bnTop && lastRowBtm < bnBtm){
					//Add some rows to the end
					start = body.renderStart + body.renderCount;
					d = Math.ceil((bnBtm - lastRowBtm) / h) + buffSize;
					end = a === scrollRange && a ? visualEnd : Math.min(start + d, visualEnd);
					pos = "bottom";
//                    console.log('bottom: ', start, end);
				}else if(!firstRow || firstRowTop > bnBtm || !lastRow || lastRowBtm < bnTop){
					//Replace all
					if(a <= scrollRange / 2){
						start = a === 0 ? visualStart : visualStart + Math.max(Math.floor(a / h) - buffSize, 0);
						end = Math.min(start + pageRowCount, visualEnd);
					}else{
						end = a === scrollRange ? visualEnd : visualEnd + Math.min(pageRowCount - Math.floor((scrollRange - a) / h), 0);
						start = Math.max(end - pageRowCount, visualStart);
					}
					pos = "clear";
				}else if(firstRow){
					//The body and the scroller bar may be mis-matched, so force to sync here.
					if(a === 0){
						var firstRowIndex = body.renderStart;
						if(firstRowIndex > visualStart){
							start = visualStart;
							end = firstRowIndex;
							pos = "top";
//                            console.debug("Recover top", end - start);
						}	
					}else if(a === scrollRange){
						var lastRowIndex = body.renderStart + body.renderCount - 1;
						if(lastRowIndex < visualEnd - 1){
							start = lastRowIndex + 1;
							end = visualEnd;
							pos = "bottom";
//                            console.debug("Recover bottom", end - start);
						}
					}
				}
				
				if(typeof start == 'number' && typeof end == 'number'){
//                    console.debug("render: ", start, end, pos, a, scrollRange);
					//Only need to render when the range is valid
					body.renderRows(start, end - start, pos);
					if(a && start < end){
						//Scroll the body to hide the newly added top rows.
						var n = query('[visualindex="' + end + '"]', bn)[0];
						if(n){
							deltaT += n.offsetTop;
						}
					}
				}
				//Ensure the position when user scrolls to end points
				if(a === 0){
					bn.scrollTop = 0;
				}else if(a >= scrollRange){//Have to use >=, because with huge store, a will sometimes be > scrollRange
					bn.scrollTop = bn.scrollHeight;
				}else if(pos != "clear"){
					bn.scrollTop += deltaT;
				}
			}
		},
		
		_doScroll: function(e, forced){
			var t = this;
			if(t.arg('lazy')){
				if(t._lazyScrollHandle){
					clearTimeout(t._lazyScrollHandle);
				}
				t._lazyScrollHandle = setTimeout(lang.hitch(t, t._doVirtualScroll, forced), t.arg('lazyTimeout'));
			}else{
				t._doVirtualScroll(forced);
			}
		},
	
		_onMouseWheel: function(e){
			var rolled = typeof e.wheelDelta === "number" ? e.wheelDelta / 3 : (-40 * e.detail); 
			this.domNode.scrollTop -= rolled / this._ratio;
			event.stop(e);
		},
	
		_onBodyChange: function(){
			this._doScroll(0, 1);
			this._doVirtual();
		},
	
		_onForcedScroll: function(){
			this._rowHeight = {};
			this._onBodyChange();
		},

		//Private ---------------------------------------------------
		_avgRowHeight: 24,
		_rowHeight: null,
		_ratio: 1,
	
		_syncHeight: function(){
			var t = this,
				h = t._avgRowHeight * t.grid.body.visualCount,
				maxHeight = 1342177;
			if(sniff('ff')){
				maxHeight = 17895697;
			}else if(sniff('webkit')){
				maxHeight = 134217726;
			}
			if(h > maxHeight){
				t._ratio = h / maxHeight;
				h = maxHeight;
			}
			t.stubNode.style.height = h + 'px';
		},
	
		_doVirtual: function(){
			var t = this;
			clearTimeout(t._pVirtual);
			t._pVirtual = setTimeout(function(){
				t._update();
			}, 100);
		},
	
		_update: function(){
			//Update average row height and unrender rows
			var t = this,
				preCount = 0,
				postCount = 0,
				g = t.grid,
				bd = g.body,
				bn = g.bodyNode,
				buff = t.buffSize * t._avgRowHeight,
				st = bn.scrollTop,
				top = st - buff,
				bottom = st + bn.clientHeight + buff,
				rh = t._rowHeight;
	
			array.forEach(bn.childNodes, function(n){
				rh[n.getAttribute('rowid')] = n.offsetHeight;
				if(n.offsetTop > bottom){
					++postCount;
				}else if(n.offsetTop + n.offsetHeight < top){
					++preCount;
				}
			});
			bd.unrenderRows(preCount);
			bd.unrenderRows(postCount, 'post');
	
			var p, h = 0, c = 0;
			for(p in rh){
				h += rh[p];
				++c;
			}
			if(c){
				t._avgRowHeight = h / c;
				t._syncHeight();
			}
		}
	}));
});
