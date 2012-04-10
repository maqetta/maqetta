define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/keys",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dojo/text!../../templates/GotoPagePane.html"
], function(declare, lang, keys, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, goToTemplate){

	return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
		templateString: goToTemplate,
	
		pager: null,

		postMixInProperties: function(){
			var t = this,
				p = t.pager,
				mod = p.module;
			lang.mixin(t, p._nls);
			t.numberTextBoxClass = mod.arg('numberTextBoxClass').prototype.declaredClass;
			t.buttonClass = mod.arg('buttonClass').prototype.declaredClass;
			t.connect(t.domNode, 'onkeydown', '_onKeyDown');
		},
	
		postCreate: function(){
			this._updateStatus();
		},
	
		_updateStatus: function(){
			var b = this.pageInputBox;
			this.okBtn.set('disabled', !b.isValid() || b.get('displayedValue') === "");
		},
	
		_onOK: function(){
			var p = this.pager;
			p.pagination.gotoPage(this.pageInputBox.get('value') - 1);
			p._gotoDialog.hide();
		},
	
		_onCancel: function(){
			this.pager._gotoDialog.hide();
		},
		
		_onKeyDown: function(evt){
			if(!this.okBtn.get('disabled') && keys.ENTER == evt.keyCode){
				this._onOK();
			}
		}
	});
});
