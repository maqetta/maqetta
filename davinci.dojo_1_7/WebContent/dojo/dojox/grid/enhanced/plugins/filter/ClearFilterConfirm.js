define(["dojo", "dijit", "dojox", "dijit/form/Button", "dijit/_WidgetsInTemplateMixin"], function(dojo, dijit, dojox){

dojo.declare("dojox.grid.enhanced.plugins.filter.ClearFilterConfirm",[dijit._Widget, dijit._TemplatedMixin, dijit._WidgetsInTemplateMixin], {
	// summary:
	//		The UI for user to confirm the operation of clearing filter.
	templateString: dojo.cache("dojox.grid", "enhanced/templates/ClearFilterConfirmPane.html"),
	widgetsInTemplate: true,
	plugin: null,
	postMixInProperties: function(){
		var nls = this.plugin.nls;
		this._clearBtnLabel = nls["clearButton"];
		this._cancelBtnLabel = nls["cancelButton"];
		this._clearFilterMsg = nls["clearFilterMsg"];
	},
	postCreate: function(){
		this.inherited(arguments);
		dijit.setWaiState(this.cancelBtn.domNode, "label", this.plugin.nls["waiCancelButton"]);
		dijit.setWaiState(this.clearBtn.domNode, "label", this.plugin.nls["waiClearButton"]);
	},
	uninitialize: function(){
		this.plugin = null;
	},
	_onCancel: function(){
		this.plugin.clearFilterDialog.hide();
	},
	_onClear: function(){
		this.plugin.clearFilterDialog.hide();
		this.plugin.filterDefDialog.clearFilter(this.plugin.filterDefDialog._clearWithoutRefresh);
	}
});

return dojox.grid.enhanced.plugins.filter.ClearFilterConfirm;

});