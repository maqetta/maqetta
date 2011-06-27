/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/form/_FormMixin",["dojo/_base/kernel","..","dojo/window","dojo/_base/array","dojo/_base/declare","dojo/_base/lang"],function(_1,_2){
_1.declare("dijit.form._FormMixin",null,{state:"",reset:function(){
_1.forEach(this.getDescendants(),function(_3){
if(_3.reset){
_3.reset();
}
});
},validate:function(){
var _4=false;
return _1.every(_1.map(this.getDescendants(),function(_5){
_5._hasBeenBlurred=true;
var _6=_5.disabled||!_5.validate||_5.validate();
if(!_6&&!_4){
_1.window.scrollIntoView(_5.containerNode||_5.domNode);
_5.focus();
_4=true;
}
return _6;
}),function(_7){
return _7;
});
},setValues:function(_8){
_1.deprecated(this.declaredClass+"::setValues() is deprecated. Use set('value', val) instead.","","2.0");
return this.set("value",_8);
},_setValueAttr:function(_9){
var _a={};
_1.forEach(this.getDescendants(),function(_b){
if(!_b.name){
return;
}
var _c=_a[_b.name]||(_a[_b.name]=[]);
_c.push(_b);
});
for(var _d in _a){
if(!_a.hasOwnProperty(_d)){
continue;
}
var _e=_a[_d],_f=_1.getObject(_d,false,_9);
if(_f===undefined){
continue;
}
if(!_1.isArray(_f)){
_f=[_f];
}
if(typeof _e[0].checked=="boolean"){
_1.forEach(_e,function(w,i){
w.set("value",_1.indexOf(_f,w.value)!=-1);
});
}else{
if(_e[0].multiple){
_e[0].set("value",_f);
}else{
_1.forEach(_e,function(w,i){
w.set("value",_f[i]);
});
}
}
}
},getValues:function(){
_1.deprecated(this.declaredClass+"::getValues() is deprecated. Use get('value') instead.","","2.0");
return this.get("value");
},_getValueAttr:function(){
var obj={};
_1.forEach(this.getDescendants(),function(_10){
var _11=_10.name;
if(!_11||_10.disabled){
return;
}
var _12=_10.get("value");
if(typeof _10.checked=="boolean"){
if(/Radio/.test(_10.declaredClass)){
if(_12!==false){
_1.setObject(_11,_12,obj);
}else{
_12=_1.getObject(_11,false,obj);
if(_12===undefined){
_1.setObject(_11,null,obj);
}
}
}else{
var ary=_1.getObject(_11,false,obj);
if(!ary){
ary=[];
_1.setObject(_11,ary,obj);
}
if(_12!==false){
ary.push(_12);
}
}
}else{
var _13=_1.getObject(_11,false,obj);
if(typeof _13!="undefined"){
if(_1.isArray(_13)){
_13.push(_12);
}else{
_1.setObject(_11,[_13,_12],obj);
}
}else{
_1.setObject(_11,_12,obj);
}
}
});
return obj;
},isValid:function(){
return this.state=="";
},onValidStateChange:function(_14){
},_getState:function(){
var _15=_1.map(this._descendants,function(w){
return w.get("state")||"";
});
return _1.indexOf(_15,"Error")>=0?"Error":_1.indexOf(_15,"Incomplete")>=0?"Incomplete":"";
},disconnectChildren:function(){
_1.forEach(this._childConnections||[],_1.hitch(this,"disconnect"));
_1.forEach(this._childWatches||[],function(w){
w.unwatch();
});
},connectChildren:function(_16){
var _17=this;
this.disconnectChildren();
this._descendants=this.getDescendants();
var set=_16?function(_18,val){
_17[_18]=val;
}:_1.hitch(this,"_set");
set("value",this.get("value"));
set("state",this._getState());
var _19=(this._childConnections=[]),_1a=(this._childWatches=[]);
_1.forEach(_1.filter(this._descendants,function(_1b){
return _1b.validate;
}),function(_1c){
_1.forEach(["state","disabled"],function(_1d){
_1a.push(_1c.watch(_1d,function(_1e,_1f,_20){
_17.set("state",_17._getState());
}));
});
});
var _21=function(){
if(_17._onChangeDelayTimer){
clearTimeout(_17._onChangeDelayTimer);
}
_17._onChangeDelayTimer=setTimeout(function(){
delete _17._onChangeDelayTimer;
_17._set("value",_17.get("value"));
},10);
};
_1.forEach(_1.filter(this._descendants,function(_22){
return _22.onChange;
}),function(_23){
_19.push(_17.connect(_23,"onChange",_21));
_1a.push(_23.watch("disabled",_21));
});
},startup:function(){
this.inherited(arguments);
this.connectChildren(true);
this.watch("state",function(_24,_25,_26){
this.onValidStateChange(_26=="");
});
},destroy:function(){
this.disconnectChildren();
this.inherited(arguments);
}});
return _2.form._FormMixin;
});
