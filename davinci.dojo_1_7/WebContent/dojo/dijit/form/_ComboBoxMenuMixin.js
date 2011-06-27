/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/form/_ComboBoxMenuMixin",["dojo/_base/kernel","..","dojo/_base/array","dojo/_base/html","dojo/_base/window","dojo/i18n"],function(_1,_2){
_1.declare("dijit.form._ComboBoxMenuMixin",null,{_messages:null,postMixInProperties:function(){
this.inherited(arguments);
this._messages=_1.i18n.getLocalization("dijit.form","ComboBox",this.lang);
},buildRendering:function(){
this.inherited(arguments);
this.previousButton.innerHTML=this._messages["previousMessage"];
this.nextButton.innerHTML=this._messages["nextMessage"];
},_setValueAttr:function(_3){
this.value=_3;
this.onChange(_3);
},onClick:function(_4){
if(_4==this.previousButton){
this._setSelectedAttr(null);
this.onPage(-1);
}else{
if(_4==this.nextButton){
this._setSelectedAttr(null);
this.onPage(1);
}else{
this.onChange(_4);
}
}
},onChange:function(_5){
},onPage:function(_6){
},onClose:function(){
this._setSelectedAttr(null);
},_createOption:function(_7,_8){
var _9=this._createMenuItem();
var _a=_8(_7);
if(_a.html){
_9.innerHTML=_a.label;
}else{
_9.appendChild(_1.doc.createTextNode(_a.label));
}
if(_9.innerHTML==""){
_9.innerHTML="&nbsp;";
}
this.applyTextDir(_9,(_9.innerText||_9.textContent||""));
_9.item=_7;
return _9;
},createOptions:function(_b,_c,_d){
this.previousButton.style.display=(_c.start==0)?"none":"";
_1.attr(this.previousButton,"id",this.id+"_prev");
_1.forEach(_b,function(_e,i){
var _f=this._createOption(_e,_d);
_1.attr(_f,"id",this.id+i);
this.nextButton.parentNode.insertBefore(_f,this.nextButton);
},this);
var _10=false;
if(_b.total&&!_b.total.then&&_b.total!=-1){
if((_c.start+_c.count)<_b.total){
_10=true;
}else{
if((_c.start+_c.count)>_b.total&&_c.count==_b.length){
_10=true;
}
}
}else{
if(_c.count==_b.length){
_10=true;
}
}
this.nextButton.style.display=_10?"":"none";
_1.attr(this.nextButton,"id",this.id+"_next");
return this.containerNode.childNodes;
},clearResultList:function(){
var _11=this.containerNode;
while(_11.childNodes.length>2){
_11.removeChild(_11.childNodes[_11.childNodes.length-2]);
}
this._setSelectedAttr(null);
},highlightFirstOption:function(){
this.selectFirstNode();
},highlightLastOption:function(){
this.selectLastNode();
},selectFirstNode:function(){
this.inherited(arguments);
if(this.getHighlightedOption()==this.previousButton){
this.selectNextNode();
}
},selectLastNode:function(){
this.inherited(arguments);
if(this.getHighlightedOption()==this.nextButton){
this.selectPreviousNode();
}
},getHighlightedOption:function(){
return this._getSelectedAttr();
}});
return _2.form._ComboBoxMenuMixin;
});
