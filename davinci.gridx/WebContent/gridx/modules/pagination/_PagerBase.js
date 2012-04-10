define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/query",
	"dojo/string",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dojo/i18n!../../nls/PaginationBar"
], function(declare, lang, query, string, _WidgetBase, _TemplatedMixin, nls){

	return declare([_WidgetBase, _TemplatedMixin], {
		pagination: null,
	
		module: null,
		
		position: 'bottom',

		focusPriority: 0,

		constructor: function(){
			this._nls = nls;
			lang.mixin(this, nls);
		},

		postCreate: function(){
			var t = this,
				c = 'connect',
				p = t.pagination,
				m = t.module.model;
			t[c](p, 'onSwitchPage', '_onSwitchPage');
			t[c](p, 'onChangePageSize', '_onChangePageSize');
			t[c](m, 'onSizeChange', '_onSizeChange');
			t[c](m, 'onMarked', '_createDescription');
			t[c](m, 'onMarkRemoved', '_createDescription');
			t._initFocus();
			t.refresh();
		},

		_toggleNode: function(cls, toShow){
			query('.' + cls, this.domNode)[0].style.display = toShow ? '' : 'none';
			return toShow;
		},

		_createDescription: function(){
			var t = this, mod = t.module;
			if(t._toggleNode('gridxPagerDescription', mod._exist(t.position, 'description'))){
				var g = mod.grid,
					selectRow = g.select && g.select.row,
					selected = selectRow ? selectRow.getSelected().length : 0, 
					tpl = selectRow ? mod.arg('descriptionSelectionTemplate', nls.summaryWithSelection) : 
						mod.arg('descriptionTemplate', nls.summary);
				t._descContainer.innerHTML = string.substitute(tpl, [g.model.size(), selected]);
			}
		}
	});
});
