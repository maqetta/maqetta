/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/grid/enhanced/plugins/filter/FilterStatusTip",["dojo","dijit","dojox","dojo/string","dojo/date/locale","dijit/TooltipDialog","dijit/_base/popup","dijit/form/Button","dojo/i18n!../../nls/Filter"],function(_1,_2,_3){
var _4="",_5="",_6="",_7="",_8="dojoxGridFStatusTipOddRow",_9="dojoxGridFStatusTipHandle",_a="dojoxGridFStatusTipCondition",_b="dojoxGridFStatusTipDelRuleBtnIcon",_c="</tbody></table>";
_1.declare("dojox.grid.enhanced.plugins.filter.FilterStatusTip",null,{constructor:function(_d){
var _e=this.plugin=_d.plugin;
this._statusHeader=["<table border='0' cellspacing='0' class='",_4,"'><thead><tr class='",_5,"'><th class='",_6,"'><div>",_e.nls["statusTipHeaderColumn"],"</div></th><th class='",_6," lastColumn'><div>",_e.nls["statusTipHeaderCondition"],"</div></th></tr></thead><tbody>"].join("");
this._removedCriterias=[];
this._rules=[];
this.statusPane=new _3.grid.enhanced.plugins.filter.FilterStatusPane();
this._dlg=new _2.TooltipDialog({"class":"dojoxGridFStatusTipDialog",content:this.statusPane,autofocus:false,onMouseLeave:_1.hitch(this,function(){
this.closeDialog();
})});
this._dlg.connect(this._dlg.domNode,"click",_1.hitch(this,this._modifyFilter));
},destroy:function(){
this._dlg.destroyRecursive();
},showDialog:function(_f,_10,_11){
this._pos={x:_f,y:_10};
_2.popup.close(this._dlg);
this._removedCriterias=[];
this._rules=[];
this._updateStatus(_11);
_2.popup.open({popup:this._dlg,parent:this.plugin.filterBar,x:_f-12,y:_10-3});
},closeDialog:function(){
_2.popup.close(this._dlg);
if(this._removedCriterias.length){
this.plugin.filterDefDialog.removeCriteriaBoxes(this._removedCriterias);
this._removedCriterias=[];
this.plugin.filterDefDialog.onFilter();
}
},_updateStatus:function(_12){
var res,p=this.plugin,nls=p.nls,sp=this.statusPane,fdg=p.filterDefDialog;
if(fdg.getCriteria()===0){
sp.statusTitle.innerHTML=nls["statusTipTitleNoFilter"];
sp.statusRel.innerHTML=sp.statusRelPre.innerHTML=sp.statusRelPost.innerHTML="";
var _13=p.grid.layout.cells[_12];
var _14=_13?"'"+(_13.name||_13.field)+"'":nls["anycolumn"];
res=_1.string.substitute(nls["statusTipMsg"],[_14]);
}else{
sp.statusTitle.innerHTML=nls["statusTipTitleHasFilter"];
sp.statusRelPre.innerHTML=nls["statusTipRelPre"]+"&nbsp;";
sp.statusRelPost.innerHTML="&nbsp;"+nls["statusTipRelPost"];
sp.statusRel.innerHTML=fdg._relOpCls=="logicall"?nls["all"]:nls["any"];
this._rules=[];
var i=0,c=fdg.getCriteria(i++);
while(c){
c.index=i-1;
this._rules.push(c);
c=fdg.getCriteria(i++);
}
res=this._createStatusDetail();
}
sp.statusDetailNode.innerHTML=res;
this._addButtonForRules();
},_createStatusDetail:function(){
return this._statusHeader+_1.map(this._rules,function(_15,i){
return this._getCriteriaStr(_15,i);
},this).join("")+_c;
},_addButtonForRules:function(){
if(this._rules.length>1){
_1.query("."+_9,this.statusPane.statusDetailNode).forEach(_1.hitch(this,function(nd,idx){
(new _2.form.Button({label:this.plugin.nls["removeRuleButton"],showLabel:false,iconClass:_b,onClick:_1.hitch(this,function(e){
e.stopPropagation();
this._removedCriterias.push(this._rules[idx].index);
this._rules.splice(idx,1);
this.statusPane.statusDetailNode.innerHTML=this._createStatusDetail();
this._addButtonForRules();
})})).placeAt(nd,"last");
}));
}
},_getCriteriaStr:function(c,_16){
var res=["<tr class='",_7," ",(_16%2?_8:""),"'><td class='",_6,"'>",c.colTxt,"</td><td class='",_6,"'><div class='",_9,"'><span class='",_a,"'>",c.condTxt,"&nbsp;</span>",c.formattedVal,"</div></td></tr>"];
return res.join("");
},_modifyFilter:function(){
this.closeDialog();
var p=this.plugin;
p.filterDefDialog.showDialog(p.filterBar.getColumnIdx(this._pos.x));
}});
_1.declare("dojox.grid.enhanced.plugins.filter.FilterStatusPane",[_2._Widget,_2._TemplatedMixin],{templateString:_1.cache("dojox.grid","enhanced/templates/FilterStatusPane.html")});
return _3.grid.enhanced.plugins.filter.FilterStatusTip;
});
