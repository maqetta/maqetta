/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/form/_FormSelectWidget",["dojo/_base/kernel","..","./_FormWidget","dojo/data/util/sorter","dojo/_base/NodeList","dojo/_base/array","dojo/_base/connect","dojo/_base/html","dojo/_base/lang","dojo/data/api/Identity","dojo/data/api/Notification","dojo/query"],function(_1,_2){
_1.declare("dijit.form._FormSelectWidget",_2.form._FormValueWidget,{multiple:false,options:null,store:null,query:null,queryOptions:null,onFetch:null,sortByLabel:true,loadChildrenOnOpen:false,getOptions:function(_3){
var _4=_3,_5=this.options||[],l=_5.length;
if(_4===undefined){
return _5;
}
if(_1.isArray(_4)){
return _1.map(_4,"return this.getOptions(item);",this);
}
if(_1.isObject(_3)){
if(!_1.some(this.options,function(o,_6){
if(o===_4||(o.value&&o.value===_4.value)){
_4=_6;
return true;
}
return false;
})){
_4=-1;
}
}
if(typeof _4=="string"){
for(var i=0;i<l;i++){
if(_5[i].value===_4){
_4=i;
break;
}
}
}
if(typeof _4=="number"&&_4>=0&&_4<l){
return this.options[_4];
}
return null;
},addOption:function(_7){
if(!_1.isArray(_7)){
_7=[_7];
}
_1.forEach(_7,function(i){
if(i&&_1.isObject(i)){
this.options.push(i);
}
},this);
this._loadChildren();
},removeOption:function(_8){
if(!_1.isArray(_8)){
_8=[_8];
}
var _9=this.getOptions(_8);
_1.forEach(_9,function(i){
if(i){
this.options=_1.filter(this.options,function(_a,_b){
return (_a.value!==i.value||_a.label!==i.label);
});
this._removeOptionItem(i);
}
},this);
this._loadChildren();
},updateOption:function(_c){
if(!_1.isArray(_c)){
_c=[_c];
}
_1.forEach(_c,function(i){
var _d=this.getOptions(i),k;
if(_d){
for(k in i){
_d[k]=i[k];
}
}
},this);
this._loadChildren();
},setStore:function(_e,_f,_10){
var _11=this.store;
_10=_10||{};
if(_11!==_e){
_1.forEach(this._notifyConnections||[],_1.disconnect);
delete this._notifyConnections;
if(_e&&_e.getFeatures()["dojo.data.api.Notification"]){
this._notifyConnections=[_1.connect(_e,"onNew",this,"_onNewItem"),_1.connect(_e,"onDelete",this,"_onDeleteItem"),_1.connect(_e,"onSet",this,"_onSetItem")];
}
this._set("store",_e);
}
this._onChangeActive=false;
if(this.options&&this.options.length){
this.removeOption(this.options);
}
if(_e){
this._loadingStore=true;
_e.fetch(_1.delegate(_10,{onComplete:function(_12,_13){
if(this.sortByLabel&&!_10.sort&&_12.length){
_12.sort(_1.data.util.sorter.createSortFunction([{attribute:_e.getLabelAttributes(_12[0])[0]}],_e));
}
if(_10.onFetch){
_12=_10.onFetch.call(this,_12,_13);
}
_1.forEach(_12,function(i){
this._addOptionForItem(i);
},this);
this._loadingStore=false;
this.set("value","_pendingValue" in this?this._pendingValue:_f);
delete this._pendingValue;
if(!this.loadChildrenOnOpen){
this._loadChildren();
}else{
this._pseudoLoadChildren(_12);
}
this._fetchedWith=_13;
this._lastValueReported=this.multiple?[]:null;
this._onChangeActive=true;
this.onSetStore();
this._handleOnChange(this.value);
},scope:this}));
}else{
delete this._fetchedWith;
}
return _11;
},_setValueAttr:function(_14,_15){
if(this._loadingStore){
this._pendingValue=_14;
return;
}
var _16=this.getOptions()||[];
if(!_1.isArray(_14)){
_14=[_14];
}
_1.forEach(_14,function(i,idx){
if(!_1.isObject(i)){
i=i+"";
}
if(typeof i==="string"){
_14[idx]=_1.filter(_16,function(_17){
return _17.value===i;
})[0]||{value:"",label:""};
}
},this);
_14=_1.filter(_14,function(i){
return i&&i.value;
});
if(!this.multiple&&(!_14[0]||!_14[0].value)&&_16.length){
_14[0]=_16[0];
}
_1.forEach(_16,function(i){
i.selected=_1.some(_14,function(v){
return v.value===i.value;
});
});
var val=_1.map(_14,function(i){
return i.value;
}),_18=_1.map(_14,function(i){
return i.label;
});
this._set("value",this.multiple?val:val[0]);
this._setDisplay(this.multiple?_18:_18[0]);
this._updateSelection();
this._handleOnChange(this.value,_15);
},_getDisplayedValueAttr:function(){
var val=this.get("value");
if(!_1.isArray(val)){
val=[val];
}
var ret=_1.map(this.getOptions(val),function(v){
if(v&&"label" in v){
return v.label;
}else{
if(v){
return v.value;
}
}
return null;
},this);
return this.multiple?ret:ret[0];
},_loadChildren:function(){
if(this._loadingStore){
return;
}
_1.forEach(this._getChildren(),function(_19){
_19.destroyRecursive();
});
_1.forEach(this.options,this._addOptionItem,this);
this._updateSelection();
},_updateSelection:function(){
this._set("value",this._getValueFromOpts());
var val=this.value;
if(!_1.isArray(val)){
val=[val];
}
if(val&&val[0]){
_1.forEach(this._getChildren(),function(_1a){
var _1b=_1.some(val,function(v){
return _1a.option&&(v===_1a.option.value);
});
_1.toggleClass(_1a.domNode,this.baseClass+"SelectedOption",_1b);
_1a.domNode.setAttribute("aria-selected",_1b);
},this);
}
},_getValueFromOpts:function(){
var _1c=this.getOptions()||[];
if(!this.multiple&&_1c.length){
var opt=_1.filter(_1c,function(i){
return i.selected;
})[0];
if(opt&&opt.value){
return opt.value;
}else{
_1c[0].selected=true;
return _1c[0].value;
}
}else{
if(this.multiple){
return _1.map(_1.filter(_1c,function(i){
return i.selected;
}),function(i){
return i.value;
})||[];
}
}
return "";
},_onNewItem:function(_1d,_1e){
if(!_1e||!_1e.parent){
this._addOptionForItem(_1d);
}
},_onDeleteItem:function(_1f){
var _20=this.store;
this.removeOption(_20.getIdentity(_1f));
},_onSetItem:function(_21){
this.updateOption(this._getOptionObjForItem(_21));
},_getOptionObjForItem:function(_22){
var _23=this.store,_24=_23.getLabel(_22),_25=(_24?_23.getIdentity(_22):null);
return {value:_25,label:_24,item:_22};
},_addOptionForItem:function(_26){
var _27=this.store;
if(!_27.isItemLoaded(_26)){
_27.loadItem({item:_26,onItem:function(i){
this._addOptionForItem(_26);
},scope:this});
return;
}
var _28=this._getOptionObjForItem(_26);
this.addOption(_28);
},constructor:function(_29){
this._oValue=(_29||{}).value||null;
},buildRendering:function(){
this.inherited(arguments);
_1.setSelectable(this.focusNode,false);
},_fillContent:function(){
var _2a=this.options;
if(!_2a){
_2a=this.options=this.srcNodeRef?_1.query("> *",this.srcNodeRef).map(function(_2b){
if(_2b.getAttribute("type")==="separator"){
return {value:"",label:"",selected:false,disabled:false};
}
return {value:(_2b.getAttribute("data-"+_1._scopeName+"-value")||_2b.getAttribute("value")),label:String(_2b.innerHTML),selected:_2b.getAttribute("selected")||false,disabled:_2b.getAttribute("disabled")||false};
},this):[];
}
if(!this.value){
this._set("value",this._getValueFromOpts());
}else{
if(this.multiple&&typeof this.value=="string"){
this._set("value",this.value.split(","));
}
}
},postCreate:function(){
this.inherited(arguments);
this.connect(this,"onChange","_updateSelection");
this.connect(this,"startup","_loadChildren");
this._setValueAttr(this.value,null);
},startup:function(){
this.inherited(arguments);
var _2c=this.store,_2d={};
_1.forEach(["query","queryOptions","onFetch"],function(i){
if(this[i]){
_2d[i]=this[i];
}
delete this[i];
},this);
if(_2c&&_2c.getFeatures()["dojo.data.api.Identity"]){
this.store=null;
this.setStore(_2c,this._oValue,_2d);
}
},destroy:function(){
_1.forEach(this._notifyConnections||[],_1.disconnect);
this.inherited(arguments);
},_addOptionItem:function(_2e){
},_removeOptionItem:function(_2f){
},_setDisplay:function(_30){
},_getChildren:function(){
return [];
},_getSelectedOptionsAttr:function(){
return this.getOptions(this.get("value"));
},_pseudoLoadChildren:function(_31){
},onSetStore:function(){
}});
return _2.form._FormSelectWidget;
});
