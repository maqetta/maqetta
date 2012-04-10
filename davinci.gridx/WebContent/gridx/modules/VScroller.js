define([
	"dojo/_base/declare",
	"dojo/_base/Deferred",
	"dojo/_base/event",
	"dojo/_base/sniff",
	"dojo/_base/query",
	"dojo/keys",
	"dojox/html/metrics",
	"../core/_Module"
], function(declare, Deferred, event, sniff, query, keys, metrics, _Module){
	
	var st = 'scrollTop';

	return _Module.register(
	declare(/*===== "gridx.modules.VScroller", =====*/_Module, {
		// summary:
		//		This module provides basic vertical scrolling logic for grid.
		// description:
		//		This module will make the grid body render all rows without paging.
		//		So it is very fast for small client side store, and might be extremely slow
		//		for large server side store.

		name: 'vScroller',
	
//        required: ['hLayout'],

		forced: ['body', 'vLayout', 'columnWidth'],

		optional: ['pagination'],
	
		getAPIPath: function(){
			// tags:
			//		protected extension
			return {
				vScroller: this
			};
		},

		preload: function(args){
			// tags:
			//		protected extension
			var t = this, g = t.grid,
				dn = t.domNode = g.vScrollerNode;
			t.stubNode = dn.firstChild;
			if(sniff('ie') < 8){
				t.stubNode.style.width = metrics.getScrollbar().w + 'px';
			}
			if(g.autoHeight){
				dn.style.display = 'none';
			}else{
				t.domNode.style.width = metrics.getScrollbar().w + 'px';
			}
			g.hLayout.register(null, dn, 1);
		},

		load: function(args, startup){
			// tags:
			//		protected extension
			var t = this, g = t.grid, bn = g.bodyNode;
			t.batchConnect(
				[t.domNode, 'onscroll', '_doScroll'],
				[bn, 'onmousewheel', '_onMouseWheel'],
				[g.mainNode, 'onkeypress', '_onKeyScroll'],
				[g.body, 'onRender', '_onBodyChange'],
				[g.body, 'onForcedScroll', '_onForcedScroll'],
				[g, '_onResizeEnd', '_onBodyChange'],
				sniff('ff') && [bn, 'DOMMouseScroll', '_onMouseWheel']
			);
			startup.then(function(){
				Deferred.when(t._init(args), function(){
					t.domNode.style.width = '';
					t.loaded.callback();
				});
			});
		},
	
		//Public ----------------------------------------------------

		scrollToRow: function(rowVisualIndex, toTop){
			// summary:
			//		Scroll the grid until the required row is in view.
			// description:
			//		This job will be an asynchronous one if the lazy-loading and lazy-rendering are used.
			// rowVisualIndex: Integer
			//		The visual index of the row
			// toTop: Boolean?
			//		If set this to true, the grid will try to scroll the required row to the top of the view.
			//		Otherwise, the grid will stop scrolling as soon as the row is visible.
			// returns:
			//		A deferred object indicating when the scrolling process is finished. This will be useful
			//		when using lazy-loading and lazy-rendering.
			var d = new Deferred(),
				bn = this.grid.bodyNode,
				dn = this.domNode,
				dif = 0,
				n = query('[visualindex="' + rowVisualIndex + '"]', bn)[0];
			if(n){
				var no = n.offsetTop,
					bs = bn[st];
				if(toTop){
					dn[st] = no;
					d.callback(true);
					return d;	//dojo.Deferred
				}else if(no < bs){
					dif = no - bs;
				}else if(no + n.offsetHeight > bs + bn.clientHeight){
					dif = no + n.offsetHeight - bs - bn.clientHeight;
				}else{
					d.callback(true);
					return d;	//dojo.Deferred
				}
				dn[st] += dif;
			}
			d.callback(!!n);
			return d;	//dojo.Deferred
		},
	
		//Protected -------------------------------------------------
		_init: function(){
			this._onForcedScroll();
		},
	
		_doScroll: function(){
			this.grid.bodyNode[st] = this.domNode[st];
		},
	
		_onMouseWheel: function(e){
			if(!this.grid.autoHeight){
				var rolled = typeof e.wheelDelta === "number" ? e.wheelDelta / 3 : (-40 * e.detail); 
				this.domNode[st] -= rolled;
				event.stop(e);
			}
		},
	
		_onBodyChange: function(){
			var t = this, g = t.grid;
			//IE7 Needs setTimeout
			window.setTimeout(function(){
				t.stubNode.style.height = g.bodyNode.scrollHeight + 'px';
				t._doScroll();
				//FIX IE7 problem:
				g.vScrollerNode[st] = g.vScrollerNode[st] || 0;
			},0);
		},

		_onForcedScroll: function(){
			var t = this, bd = t.grid.body;
			return t.model.when({
				start: bd.rootStart, 
				count: bd.rootCount
			}, function(){
				bd.renderRows(0, bd.rootCount || t.model.size() - bd.rootStart);
			});
		},
	
		_onKeyScroll: function(evt){
			var t = this, bd = t.grid.body, sn = t.domNode, r, fc = '_focusCellRow';
			if(evt.keyCode == keys.HOME){
				bd[fc] = 0;
				sn[st] = 0;
			}else if(evt.keyCode == keys.END){
				bd[fc] = bd.visualCount - 1;
				sn[st] = t.stubNode.clientHeight - bd.domNode.offsetHeight;
			}else if(evt.keyCode == keys.PAGE_UP){
				r = bd[fc] = Math.max(bd.renderStart - bd.renderCount, 0);
				t.scrollToRow(r, 1);
			}else if(evt.keyCode == keys.PAGE_DOWN){
				r = bd[fc] = Math.min(bd.visualCount - 1, bd.renderStart + bd.renderCount);
				t.scrollToRow(r, 1);
			}else{
				return;
			}
			event.stop(evt);
		}
	}));
});
