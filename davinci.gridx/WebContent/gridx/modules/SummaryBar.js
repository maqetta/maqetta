define([
	"dojo/_base/declare",
	"dojo/dom-construct",
	"dojo/string",
	"../core/_Module",
	"dojo/i18n!../nls/SummaryBar"
], function(declare, domConstruct, string, _Module, nls){	
	
	return _Module.register(
	declare(/*===== "gridx.modules.SummaryBar", =====*/_Module, {
		name: 'summaryBar',

//        required: ['vLayout'],

		getAPIPath: function(){
			return {
				summaryBar: this
			};
		},

		preload: function(){
			var t = this, m = t.model;
			t.domNode = domConstruct.create('div', {'class': 'gridxSummaryBar'});
			t.grid.vLayout.register(t, 'domNode', 'footerNode', 5);
			t.connect(m, 'onSizeChange', '_update');
			t.connect(m, 'onMarked', '_update');
			t.connect(m, 'onMarkRemoved', '_update');
		},

		_update: function(){
			var t = this,
				g = t.grid,
				sr = g.select && g.select.row,
				size = t.model.size(),
				selected = sr ? sr.getSelected().length : 0,
				tpl = sr ? nls.summaryWithSelection : nls.summary;
			t.domNode.innerHTML = string.substitute(tpl, [size, selected]);
		}
	}));
});
