define([
	"dojo/_base/declare",
	"dojo/dom-construct",
	"dojo/dom-class",
	"dojo/dom-geometry",
	"dojo/_base/query",
	"dojo/_base/sniff",
	"dojo/keys",
	"../util",
	"../core/_Module"
], function(declare, domConstruct, domClass, domGeometry, query, sniff, keys, util, _Module){

	return _Module.register(
	declare(/*===== "gridx.modules.Header", =====*/_Module, {
		// summary:
		//		The header UI of grid
		// description:
		//		This module is in charge of the rendering of the grid header. But it should not manage column width,
		//		which is the responsibility of ColumnWidth module.

		name: 'header',
	
//        required: ['vLayout'],

		forced: ['hLayout'],

		getAPIPath: function(){
			// tags:
			//		protected extension
			return {
				header: this
			};
		},

		constructor: function(){
			//Prepare this.domNode
			var dn = this.domNode = domConstruct.create('div', {
					'class': 'gridxHeaderRow',
					role: 'presentation'
				}),
				inner = this.innerNode = domConstruct.create('div', {
					'class': 'gridxHeaderRowInner',
					role: 'row',
					innerHTML: '<table border="0" cellpadding="0" cellspacing="0"><tr><th class="gridxCell"></th></tr></table>'
				});
			dn.appendChild(inner);
		},

		preload: function(args){
			// tags:
			//		protected extension
			var t = this, g = t.grid, dn = t.domNode;
			g.headerNode.appendChild(dn);
			//Add this.domNode to be a part of the grid header
			g.vLayout.register(t, 'domNode', 'headerNode');
			t.batchConnect(
				[g, 'onHScroll', '_onHScroll'],
				[g, 'onHeaderCellMouseOver', '_onHeaderCellMouseOver'],
				[g, 'onHeaderCellMouseOut', '_onHeaderCellMouseOver'],
				g.columnResizer && [g.columnResizer, 'onResize', '_onColumnResize']
			);
			t._initFocus();
			
			//Prepare mouse events
			g._connectEvents(dn, '_onMouseEvent', t);
		},

		destroy: function(){
			// tags:
			//		protected extension
			this.inherited(arguments);
			domConstruct.destroy(this.domNode);
		},

		columnMixin: {
			headerNode: function(){
				return this.grid.header.getHeaderNode(this.id);
			}
		},
	
		//Public-----------------------------------------------------------------------------
		getHeaderNode: function(id){
			// summary:
			//		Get the header DOM node by column ID.
			// id: String
			//		The column ID
			// returns:
			//		The header DOM node
			return query("[colid='" + id + "']", this.domNode)[0];	//DOMNode
		},
		
		refresh: function(){
			// summary:
			//		Re-build the header UI.
			var t = this, g = t.grid, f = g.focus,
				sb = ['<table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr>'];
			g.columns().forEach(function(col){
				sb.push('<th colid="', col.id, '" class="gridxCell ',
					f && f.currentArea() == 'header' && col.id == t._focusHeaderId ? t._focusClass : '',
					'" role="columnheader" aria-readonly="true" tabindex="-1" style="width: ',
					col.getWidth(),
					'"><div class="gridxSortNode">', 
					col.name(),
					'</div></th>');
			});
			sb.push('</tr></table>');
			t.innerNode.innerHTML = sb.join('');
			t._onHScroll(t._scrollLeft);
			t.onRender();
		},

		onRender: function(){
			// tags:
			//		callback
		},

		onMoveToHeaderCell: function(/* columnId, e */){
			// tags:
			//		callback
		},
		
		//Private-----------------------------------------------------------------------------
		_scrollLeft: 0,

		_onColumnResize: function(colId, width, oldWidth){
			var t = this, g = t.grid, w;
			if(g.autoWidth){
				w = t._columnsWidth += width - oldWidth;
				g.bodyNode.style.width = w + 'px';
				g.domNode.style.width = (g.hLayout.lead + g.hLayout.tail + w) + 'px';
			}else{
				t._onHScroll(g.hScrollerNode.scrollLeft);
			}
		},

		_onHScroll: function(left){
			var ltr = this.grid.isLeftToRight();
			this.innerNode.firstChild.style[ltr ? 'marginLeft' : 'marginRight'] = (!ltr && sniff('ff') ? left : -left) + 'px';
			this._scrollLeft = left;
		},
	
		_onMouseEvent: function(eventName, e){
			var g = this.grid,
				evtCell = 'onHeaderCell' + eventName,
				evtRow = 'onHeader' + eventName;
			if(g._isConnected(evtCell) || g._isConnected(evtRow)){
				this._decorateEvent(e);
				if(e.columnIndex >= 0){
					g[evtCell](e);
				}
				g[evtRow](e);
			}
		},
	
		_decorateEvent: function(e){
			for(var n = e.target, c; n && n !== this.domNode; n = n.parentNode){
				if(n.tagName.toLowerCase() == 'th'){
					c = this.grid._columnsById[n.getAttribute('colid')];
					if(c){
						e.columnId = c.id;
						e.columnIndex = c.index;
					}
					return;
				}
			}
		},
		
		_onHeaderCellMouseOver: function(e){
			domClass.toggle(this.getHeaderNode(e.columnId), 'gridxHeaderCellOver', e.type == 'mouseover');
		},
		
		// Focus
		_focusHeaderId: null,

		_focusClass: "gridxHeaderCellFocus",

		_initFocus: function(){
			var t = this, g = t.grid;
			if(g.focus){
				g.focus.registerArea({
					name: 'header',
					priority: 0,
					focusNode: t.domNode,
					scope: t,
					doFocus: t._doFocus,
					doBlur: t._blurNode,
					onBlur: t._blurNode,
					connects: [
						t.connect(t.domNode, 'onkeydown', '_onKeyDown'),
						t.connect(g, 'onHeaderCellMouseDown', function(evt){
							t._focusNode(t.getHeaderNode(evt.columnId));
						})
					]
				});
			}
		},

		_doFocus: function(evt, step){
			var t = this, 
				n = t._focusHeaderId && t.getHeaderNode(t._focusHeaderId),
				r = t._focusNode(n || query('th.gridxCell', t.domNode)[0]);
			util.stopEvent(r && evt);
			return r;
		},

		_focusNode: function(node){
			if(node){
				var t = this, g = t.grid,
					fid = t._focusHeaderId = node.getAttribute('colid');
				if(fid){
					t._blurNode();
					if(g.hScroller){
						//keep scrolling
						var pos = domGeometry.position(node),
							containerPos = domGeometry.position(t.domNode),
							dif = pos.x + pos.w - containerPos.x - containerPos.w;
						if(dif < 0){
							dif = pos.x - containerPos.x;
							if(dif > 0){
								dif = 0;
							}
						}
						if(g.isLeftToRight()){
							dif += t._scrollLeft;
						}
						t._onHScroll(dif);
						g.hScroller.scroll(dif);
					}
					domClass.add(node, t._focusClass);
					node.focus();
					return true;
				}
			}
			return false;
		},

		_blurNode: function(){
			var t = this, n = query('th.' + t._focusClass, t.domNode)[0];
			if(n){
				domClass.remove(n, t._focusClass);
			}
			return true;
		},

		_onKeyDown: function(evt){
			var t = this, g = t.grid, col,
				dir = g.isLeftToRight() ? 1 : -1,
				delta = evt.keyCode == keys.LEFT_ARROW ? -dir : dir;
			if(t._focusHeaderId){
				if(evt.keyCode == keys.LEFT_ARROW || evt.keyCode == keys.RIGHT_ARROW){
					//Prevent scrolling the whole page.
					util.stopEvent(evt);
					col = g._columnsById[t._focusHeaderId];
					col = g._columns[col.index + delta];
					if(col){
						t._focusNode(t.getHeaderNode(col.id));
						t.onMoveToHeaderCell(col.id, evt);
					}
				}
			}
		}
	}));
});
