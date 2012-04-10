define([
	"dojo/_base/declare",
	"dojo/_base/array",
	"../../core/_Module"
], function(declare, array, _Module){

	return declare(/*===== "gridx.modules.pagination._PaginationBarBase", =====*/_Module, {
		name: 'paginationBar',	
	
		required: ['vLayout'],

		forced: ['pagination'],
		
		getAPIPath: function(){
			return {
				paginationBar: this
			};
		},
		
		preload: function(){
			var t = this,
				g = t.grid,
				vLayout = g.vLayout,
				p = g.pagination;
			t._pagers = [];
			//Register UI before startup
			if(t._exist('top')){
				vLayout.register(t, '_topPagerNode', 'headerNode', -5);
			}
			if(t._exist('bottom')){
				vLayout.register(t, '_bottomPagerNode', 'footerNode', 5);
			}
			if(!p.arg('initialPageSize')){
				p.initialPageSize = t.arg('sizes')[0];
			}
		},

		load: function(args, startup){
			var t = this;
			startup.then(function(){
				t._init();
				t.loaded.callback();
			});
		},
		
		destroy: function(){
			this.inherited(arguments);
			array.forEach(this._pagers, function(pager){
				pager.destroyRecursive();
			});
		},
		
		//Public-------------------------------------------------------

		// sizeSwitch: Boolean|String
		//		Whether (and where) to show "size switch" part of the pagination bar UI.
		//		Can be true/false, or "bottom", or "top"
		sizes: [10, 25, 50, 100, 0],

		// position: String
		//		The position of the pagination bar, can be "bottom" (default), "top" or "both" (any other value means "both")
		position: 'bottom',

		sizeSwitch: true,

		// stepper: Boolean|String
		//		Whether (and where) to show "page stepper" part of the pagination bar UI.
		//		Can be true/false, or "bottom", or "top"
		stepper: true,

		// description: Boolean|String
		//		Whether (and where) to show "description" part of the pagination bar UI.
		//		Can be true/false, or "bottom", or "top"
		description: true,
	
		refresh: function(){
			// summary:
			//		Refresh the pagination bar UI
			array.forEach(this._pagers, function(pager){
				pager.refresh();
			});
			this.grid.vLayout.reLayout();
		},
	
		//Private---------------------------------------------------------------------------------
		//pagerClass: null,

		_exist: function(pos, argName){
			var v = this.arg(argName || 'position');
			v = v && String(v).toLowerCase();
			return v && ((v != 'top' && v != 'bottom') || v == pos);
		},

		_init: function(){
			var t = this;
			array.forEach(['top', 'bottom'], function(pos){
				if(t._exist(pos)){
					var cls = t.arg('pagerClass'),
						pager = new cls({
							pagination: t.grid.pagination,
							module: t,
							position: pos,
							focusPriority: {
								top: -5,
								bottom: 5
							}[pos]
						});
					t._pagers.push(pager);
					t['_' + pos + 'PagerNode'] = pager.domNode;
				}
			});
		}
	});	
});
