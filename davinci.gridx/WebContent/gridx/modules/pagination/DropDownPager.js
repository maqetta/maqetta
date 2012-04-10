define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/store/Memory",
	"./_PagerBase",
	'../../util',
	"dojo/text!../../templates/PaginationBarDD.html"
], function(declare, lang, Store, _PagerBase, util, barTemplate){

	return declare(_PagerBase, {
		templateString: barTemplate,
	
		refresh: function(){
			this._createDescription();
			this._createPageStepper();
			this._createPageSizeSwitch();
		},
	
		_onSwitchPage: function(page){
			this._pageStepperSelect.set('value', page + 1);
		},

		_onChangePageSize: function(){
			this._createPageStepper();
		},

		_onSizeChange: function(){
			this._createDescription();
			this._createPageStepper();
		},
	
		_createPageStepper: function(){
			var t = this, mod = t.module;
			if(t._toggleNode('gridxPagerStepper', mod._exist(t.position, 'stepper'))){
				var items = [],
					selectedItem,
					p = t.pagination,
					pageCount = p.pageCount(),
					currentPage = p.currentPage(),
					stepper = t._pageStepperSelect,
					i, v, item;
				for(i = 0; i < pageCount; ++i){
					v = i + 1;
					item = {
						id: v,
						label: v,
						value: v
					};
					items.push(item);
					if(currentPage == i){
						selectedItem = item;
					}
				}
				var store = new Store({data: items});
				if(!stepper){
					var cls = mod.arg('stepperClass'),
						props = lang.mixin({
							store: store,
							searchAttr: 'label',
							item: selectedItem,
							'class': 'gridxPagerStepperWidget',
							onChange: function(page){
								p.gotoPage(page - 1);
							}
						}, mod.arg('stepperProps') || {});
					stepper = t._pageStepperSelect = new cls(props);
					stepper.placeAt(t._pageStepperContainer, "last");
					stepper.startup();
				}else{
					stepper.set('store', store);
					stepper.set('value', currentPage + 1);
				}
				stepper.set('disabled', pageCount <= 1);
			}
		},
	
		_createPageSizeSwitch: function(){
			var t = this, mod = t.module;
			if(t._toggleNode('gridxPagerSizeSwitch', mod._exist(t.position, 'sizeSwitch'))){
				var options = [],
					p = t.pagination,
					currentSize = p.pageSize(), 
					nlsAll = mod.arg('pageSizeAllText', t.pageSizeAll),
					sizeSwitch = t._sizeSwitchSelect,
					sizes = mod.arg('sizes');
				for(var i = 0, len = sizes.length; i < len; ++i){
					var pageSize = sizes[i],
						isAll = !(pageSize > 0);
					options.push({
						label: isAll ? nlsAll : pageSize,
						value: isAll ? -1 : pageSize,
						selected: currentSize == pageSize || (isAll && p.isAll())
					});
				}
				if(!sizeSwitch){
					var cls = mod.arg('sizeSwitchClass'),
						props = lang.mixin({
							options: options,
							'class': 'gridxPagerSizeSwitchWidget',
							onChange: function(ps){
								p.setPageSize(ps < 0 ? 0 : ps);
							}
						}, mod.arg('sizeSwitchProps') || {});
					sizeSwitch = t._sizeSwitchSelect = new cls(props);
					sizeSwitch.placeAt(t._sizeSwitchContainer, "last");
					sizeSwitch.startup();
				}else{
					sizeSwitch.removeOption(sizeSwitch.getOptions());
					sizeSwitch.addOption(options);
				}
			}
		},
	
		_initFocus: function(){
			var t = this,
				g = t.module.grid,
				focus = g.focus,
				pos = t.position,
				fp = t.focusPriority;
			if(focus){
				focus.registerArea({
					name: pos + 'PageStepper',
					priority: fp,
					focusNode: t._pageStepperContainer,
					doFocus: function(evt){
						util.stopEvent(evt);
						t._pageStepperSelect.focus();
						return true;
					}
				});
				focus.registerArea({
					name: pos + 'PageSizeSwitch',
					priority: fp + 0.001,
					focusNode: t._sizeSwitchContainer,
					doFocus: function(evt){
						util.stopEvent(evt);
						t._sizeSwitchSelect.focus();
						return true;
					}
				});
			}
		}
	});
});
