define([
	"dojo/_base/declare",
	"dojo/_base/query",
	"dojo/_base/lang",
	"dojo/_base/sniff",
	"dojo/aspect",
	"dojo/dom-construct",
	"dojo/dom-class",
	"dojo/dom-style",
	"dojo/keys",
	"../core/_Module",
	"../util"
], function(declare, query, lang, sniff, aspect, domConstruct, domClass, domStyle, keys, _Module, util){

	return _Module.register(
	declare(/*===== "gridx.modules.RowHeader", =====*/_Module, {
		// summary:
		//		This modules provides a header before each row.
		// description:
		//		Row header can be used as a UI handler for row selection, especially when
		//		cell selection is turned on and selectRowTriggerOnCell is turned off.
		//		It can also be used as a place to hold the checkbox/radiobutton for IndirectSelect

		name: 'rowHeader',

		getAPIPath: function(){
			// tags:
			//		protected extension
			return {
				rowHeader: this
			};
		},

		constructor: function(){
			this.headerNode = domConstruct.create('div', {
				'class': 'gridxRowHeaderHeader',
				innerHTML: ['<table border="0" cellspacing="0" cellpadding="0" style="width: ', 
					this.arg('width'), 
					';"><tr><th class="gridxRowHeaderHeaderCell" tabindex="-1"></th></tr></table>'
				].join('')
			});
			this.bodyNode = domConstruct.create('div', {
				'class': 'gridxRowHeaderBody'
			});
		},

		destroy: function(){
			// tags:
			//		protected extension
			this.inherited(arguments);
			this._b.remove();
			domConstruct.destroy(this.headerNode);
			domConstruct.destroy(this.bodyNode);
		},

		preload: function(){
			// tags:
			//		protected extension
			var t = this,
				rhhn = t.headerNode,
				rhbn = t.bodyNode,
				g = t.grid,
				body = g.body,
				w = t.arg('width');
			//register events
			g._initEvents(['RowHeaderHeader', 'RowHeaderCell'], g._eventNames);
			//modify header
			g.header.domNode.appendChild(rhhn);
			rhhn.style.width = w;
			t.headerCellNode = query('th', rhhn)[0];
			g._connectEvents(rhhn, '_onHeaderMouseEvent', t);
			//modify body
			g.mainNode.appendChild(rhbn);
			rhbn.style.width = w;
			g.hLayout.register(null, rhbn);
			t.batchConnect(
				[body, 'onRender', '_onRendered'],
				[body, 'onAfterRow', '_onAfterRow'],
				[body, 'onUnrender', '_onUnrender'],
				[g.bodyNode, 'onscroll', '_onScroll'],
				[g, 'onRowMouseOver', '_onRowMouseOver'],
				[g, 'onRowMouseOut', '_onRowMouseOver'],
				[g, '_onResizeEnd', '_onResize'],
				g.columnResizer && [g.columnResizer, 'onResize', '_onResize']
			);
			//TODO: need to organize this into connect/disconnect system
			t._b = aspect.before(body, 'renderRows', lang.hitch(t, t._onRenderRows), true);
			g._connectEvents(rhbn, '_onBodyMouseEvent', t);
			t._initFocus();
		},

		//Public--------------------------------------------------------------------------

		// width: String
		//		The width (CSS value) of a row header.
		width: '20px',

		onMoveToRowHeaderCell: function(){
			// tags:
			//		callback
		},

		/*=====
		// headerProvider: Function
		//		A functionn that returns an HTML string to fill the header cell of row headers.
		headerProvider: null,

		// cellProvider: Function
		//		A function that returns an HTML string to fill the body cells of row headers.
		cellProvider: null,
		=====*/

		//Private-------------------------------------------------------
		_onRenderRows: function(start, count, position){
			var nd = this.bodyNode;
			if(count > 0){
				var str = this._buildRows(start, count);
				if(position == 'top'){
					domConstruct.place(str, nd, 'first');
				}else if(position == 'bottom'){
					domConstruct.place(str, nd, 'last');
				}else{
					nd.innerHTML = str;
					nd.scrollTop = 0;
				}
			}else if(position != 'top' && position != 'bottom'){
				nd.innerHTML = '';
			}
		},

		_onAfterRow: function(rowInfo, rowCache){
			var t = this,
				n = query('[visualindex="' + rowInfo.visualIndex + '"].gridxRowHeaderRow', t.bodyNode)[0],
				bn = query('[visualindex="' + rowInfo.visualIndex + '"].gridxRow .gridxRowTable', t.grid.bodyNode)[0],
				nt = n.firstChild,
				cp = t.arg('cellProvider');
			nt.style.height = bn.offsetHeight + 'px';
			n.setAttribute('rowid', rowInfo.rowId);
			n.setAttribute('rowindex', rowInfo.rowIndex);
			n.setAttribute('parentid', rowInfo.parentId || '');
			if(cp){
				nt.firstChild.firstChild.firstChild.innerHTML = cp.call(t, rowInfo);
			}
		},

		_onRendered: function(start, count){
			var t = this, hp = t.arg('headerProvider');
			if(hp){
				t.headerCellNode.innerHTML = hp();
			}
			t._onScroll();
		},

		_onUnrender: function(id){
			var n = id && query('[rowid="' + id + '"].gridxRowHeaderRow', this.bodyNode)[0];
			if(n){
				domConstruct.destroy(n);
			}
		},

		_onScroll: function(){
			this.bodyNode.scrollTop = this.grid.bodyNode.scrollTop;
		},

		_onResize: function(){
			for(var bn = this.grid.bodyNode.firstChild, n = this.bodyNode.firstChild;
				bn && n;
				bn = bn.nextSibling, n = n.nextSibling){
				n.firstChild.style.height = bn.firstChild.offsetHeight + 'px';
			}
		},

		_buildRows: function(start, count){
			var sb = [];
			for(var i = 0; i < count; ++i){
				sb.push('<div class="gridxRowHeaderRow" visualindex="', start + i,
					'"><table border="0" cellspacing="0" cellpadding="0" style="height: 24px;"><tr><td class="gridxRowHeaderCell" tabindex="-1"></td></tr></table></div>');
			}
			return sb.join('');
		},

		//Events
		_onHeaderMouseEvent: function(eventName, e){
			var g = this.grid,
				evtCell = 'onRowHeaderHeader' + eventName,
				evtRow = 'onHeader' + eventName;
			if(g._isConnected(evtCell)){
				g[evtCell](e);
			}
			if(g._isConnected(evtRow)){
				g[evtRow](e);
			}
		},

		_onBodyMouseEvent: function(eventName, e){
			var g = this.grid,
				evtCell = 'onRowHeaderCell' + eventName,
				evtRow = 'onRow' + eventName,
				cellConnected = g._isConnected(evtCell),
				rowConnected = g._isConnected(evtRow);
			if(cellConnected || rowConnected){
				this._decorateBodyEvent(e);
				if(e.rowIndex >= 0){
					if(e.isRowHeader && cellConnected){
						g[evtCell](e);
					}
					if(rowConnected){
						g[evtRow](e);
					}
				}
			}
		},

		_decorateBodyEvent: function(e){
			var node = e.target || e.originalTarget;
			while(node && node != this.bodyNode){
				if(domClass.contains(node, 'gridxRowHeaderCell')){
					e.isRowHeader = true;
				}else if(node.tagName.toLowerCase() === 'div' && domClass.contains(node, 'gridxRowHeaderRow')){
					e.rowId = node.getAttribute('rowid');
					e.parentId = node.getAttribute('parentid');
					e.rowIndex = parseInt(node.getAttribute('rowindex'), 10);
					e.visualIndex = parseInt(node.getAttribute('visualindex'), 10);
					return;
				}
				node = node.parentNode;
			}
		},

		_onRowMouseOver: function(e){
			var rowNode = query('[rowid="' + e.rowId + '"].gridxRowHeaderRow', this.bodyNode)[0];
			if(rowNode){
				domClass.toggle(rowNode, "gridxRowOver", e.type.toLowerCase() == 'mouseover');
			}
		},

		//Focus--------------------------------------------------------
		_initFocus: function(){
			var t = this,
				focus = t.grid.focus;
			if(focus){
				focus.registerArea({
					name: 'rowHeader',
					priority: 0.9,
					focusNode: t.bodyNode,
					scope: t,
					doFocus: t._doFocus,
					onFocus: t._onFocus,
					doBlur: t._blur,
					onBlur: t._blur,
					connects: [
						t.connect(t.bodyNode, 'onkeydown', '_onKeyDown')
					]
				});
			}
		},

		_doFocus: function(evt){
			if(this._focusRow(this.grid.body._focusCellRow)){
				util.stopEvent(evt);
				return true;
			}
		},

		_onFocus: function(evt){
			var t = this,
				node = evt.target;
			while(node != t.bodyNode){
				if(domClass.contains(node, 'gridxRowHeaderRow')){
					var r = t.grid.body._focusCellRow = parseInt(node.getAttribute('visualindex'), 10);
					t._focusRow(r);
					return true;
				}
				node = node.parentNode;
			}
		},

		_focusRow: function(visIndex){
			var t = this,
				node = query('[visualindex="' + visIndex + '"] .gridxRowHeaderCell', t.bodyNode)[0];
			t._blur();
			node = node || t.bodyNode.firstChild;
			if(node){
				domClass.add(node, 'gridxCellFocus');
				node.focus();
			}
			return node;
		},

		_blur: function(){
			query('.gridxCellFocus', this.bodyNode).forEach(function(node){
				domClass.remove(node, 'gridxCellFocus');
			});
			return true;
		},

		_onKeyDown: function(evt){
			var t = this, g = t.grid;
			if(g.focus.currentArea() == 'rowHeader' && 
					evt.keyCode == keys.UP_ARROW || evt.keyCode == keys.DOWN_ARROW){
				util.stopEvent(evt);
				var step = evt.keyCode == keys.UP_ARROW ? -1 : 1,
					body = g.body,
					r = body._focusCellRow + step;
				body._focusCellRow = r = r < 0 ? 0 : (r >= body.visualCount ? body.visualCount - 1 : r);
				g.vScroller.scrollToRow(r).then(function(){
					t._focusRow(r);
					t.onMoveToRowHeaderCell(r, evt);
				});
			}
		}
	}));
});
