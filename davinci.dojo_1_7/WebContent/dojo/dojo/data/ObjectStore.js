/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/data/ObjectStore",["../main","../regexp"],function(_1){
_1.declare("dojo.data.ObjectStore",null,{objectStore:null,constructor:function(_2){
_1.mixin(this,_2);
},labelProperty:"label",getValue:function(_3,_4,_5){
return typeof _3.get==="function"?_3.get(_4):_4 in _3?_3[_4]:_5;
},getValues:function(_6,_7){
var _8=this.getValue(_6,_7);
return _8 instanceof Array?_8:_8===undefined?[]:[_8];
},getAttributes:function(_9){
var _a=[];
for(var i in _9){
if(_9.hasOwnProperty(i)&&!(i.charAt(0)=="_"&&i.charAt(1)=="_")){
_a.push(i);
}
}
return _a;
},hasAttribute:function(_b,_c){
return _c in _b;
},containsValue:function(_d,_e,_f){
return _1.indexOf(this.getValues(_d,_e),_f)>-1;
},isItem:function(_10){
return (typeof _10=="object")&&_10&&!(_10 instanceof Date);
},isItemLoaded:function(_11){
return _11&&typeof _11.load!=="function";
},loadItem:function(_12){
var _13;
if(typeof _12.item.load==="function"){
_1.when(_12.item.load(),function(_14){
_13=_14;
var _15=_14 instanceof Error?_12.onError:_12.onItem;
if(_15){
_15.call(_12.scope,_14);
}
});
}else{
if(_12.onItem){
_12.onItem.call(_12.scope,_12.item);
}
}
return _13;
},close:function(_16){
return _16&&_16.abort&&_16.abort();
},fetch:function(_17){
_17=_1.delegate(_17,_17&&_17.queryOptions);
var _18=this;
var _19=_17.scope||_18;
var _1a=_17.query;
if(typeof _1a=="object"){
_1a=_1.delegate(_1a);
for(var i in _1a){
var _1b=_1a[i];
if(typeof _1b=="string"){
_1a[i]=RegExp("^"+_1.regexp.escapeString(_1b,"*?").replace(/\*/g,".*").replace(/\?/g,".")+"$",_17.ignoreCase?"mi":"m");
_1a[i].toString=(function(_1c){
return function(){
return _1c;
};
})(_1b);
}
}
}
var _1d=this.objectStore.query(_1a,_17);
_1.when(_1d.total,function(_1e){
_1.when(_1d,function(_1f){
if(_17.onBegin){
_17.onBegin.call(_19,_1e||_1f.length,_17);
}
if(_17.onItem){
for(var i=0;i<_1f.length;i++){
_17.onItem.call(_19,_1f[i],_17);
}
}
if(_17.onComplete){
_17.onComplete.call(_19,_17.onItem?null:_1f,_17);
}
return _1f;
},_20);
},_20);
function _20(_21){
if(_17.onError){
_17.onError.call(_19,_21,_17);
}
};
_17.abort=function(){
if(_1d.cancel){
_1d.cancel();
}
};
if(_1d.observe){
_1d.observe(function(_22,_23,_24){
if(_1.indexOf(_18._dirtyObjects,_22)==-1){
if(_23==-1){
_18.onNew(_22);
}else{
if(_24==-1){
_18.onDelete(_22);
}else{
for(var i in _22){
if(i!=_18.idProperty){
_18.onSet(_22,i,null,_22[i]);
}
}
}
}
}
});
}
this.onFetch(_1d);
_17.store=this;
return _17;
},getFeatures:function(){
return {"dojo.data.api.Read":!!this.objectStore.get,"dojo.data.api.Identity":true,"dojo.data.api.Write":!!this.objectStore.put,"dojo.data.api.Notification":true};
},getLabel:function(_25){
if(this.isItem(_25)){
return this.getValue(_25,this.labelProperty);
}
return undefined;
},getLabelAttributes:function(_26){
return [this.labelProperty];
},getIdentity:function(_27){
return _27.getId?_27.getId():_27[this.objectStore.idProperty||"id"];
},getIdentityAttributes:function(_28){
return [this.objectStore.idProperty];
},fetchItemByIdentity:function(_29){
var _2a;
_1.when(this.objectStore.get(_29.identity),function(_2b){
_2a=_2b;
_29.onItem.call(_29.scope,_2b);
},function(_2c){
_29.onError.call(_29.scope,_2c);
});
return _2a;
},newItem:function(_2d,_2e){
if(_2e){
var _2f=this.getValue(_2e.parent,_2e.attribute,[]);
_2f=_2f.concat([_2d]);
_2d.__parent=_2f;
this.setValue(_2e.parent,_2e.attribute,_2f);
}
this._dirtyObjects.push({object:_2d,save:true});
this.onNew(_2d);
return _2d;
},deleteItem:function(_30){
this.changing(_30,true);
this.onDelete(_30);
},setValue:function(_31,_32,_33){
var old=_31[_32];
this.changing(_31);
_31[_32]=_33;
this.onSet(_31,_32,old,_33);
},setValues:function(_34,_35,_36){
if(!_1.isArray(_36)){
throw new Error("setValues expects to be passed an Array object as its value");
}
this.setValue(_34,_35,_36);
},unsetAttribute:function(_37,_38){
this.changing(_37);
var old=_37[_38];
delete _37[_38];
this.onSet(_37,_38,old,undefined);
},_dirtyObjects:[],changing:function(_39,_3a){
_39.__isDirty=true;
for(var i=0;i<this._dirtyObjects.length;i++){
var _3b=this._dirtyObjects[i];
if(_39==_3b.object){
if(_3a){
_3b.object=false;
if(!this._saveNotNeeded){
_3b.save=true;
}
}
return;
}
}
var old=_39 instanceof Array?[]:{};
for(i in _39){
if(_39.hasOwnProperty(i)){
old[i]=_39[i];
}
}
this._dirtyObjects.push({object:!_3a&&_39,old:old,save:!this._saveNotNeeded});
},save:function(_3c){
_3c=_3c||{};
var _3d,_3e=[];
var _3f=[];
var _40=this;
var _41=this._dirtyObjects;
var _42=_41.length;
try{
_1.connect(_3c,"onError",function(){
if(_3c.revertOnError!==false){
var _43=_41;
_41=_3f;
_40.revert();
_40._dirtyObjects=_43;
}else{
_40._dirtyObjects=_41.concat(_3f);
}
});
if(this.objectStore.transaction){
var _44=this.objectStore.transaction();
}
for(var i=0;i<_41.length;i++){
var _45=_41[i];
var _46=_45.object;
var old=_45.old;
delete _46.__isDirty;
if(_46){
_3d=this.objectStore.put(_46,{overwrite:!!old});
}else{
_3d=this.objectStore.remove(this.getIdentity(old));
}
_3f.push(_45);
_41.splice(i--,1);
_1.when(_3d,function(_47){
if(!(--_42)){
if(_3c.onComplete){
_3c.onComplete.call(_3c.scope,_3e);
}
}
},function(_48){
_42=-1;
_3c.onError.call(_3c.scope,_48);
});
}
if(_44){
_44.commit();
}
}
catch(e){
_3c.onError.call(_3c.scope,value);
}
},revert:function(_49){
var _4a=this._dirtyObjects;
for(var i=_4a.length;i>0;){
i--;
var _4b=_4a[i];
var _4c=_4b.object;
var old=_4b.old;
if(_4c&&old){
for(var j in old){
if(old.hasOwnProperty(j)&&_4c[j]!==old[j]){
this.onSet(_4c,j,_4c[j],old[j]);
_4c[j]=old[j];
}
}
for(j in _4c){
if(!old.hasOwnProperty(j)){
this.onSet(_4c,j,_4c[j]);
delete _4c[j];
}
}
}else{
if(!old){
this.onDelete(_4c);
}else{
this.onNew(old);
}
}
delete (_4c||old).__isDirty;
_4a.splice(i,1);
}
},isDirty:function(_4d){
if(!_4d){
return !!this._dirtyObjects.length;
}
return _4d.__isDirty;
},onSet:function(){
},onNew:function(){
},onDelete:function(){
},onFetch:function(_4e){
}});
return _1.data.ObjectStore;
});
