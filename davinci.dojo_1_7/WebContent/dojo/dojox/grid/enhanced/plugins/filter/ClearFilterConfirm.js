/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/grid/enhanced/plugins/filter/ClearFilterConfirm",["dojo","dijit","dojox","dijit/form/Button","dijit/_WidgetsInTemplateMixin"],function(_1,_2,_3){
_1.declare("dojox.grid.enhanced.plugins.filter.ClearFilterConfirm",[_2._Widget,_2._TemplatedMixin,_2._WidgetsInTemplateMixin],{templateString:_1.cache("dojox.grid","enhanced/templates/ClearFilterConfirmPane.html"),widgetsInTemplate:true,plugin:null,postMixInProperties:function(){
var _4=this.plugin.nls;
this._clearBtnLabel=_4["clearButton"];
this._cancelBtnLabel=_4["cancelButton"];
this._clearFilterMsg=_4["clearFilterMsg"];
},postCreate:function(){
this.inherited(arguments);
this.cancelBtn.domNode.setAttribute("aria-label",this.plugin.nls["waiCancelButton"]);
this.clearBtn.domNode.setAttribute("aria-label",this.plugin.nls["waiClearButton"]);
},uninitialize:function(){
this.plugin=null;
},_onCancel:function(){
this.plugin.clearFilterDialog.hide();
},_onClear:function(){
this.plugin.clearFilterDialog.hide();
this.plugin.filterDefDialog.clearFilter(this.plugin.filterDefDialog._clearWithoutRefresh);
}});
return _3.grid.enhanced.plugins.filter.ClearFilterConfirm;
});
