define([
	"dojo/_base/kernel",
	"dojo/_base/declare",
	'dijit/Toolbar',
	"../core/_Module"
], function(kernel, declare, Toolbar, _Module){
	return _Module.register(
	declare(/*===== "gridx.modules.ToolBar", =====*/_Module, {
		name: 'toolBar',

//        required: ['vLayout'],
		
		getAPIPath: function(){
			return {
				toolBar: this
			};
		},

		constructor: function(grid, args){
			kernel.experimental('gridx/modules/ToolBar');
			//Arguments for the dijit.Toolbar widget MUST be provided as module args, instead of grid args.
			this.widget = new Toolbar(args);
			this.domNode = this.widget.domNode;
		},

		preload: function(){
			var t = this,
				w = t.widget,
				vLayout = t.grid.vLayout;
			vLayout.register(t, 'domNode', 'headerNode', -10);
			t.batchConnect(
				[w, 'addChild', 'reLayout', vLayout],
				[w, 'removeChild', 'reLayout', vLayout]
			);
			t._initFocus();
		},

		//Focus-----------------------------------------------
		_initFocus: function(){
			var t = this,
				focus = t.grid.focus;
			if(focus){
				focus.registerArea({
					name: t.name,
					priority: -1,
					focusNode: t.domNode,
					scope: t,
					doFocus: t._doFocus
				});
			}
		},

		_doFocus: function(evt){
			var children = this.widget.getChildren();
			if(children[0]){
				children[0].focus();
			}
			return children.length;
		}
	}));
});

