define([
	"dojo/_base/declare",
	"dojo/_base/array",
	"dojo/_base/Deferred",
	"dojo/_base/query",
	"dojo/_base/sniff",
	"dojo/dom-geometry",
	"dojo/dom-class",
	"dojo/dom-style",
	"dojo/keys",
	"../core/_Module"
], function(declare, array, Deferred, query, sniff, domGeometry, domClass, domStyle, keys, _Module){

	return _Module.register(
	declare(/*===== "gridx.modules.ColumnWidth", =====*/_Module, {
		// summary:
		//		Manages column width distribution, allow grid autoWidth and column autoResize.

		name: 'columnWidth',
	
		forced: ['hLayout', 'header'],

		getAPIPath: function(){
			// tags:
			//		protected extension
			return {
				columnWidth: this
			};
		},

		constructor: function(){
			this._ready = new Deferred();
		},

		preload: function(){
			// tags:
			//		protected extension
			var t = this, g = t.grid;
			if(!g.hScroller){
				t.autoResize = true;
			}
			t.batchConnect(
				[g, '_onResizeBegin', function(changeSize, ds){
					ds.header = new Deferred();
					if(!t.arg('autoResize')){
						t._adaptWidth();
					}else{
						var w = g.domNode.clientWidth - g.hLayout.lead - g.hLayout.tail;
						g.bodyNode.style.width = (w < 0 ? 0 : w) + 'px';
					}
					ds.header.callback();
				}],
				[g.hLayout, 'onUpdateWidth', function(){
					t._adaptWidth();
					t._ready.callback();
				}],
				[g, 'setColumns', '_adaptWidth']
			);
		},

		load: function(){
			// tags:
			//		protected extension
			var loaded = this.loaded;
			this._ready.then(function(){
				loaded.callback();
			});
		},

		//Public-----------------------------------------------------------------------------

		// default: Number
		//		Default column width. Applied when it's not possible to decide accurate column width from user's config.
		'default': 60,

		// autoResize: Boolean
		//		If set to true, the column width can only be set to auto or percentage values (if not, it'll be regarded as auto),
		//		then the column will automatically resize when the grid width is changed (this is the default behavior of an
		//		HTML table).
		autoResize: false,

		//Private-----------------------------------------------------------------------------
		_adaptWidth: function(){
			var t = this,
				g = t.grid,
				dn = g.domNode,
				header = g.header,
				ltr = g.isLeftToRight(),
				marginLead = ltr ? 'marginLeft' : 'marginRight',
				marginTail = ltr ? 'marginRight' : 'marginLeft',
				lead = g.hLayout.lead,
				tail = g.hLayout.tail,
				innerNode = header.innerNode,
				bs = g.bodyNode.style,
				hs = innerNode.style,
				bodyWidth = (dn.clientWidth || domStyle.get(dn, 'width')) - lead - tail,
				refNode = query('.gridxCell', innerNode)[0],
				padBorder = domGeometry.getMarginBox(refNode).w - domGeometry.getContentBox(refNode).w,
				isGridHidden = !dn.offsetHeight,
				isCollapse = domStyle.get(refNode, 'borderCollapse') == 'collapse';
			hs[marginLead] = bs[marginLead] = lead + 'px';
			hs[marginTail] = tail + 'px';
			bodyWidth = bodyWidth < 0 ? 0 : bodyWidth;
			if(isGridHidden && isCollapse){
				padBorder--;
			}
			if(g.autoWidth){
				array.forEach(g._columns, function(c){
					if(!c.width){
						c.width = t.arg('default') + 'px';
					}
				});
				header.refresh();
				var headers = query('th.gridxCell', innerNode),
					totalWidth = isCollapse ? 2 : 0;
				headers.forEach(function(node){
					var w = domStyle.get(node, 'width');
					if(!sniff('webkit') || !isGridHidden){
						w += padBorder;
					}
					totalWidth += w;
					var c = g._columnsById[node.getAttribute('colid')];
					if(!c.width || /%$/.test(c.width)){
						c.width = w + 'px';
					}
				});
				header._columnsWidth = totalWidth;
				bs.width = totalWidth + 'px';
				dn.style.width = (lead + tail + totalWidth) + 'px';
			}else if(t.arg('autoResize')){
				bs.width = bodyWidth + 'px';
				domClass.add(dn, 'gridxPercentColumnWidth');
				array.forEach(g._columns, function(c){
					if(!c.width || !/%$/.test(c.width)){
						c.width = 'auto';
					}
				});
				header.refresh();
			}else{
				var autoCols = [],
					fixedWidth = isCollapse ? 2 : 0;
				bs.width = bodyWidth + 'px';
				array.forEach(g._columns, function(c){
					if(!c.width || c.width == 'auto'){
						c.width = 'auto';
						autoCols.push(c);
					}else if(/%$/.test(c.width)){
						c.width = parseInt(bodyWidth * parseFloat(c.width, 10) / 100 - padBorder, 10) + 'px';
					}
				});
				header.refresh();
				array.forEach(g._columns, function(c){
					if(c.width != 'auto'){
						var w = domStyle.get(header.getHeaderNode(c.id), 'width');
						if(!c.width || /%$/.test(c.width)){
							c.width = w + 'px';
						}
						if(!sniff('webkit') ||!isGridHidden){
							w += padBorder;
						}
						fixedWidth += w;
					}
				});
				if(autoCols.length){
					if(sniff('webkit')){
						padBorder = 0;
					}
					var w = bodyWidth > fixedWidth ? ((bodyWidth - fixedWidth) / autoCols.length - padBorder) : t.arg('default');
					w = parseInt(w, 10) + 'px';
					array.forEach(autoCols, function(c){
						c.width = w; 
					});
				}
				header.refresh();
			}
			if(sniff('ie') < 8){
				hs.width = bodyWidth + 'px';
			}
			if(g.hScroller){
				g.hScroller.scroll(0);
				header._onHScroll(0);
			}
		}
	}));
});
