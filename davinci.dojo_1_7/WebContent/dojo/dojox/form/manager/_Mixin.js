/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/form/manager/_Mixin",["dojo","dijit","dojox","dijit/_Widget"],function(_1,_2,_3){
_1.getObject("dojox.form.manager._Mixin",1);
(function(){
var fm=_3.form.manager,aa=fm.actionAdapter=function(_4){
return function(_5,_6,_7){
if(_1.isArray(_6)){
_1.forEach(_6,function(_8){
_4.call(this,_5,_8,_7);
},this);
}else{
_4.apply(this,arguments);
}
};
},ia=fm.inspectorAdapter=function(_9){
return function(_a,_b,_c){
return _9.call(this,_a,_1.isArray(_b)?_b[0]:_b,_c);
};
},_d={domNode:1,containerNode:1,srcNodeRef:1,bgIframe:1},_e=fm._keys=function(o){
var _f=[],key;
for(key in o){
if(o.hasOwnProperty(key)){
_f.push(key);
}
}
return _f;
},_10=function(_11){
var _12=_11.get("name");
if(_12&&_11 instanceof _2.form._FormWidget){
if(_12 in this.formWidgets){
var a=this.formWidgets[_12].widget;
if(_1.isArray(a)){
a.push(_11);
}else{
this.formWidgets[_12].widget=[a,_11];
}
}else{
this.formWidgets[_12]={widget:_11,connections:[]};
}
}else{
_12=null;
}
return _12;
},_13=function(_14){
var _15={};
aa(function(_16,w){
var o=w.get("observer");
if(o&&typeof o=="string"){
_1.forEach(o.split(","),function(o){
o=_1.trim(o);
if(o&&_1.isFunction(this[o])){
_15[o]=1;
}
},this);
}
}).call(this,null,this.formWidgets[_14].widget);
return _e(_15);
},_17=function(_18,_19){
var t=this.formWidgets[_18],w=t.widget,c=t.connections;
if(c.length){
_1.forEach(c,_1.disconnect);
c=t.connections=[];
}
if(_1.isArray(w)){
_1.forEach(w,function(w){
_1.forEach(_19,function(o){
c.push(_1.connect(w,"onChange",this,function(evt){
if(this.watching&&_1.attr(w.focusNode,"checked")){
this[o](w.get("value"),_18,w,evt);
}
}));
},this);
},this);
}else{
var _1a=w.declaredClass=="dijit.form.Button"?"onClick":"onChange";
_1.forEach(_19,function(o){
c.push(_1.connect(w,_1a,this,function(evt){
if(this.watching){
this[o](w.get("value"),_18,w,evt);
}
}));
},this);
}
};
_1.declare("dojox.form.manager._Mixin",null,{watching:true,startup:function(){
if(this._started){
return;
}
this.formWidgets={};
this.formNodes={};
this.registerWidgetDescendants(this);
this.inherited(arguments);
},destroy:function(){
for(var _1b in this.formWidgets){
_1.forEach(this.formWidgets[_1b].connections,_1.disconnect);
}
this.formWidgets={};
this.inherited(arguments);
},registerWidget:function(_1c){
if(typeof _1c=="string"){
_1c=_2.byId(_1c);
}else{
if(_1c.tagName&&_1c.cloneNode){
_1c=_2.byNode(_1c);
}
}
var _1d=_10.call(this,_1c);
if(_1d){
_17.call(this,_1d,_13.call(this,_1d));
}
return this;
},unregisterWidget:function(_1e){
if(_1e in this.formWidgets){
_1.forEach(this.formWidgets[_1e].connections,this.disconnect,this);
delete this.formWidgets[_1e];
}
return this;
},registerWidgetDescendants:function(_1f){
if(typeof _1f=="string"){
_1f=_2.byId(_1f);
}else{
if(_1f.tagName&&_1f.cloneNode){
_1f=_2.byNode(_1f);
}
}
var _20=_1.map(_1f.getDescendants(),_10,this);
_1.forEach(_20,function(_21){
if(_21){
_17.call(this,_21,_13.call(this,_21));
}
},this);
return this.registerNodeDescendants?this.registerNodeDescendants(_1f.domNode):this;
},unregisterWidgetDescendants:function(_22){
if(typeof _22=="string"){
_22=_2.byId(_22);
}else{
if(_22.tagName&&_22.cloneNode){
_22=_2.byNode(_22);
}
}
_1.forEach(_1.map(_22.getDescendants(),function(w){
return w instanceof _2.form._FormWidget&&w.get("name")||null;
}),function(_23){
if(_23){
this.unregisterNode(_23);
}
},this);
return this.unregisterNodeDescendants?this.unregisterNodeDescendants(_22.domNode):this;
},formWidgetValue:function(_24,_25){
var _26=arguments.length==2&&_25!==undefined,_27;
if(typeof _24=="string"){
_24=this.formWidgets[_24];
if(_24){
_24=_24.widget;
}
}
if(!_24){
return null;
}
if(_1.isArray(_24)){
if(_26){
_1.forEach(_24,function(_28){
_28.set("checked",false,!this.watching);
});
_1.forEach(_24,function(_29){
_29.set("checked",_29.value===_25,!this.watching);
});
return this;
}
_1.some(_24,function(_2a){
if(_1.attr(_2a.focusNode,"checked")){
_27=_2a;
return true;
}
return false;
});
return _27?_27.get("value"):"";
}
if(_24.declaredClass=="dijit.form.CheckBox"){
if(_26){
_24.set("value",Boolean(_25),!this.watching);
return this;
}
return Boolean(_24.get("value"));
}
if(_26){
_24.set("value",_25,!this.watching);
return this;
}
return _24.get("value");
},formPointValue:function(_2b,_2c){
if(_2b&&typeof _2b=="string"){
_2b=this[_2b];
}
if(!_2b||!_2b.tagName||!_2b.cloneNode){
return null;
}
if(!_1.hasClass(_2b,"dojoFormValue")){
return null;
}
if(arguments.length==2&&_2c!==undefined){
_2b.innerHTML=_2c;
return this;
}
return _2b.innerHTML;
},inspectFormWidgets:function(_2d,_2e,_2f){
var _30,_31={};
if(_2e){
if(_1.isArray(_2e)){
_1.forEach(_2e,function(_32){
if(_32 in this.formWidgets){
_31[_32]=_2d.call(this,_32,this.formWidgets[_32].widget,_2f);
}
},this);
}else{
for(_30 in _2e){
if(_30 in this.formWidgets){
_31[_30]=_2d.call(this,_30,this.formWidgets[_30].widget,_2e[_30]);
}
}
}
}else{
for(_30 in this.formWidgets){
_31[_30]=_2d.call(this,_30,this.formWidgets[_30].widget,_2f);
}
}
return _31;
},inspectAttachedPoints:function(_33,_34,_35){
var _36,_37={};
if(_34){
if(_1.isArray(_34)){
_1.forEach(_34,function(_38){
var _39=this[_38];
if(_39&&_39.tagName&&_39.cloneNode){
_37[_38]=_33.call(this,_38,_39,_35);
}
},this);
}else{
for(_36 in _34){
var _3a=this[_36];
if(_3a&&_3a.tagName&&_3a.cloneNode){
_37[_36]=_33.call(this,_36,_3a,_34[_36]);
}
}
}
}else{
for(_36 in this){
if(!(_36 in _d)){
var _3a=this[_36];
if(_3a&&_3a.tagName&&_3a.cloneNode){
_37[_36]=_33.call(this,_36,_3a,_35);
}
}
}
}
return _37;
},inspect:function(_3b,_3c,_3d){
var _3e=this.inspectFormWidgets(function(_3f,_40,_41){
if(_1.isArray(_40)){
return _3b.call(this,_3f,_1.map(_40,function(w){
return w.domNode;
}),_41);
}
return _3b.call(this,_3f,_40.domNode,_41);
},_3c,_3d);
if(this.inspectFormNodes){
_1.mixin(_3e,this.inspectFormNodes(_3b,_3c,_3d));
}
return _1.mixin(_3e,this.inspectAttachedPoints(_3b,_3c,_3d));
}});
})();
_1.extend(_2._Widget,{observer:""});
return _1.getObject("dojox.form.manager._Mixin");
});
require(["dojox/form/manager/_Mixin"]);
