define([
	"dojo/_base/declare",
	"dojo/_base/connect",
	"../core/_Module",
	"dojo/dom-class",
	"dojo/keys",
	"dojo/_base/event",
	"dojo/_base/lang",
	"dijit/registry",
	"dijit/Menu"
], function(declare, connect, _Module, domClass, keys, event, lang, registry, Menu){

/*=====
	var _MenuArgs = function(){
		//hookPoint: String?
		//		Indicates from where the menu should occur.
		//		One of "cell", "headercell", "row", "header", "body", "grid". If invalid, default to "grid".
		//selected: Boolean?
		//		Indicates whether to bind this menu only to the selected items. Default is false.
	};

	var _MenuContext = function(){
		//grid: Grid
		//		This grid that triggers this menu.
		//column: Column
		//		The column that triggers this menu. Only valid for "headercell" hookpoint.
		//row: Row
		//		The row that triggers this menu. Only valid for "row" hookpoint.
		//cell: Cell
		//		The cell that triggers this menu. Only valid for "cell" hookpoint.
	};
=====*/

	return _Module.register(
	declare(/*===== "gridx.modules.Menu", =====*/_Module, {
		name: 'menu',

		getAPIPath: function(){
			return {
				menu: this 
			};
		},
	
		constructor: function(){
			this._menus = {};
		},

		//Public---------------------------------------------

		//context: __MenuContext
		//		An object representing the current context when user triggers a context menu.
		//		This property is updated everytime a menu of grid is popped up.
		//		Users can refer to this in their menu action handlers by grid.menu.context.
		context: null,

		bind: function(/* dijit.Menu|ID */ menu, /* __MenuArgs? */ args){
			//summary:
			//		Bind a memu to grid, according to the provided args
			//menu: dijit.Menu | ID
			//		The menu to be binded.
			//args: __MenuArgs
			//		Indicates how to bind the menu
			args = args || {};
			var t = this,
				g = t.grid,
				hookPoint = args.hookPoint && args.hookPoint.toLowerCase() || 'grid',
				type = args.selected ? hookPoint + '-selected' : hookPoint,
				evtName = t._evtMap[hookPoint],
				m = t._menus[type] = t._menus[type] || {},
				showMenu = lang.partial(t._showMenu, type);
			connect.disconnect(m.open);
			connect.disconnect(m.close);
			m.menu = registry.byId(menu);
			if(evtName){
				m.open = t.connect(g, evtName, showMenu);
			}else if(hookPoint == 'body'){
				m.open = t.connect(g.bodyNode, 'oncontextmenu', showMenu);
			}else{
				m.open = t.connect(g.domNode, 'oncontextmenu', showMenu);
			}
			m.close = t.connect(m.menu, 'onClose', function(){
				t._mutex = 0;
			});
		},

		unbind: function(menu){
			//summary:
			//		Unbind a menu from grid.
			//menu: dijit.Menu | ID
			//		The menu to be unbinded.
			var type, menus = this._menus, m;
			menu = registry.byId(menu);
			for(type in menus){
				m = menus[type];
				if(m.menu == menu){
					connect.disconnect(m.open);
					connect.disconnect(m.close);
					delete menus[type];
					return;
				}
			}
		},
		
		//[private]==
		_evtMap: {
			header: 'onHeaderContextMenu',
			headercell: 'onHeaderCellContextMenu',
			cell: 'onCellContextMenu',
			row: 'onRowContextMenu'
		},

		_showMenu: function(type, e){
			var t = this, menus = t._menus;
			if(!t._mutex && menus[type].menu){
				var g = t.grid,
					rid = e.rowId,
					cid = e.columnId,
					isRow = !type.indexOf('row'),
					isCell = !type.indexOf('cell'),
					isHeaderCell = !type.indexOf('headercell'),
					isSelectedType = type.indexOf('-') > 0,
					selected = !!((isCell && domClass.contains(e.cellNode, "gridxCellSelected")) ||
						(isHeaderCell && domClass.contains(g.header.getHeaderNode(cid), "gridxColumnSelected")) ||
						(isRow && domClass.contains(g.body.getRowNode({rowId: rid}), "gridxRowSelected")));
				if(isSelectedType == selected || (!isSelectedType && selected && !menus[type + '-selected'])){
					t.context = {
						grid: g,
						column: isHeaderCell && g.column(cid, 1),
						row: isRow && g.row(rid, 1),
						cell: isCell && g.cell(rid, cid, 1)
					};
					event.stop(e);
					t._mutex = 1;
					menus[type].menu._openMyself({
						target: e.target, 
						coords: e.keyCode != keys.F10 && "pageX" in e ? {x: e.pageX, y: e.pageY} : null
					});
				}
			}
		}
	}));
});
