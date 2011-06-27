/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/form/_AutoCompleterMixin",["dojo/_base/kernel","..","dojo/string","dojo/regexp","dojo/data/util/filter","dojo/i18n!./nls/ComboBox","./DataList","dojo/_base/Deferred","dojo/_base/connect","dojo/_base/declare","dojo/_base/event","dojo/_base/html","dojo/_base/lang","dojo/_base/sniff","dojo/_base/window","dojo/query"],function(_1,_2){
_1.declare("dijit.form._AutoCompleterMixin",null,{item:null,pageSize:Infinity,store:null,fetchProperties:{},query:{},autoComplete:true,highlightMatch:"first",searchDelay:100,searchAttr:"name",labelAttr:"",labelType:"text",queryExpr:"${0}*",ignoreCase:true,maxHeight:-1,_stopClickEvents:false,_getCaretPos:function(_3){
var _4=0;
if(typeof (_3.selectionStart)=="number"){
_4=_3.selectionStart;
}else{
if(_1.isIE){
var tr=_1.doc.selection.createRange().duplicate();
var _5=_3.createTextRange();
tr.move("character",0);
_5.move("character",0);
try{
_5.setEndPoint("EndToEnd",tr);
_4=String(_5.text).replace(/\r/g,"").length;
}
catch(e){
}
}
}
return _4;
},_setCaretPos:function(_6,_7){
_7=parseInt(_7);
_2.selectInputText(_6,_7,_7);
},_setDisabledAttr:function(_8){
this.inherited(arguments);
this.domNode.setAttribute("aria-disabled",_8);
},_abortQuery:function(){
if(this.searchTimer){
clearTimeout(this.searchTimer);
this.searchTimer=null;
}
if(this._fetchHandle){
if(this._fetchHandle.cancel){
this._cancelingQuery=true;
this._fetchHandle.cancel();
this._cancelingQuery=false;
}
this._fetchHandle=null;
}
},_onInput:function(_9){
this.inherited(arguments);
if(_9.charOrCode==229){
this._onKey(_9);
}
},_onKey:function(_a){
var _b=_a.charOrCode;
if(_a.altKey||((_a.ctrlKey||_a.metaKey)&&(_b!="x"&&_b!="v"))||_b==_1.keys.SHIFT){
return;
}
var _c=false;
var pw=this.dropDown;
var dk=_1.keys;
var _d=null;
this._prev_key_backspace=false;
this._abortQuery();
this.inherited(arguments);
if(this._opened){
_d=pw.getHighlightedOption();
}
switch(_b){
case dk.PAGE_DOWN:
case dk.DOWN_ARROW:
case dk.PAGE_UP:
case dk.UP_ARROW:
if(this._opened){
this._announceOption(_d);
}
_1.stopEvent(_a);
break;
case dk.ENTER:
if(_d){
if(_d==pw.nextButton){
this._nextSearch(1);
_1.stopEvent(_a);
break;
}else{
if(_d==pw.previousButton){
this._nextSearch(-1);
_1.stopEvent(_a);
break;
}
}
}else{
this._setBlurValue();
this._setCaretPos(this.focusNode,this.focusNode.value.length);
}
if(this._opened||this._fetchHandle){
_a.preventDefault();
}
case dk.TAB:
var _e=this.get("displayedValue");
if(pw&&(_e==pw._messages["previousMessage"]||_e==pw._messages["nextMessage"])){
break;
}
if(_d){
this._selectOption(_d);
}
case dk.ESCAPE:
if(this._opened){
this._lastQuery=null;
this.closeDropDown();
}
break;
case " ":
if(_d){
_1.stopEvent(_a);
this._selectOption(_d);
this.closeDropDown();
}else{
_c=true;
}
break;
case dk.DELETE:
case dk.BACKSPACE:
this._prev_key_backspace=true;
_c=true;
break;
default:
_c=typeof _b=="string"||_b==229;
}
if(_c){
this.item=undefined;
this.searchTimer=setTimeout(_1.hitch(this,"_startSearchFromInput"),1);
}
},_autoCompleteText:function(_f){
var fn=this.focusNode;
_2.selectInputText(fn,fn.value.length);
var _10=this.ignoreCase?"toLowerCase":"substr";
if(_f[_10](0).indexOf(this.focusNode.value[_10](0))==0){
var _11=this.autoComplete?this._getCaretPos(fn):fn.value.length;
if((_11+1)>fn.value.length){
fn.value=_f;
_2.selectInputText(fn,_11);
}
}else{
fn.value=_f;
_2.selectInputText(fn);
}
},_openResultList:function(_12,_13,_14){
this._fetchHandle=null;
if(this.disabled||this.readOnly||(_13[this.searchAttr]!==this._lastQuery)){
return;
}
var _15=this.dropDown.getHighlightedOption();
this.dropDown.clearResultList();
if(!_12.length&&_14.start==0){
this.closeDropDown();
return;
}
var _16=this.dropDown.createOptions(_12,_14,_1.hitch(this,"_getMenuLabelFromItem"));
this._showResultList();
if(_14.direction){
if(1==_14.direction){
this.dropDown.highlightFirstOption();
}else{
if(-1==_14.direction){
this.dropDown.highlightLastOption();
}
}
if(_15){
this._announceOption(this.dropDown.getHighlightedOption());
}
}else{
if(this.autoComplete&&!this._prev_key_backspace&&!/^[*]+$/.test(_13[this.searchAttr].toString())){
this._announceOption(_16[1]);
}
}
},_showResultList:function(){
this.closeDropDown(true);
this.openDropDown();
this.domNode.setAttribute("aria-expanded","true");
},loadDropDown:function(_17){
this._startSearchAll();
},isLoaded:function(){
return false;
},closeDropDown:function(){
this._abortQuery();
if(this._opened){
this.inherited(arguments);
this.domNode.setAttribute("aria-expanded","false");
this.focusNode.removeAttribute("aria-activedescendant");
}
},_setBlurValue:function(){
var _18=this.get("displayedValue");
var pw=this.dropDown;
if(pw&&(_18==pw._messages["previousMessage"]||_18==pw._messages["nextMessage"])){
this._setValueAttr(this._lastValueReported,true);
}else{
if(typeof this.item=="undefined"){
this.item=null;
this.set("displayedValue",_18);
}else{
if(this.value!=this._lastValueReported){
this._handleOnChange(this.value,true);
}
this._refreshState();
}
}
},_setItemAttr:function(_19,_1a,_1b){
var _1c="";
if(_19){
if(!_1b){
_1b=this.store._oldAPI?this.store.getValue(_19,this.searchAttr):_19[this.searchAttr];
}
_1c=this._getValueField()!=this.searchAttr?this.store.getIdentity(_19):_1b;
}
this.set("value",_1c,_1a,_1b,_19);
},_announceOption:function(_1d){
if(!_1d){
return;
}
var _1e;
if(_1d==this.dropDown.nextButton||_1d==this.dropDown.previousButton){
_1e=_1d.innerHTML;
this.item=undefined;
this.value="";
}else{
_1e=(this.store._oldAPI?this.store.getValue(_1d.item,this.searchAttr):_1d.item[this.searchAttr]).toString();
this.set("item",_1d.item,false,_1e);
}
this.focusNode.value=this.focusNode.value.substring(0,this._lastInput.length);
this.focusNode.setAttribute("aria-activedescendant",_1.attr(_1d,"id"));
this._autoCompleteText(_1e);
},_selectOption:function(_1f){
this.closeDropDown();
if(_1f){
this._announceOption(_1f);
}
this._setCaretPos(this.focusNode,this.focusNode.value.length);
this._handleOnChange(this.value,true);
},_startSearchAll:function(){
this._startSearch("");
},_startSearchFromInput:function(){
this._startSearch(this.focusNode.value.replace(/([\\\*\?])/g,"\\$1"));
},_getQueryString:function(_20){
return _1.string.substitute(this.queryExpr,[_20]);
},_startSearch:function(key){
if(!this.dropDown){
var _21=this.id+"_popup",_22=_1.getObject(this.dropDownClass,false);
this.dropDown=new _22({onChange:_1.hitch(this,this._selectOption),id:_21,dir:this.dir,textDir:this.textDir});
this.focusNode.removeAttribute("aria-activedescendant");
this.textbox.setAttribute("aria-owns",_21);
}
this._lastInput=key;
var _23=_1.clone(this.query);
var _24={start:0,count:this.pageSize,ignoreCase:this.ignoreCase,deep:true};
_1.mixin(_24,this.fetchProperties);
var qs=this._getQueryString(key),q=_1.data.util.filter.patternToRegExp(qs,this.ignoreCase);
q.toString=function(){
return qs;
};
this._lastQuery=_23[this.searchAttr]=q;
var _25=this,_26=function(){
var _27=_25._fetchHandle=_25.store.query(_23,_24);
_1.when(_27,function(res){
_25._fetchHandle=null;
res.total=_27.total;
_25._openResultList(res,_23,_24);
},function(err){
_25._fetchHandle=null;
if(!_25._cancelingQuery){
console.error(_25.declaredClass+" "+err.toString());
_25.closeDropDown();
}
});
};
this.searchTimer=setTimeout(_1.hitch(this,function(_28,_29){
this.searchTimer=null;
_26();
this._nextSearch=this.dropDown.onPage=function(_2a){
_24.start+=_24.count*_2a;
_24.direction=_2a;
_26();
_29.focus();
};
},_23,this),this.searchDelay);
},_getValueField:function(){
return this.searchAttr;
},constructor:function(){
this.query={};
this.fetchProperties={};
},postMixInProperties:function(){
if(!this.store){
var _2b=this.srcNodeRef;
var _2c=this.list;
if(_2c){
this.store=_2.byId(_2c);
}else{
this.store=new _2.form.DataList({},_2b);
}
if(!("value" in this.params)){
var _2d=(this.item=this.store.fetchSelectedItem());
if(_2d){
var _2e=this._getValueField();
this.value=this.store._oldAPI?this.store.getValue(_2d,_2e):_2d[_2e];
}
}
}
this.inherited(arguments);
},postCreate:function(){
var _2f=_1.query("label[for=\""+this.id+"\"]");
if(_2f.length){
_2f[0].id=(this.id+"_label");
this.domNode.setAttribute("aria-labelledby",_2f[0].id);
}
this.inherited(arguments);
},_getMenuLabelFromItem:function(_30){
var _31=this.labelFunc(_30,this.store),_32=this.labelType;
if(this.highlightMatch!="none"&&this.labelType=="text"&&this._lastInput){
_31=this.doHighlight(_31,this._escapeHtml(this._lastInput));
_32="html";
}
return {html:_32=="html",label:_31};
},doHighlight:function(_33,_34){
var _35=(this.ignoreCase?"i":"")+(this.highlightMatch=="all"?"g":""),i=this.queryExpr.indexOf("${0}");
_34=_1.regexp.escapeString(_34);
return this._escapeHtml(_33).replace(new RegExp((i==0?"^":"")+"("+_34+")"+(i==(this.queryExpr.length-4)?"$":""),_35),"<span class=\"dijitComboBoxHighlightMatch\">$1</span>");
},_escapeHtml:function(str){
str=String(str).replace(/&/gm,"&amp;").replace(/</gm,"&lt;").replace(/>/gm,"&gt;").replace(/"/gm,"&quot;");
return str;
},reset:function(){
this.item=null;
this.inherited(arguments);
},labelFunc:function(_36,_37){
return (_37._oldAPI?_37.getValue(_36,this.labelAttr||this.searchAttr):_36[this.labelAttr||this.searchAttr]).toString();
},_setValueAttr:function(_38,_39,_3a,_3b){
this._set("item",_3b||null);
if(!_38){
_38="";
}
this.inherited(arguments);
},_setTextDirAttr:function(_3c){
this.inherited(arguments);
if(this.dropDown){
this.dropDown._set("textDir",_3c);
}
}});
return _2.form._AutoCompleterMixin;
});
