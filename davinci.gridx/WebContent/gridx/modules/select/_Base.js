define([
	'dojo/_base/declare',
	'dojo/_base/connect',
	'../../core/_Module'
], function(declare, connect, _Module){

	return declare(_Module, {
		getAPIPath: function(){
			var path = {
				select: {}
			};
			path.select[this._type] = this;
			return path;
		},

		preload: function(){
			var t = this, g = t.grid;
			t.subscribe('gridClearSelection_' + g.id, function(type){
				if(type != t._type){
					t.clear();
				}
			});
			t.connect(g.body, 'onRender', '_onRender');
			t._init();
		},

		//Public--------------------------------------------------------------------
		enabled: true,
	
		multiple: true,
	
		holdingCtrl: false,

		//Events----------------------------------------------------------------------
		onSelected: function(/* rowObject */){},
		onDeselected: function(/* rowObject */){},
		onHighlightChange: function(){},

		//Private---------------------------------------------------------------------
		
		_getMarkType: function(){},

		_select: function(item, extending){
			var t = this, toSelect = 1;
			if(t.arg('enabled')){
				if(t.arg('multiple') && (extending || t.arg('holdingCtrl'))){
					toSelect = !t.isSelected(item);
				}else{
					t.clear();
				}
				connect.publish('gridClearSelection_' + t.grid.id, [t._type]);
				t._markById(item, toSelect);
			}
		}
	});
});
