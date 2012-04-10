define([
	"dojo/_base/declare",
	"dojo/dom-construct",
	"../core/_Module"
], function(declare, domConstruct, _Module){
	
	return _Module.register(
	declare(/*===== "gridx.modules.TitleBar", =====*/_Module, {
		name: 'titleBar',
		
//        required: ['vLayout'],
		
		getAPIPath: function(){
			return {
				titleBar: this
			};
		},

		constructor: function(){
			this.domNode = domConstruct.create('div', {
				'class': 'gridxTitleBar',
				innerHTML: this.arg('label')
			});
		},

		preload: function(){
			this.grid.vLayout.register(this, 'domNode', 'headerNode', -15);
		},
		
		destroy: function(){
			this.inherited(arguments);
			domConstruct.destroy(this.domNode);
		},
		
		label: '',
		
		setLabel: function(label){
			this.domNode.innerHTML = this.label = label;
		}
	}));
});

