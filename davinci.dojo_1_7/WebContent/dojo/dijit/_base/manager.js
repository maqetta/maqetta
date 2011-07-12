/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/_base/manager",["dojo/_base/kernel","..","dojo/_base/NodeList","dojo/_base/array","dojo/_base/declare","dojo/_base/html","dojo/_base/sniff","dojo/_base/unload","dojo/_base/window","dojo/query"],function(_1,_2){
_1.declare("dijit.WidgetSet",null,{constructor:function(){
this._hash={};
this.length=0;
},add:function(_3){
if(this._hash[_3.id]){
throw new Error("Tried to register widget with id=="+_3.id+" but that id is already registered");
}
this._hash[_3.id]=_3;
this.length++;
},remove:function(id){
if(this._hash[id]){
delete this._hash[id];
this.length--;
}
},forEach:function(_4,_5){
_5=_5||_1.global;
var i=0,id;
for(id in this._hash){
_4.call(_5,this._hash[id],i++,this._hash);
}
return this;
},filter:function(_6,_7){
_7=_7||_1.global;
var _8=new _2.WidgetSet(),i=0,id;
for(id in this._hash){
var w=this._hash[id];
if(_6.call(_7,w,i++,this._hash)){
_8.add(w);
}
}
return _8;
},byId:function(id){
return this._hash[id];
},byClass:function(_9){
var _a=new _2.WidgetSet(),id,_b;
for(id in this._hash){
_b=this._hash[id];
if(_b.declaredClass==_9){
_a.add(_b);
}
}
return _a;
},toArray:function(){
var ar=[];
for(var id in this._hash){
ar.push(this._hash[id]);
}
return ar;
},map:function(_c,_d){
return _1.map(this.toArray(),_c,_d);
},every:function(_e,_f){
_f=_f||_1.global;
var x=0,i;
for(i in this._hash){
if(!_e.call(_f,this._hash[i],x++,this._hash)){
return false;
}
}
return true;
},some:function(_10,_11){
_11=_11||_1.global;
var x=0,i;
for(i in this._hash){
if(_10.call(_11,this._hash[i],x++,this._hash)){
return true;
}
}
return false;
}});
_2.registry=new _2.WidgetSet();
var _12=_2.registry._hash,_13=_1.attr,_14=_1.hasAttr,_15=_1.style;
_2.byId=function(id){
return typeof id=="string"?_12[id]:id;
};
var _16={};
_2.getUniqueId=function(_17){
var id;
do{
id=_17+"_"+(_17 in _16?++_16[_17]:_16[_17]=0);
}while(_12[id]);
return _2._scopeName=="dijit"?id:_2._scopeName+"_"+id;
};
_2.findWidgets=function(_18){
var _19=[];
function _1a(_1b){
for(var _1c=_1b.firstChild;_1c;_1c=_1c.nextSibling){
if(_1c.nodeType==1){
var _1d=_1c.getAttribute("widgetId");
if(_1d){
var _1e=_12[_1d];
if(_1e){
_19.push(_1e);
}
}else{
_1a(_1c);
}
}
}
};
_1a(_18);
return _19;
};
_2._destroyAll=function(){
_2._curFocus=null;
_2._prevFocus=null;
_2._activeStack=[];
_1.forEach(_2.findWidgets(_1.body()),function(_1f){
if(!_1f._destroyed){
if(_1f.destroyRecursive){
_1f.destroyRecursive();
}else{
if(_1f.destroy){
_1f.destroy();
}
}
}
});
};
if(_1.isIE){
_1.addOnWindowUnload(function(){
_2._destroyAll();
});
}
_2.byNode=function(_20){
return _12[_20.getAttribute("widgetId")];
};
_2.getEnclosingWidget=function(_21){
while(_21){
var id=_21.getAttribute&&_21.getAttribute("widgetId");
if(id){
return _12[id];
}
_21=_21.parentNode;
}
return null;
};
var _22=(_2._isElementShown=function(_23){
var s=_15(_23);
return (s.visibility!="hidden")&&(s.visibility!="collapsed")&&(s.display!="none")&&(_13(_23,"type")!="hidden");
});
_2.hasDefaultTabStop=function(_24){
switch(_24.nodeName.toLowerCase()){
case "a":
return _14(_24,"href");
case "area":
case "button":
case "input":
case "object":
case "select":
case "textarea":
return true;
case "iframe":
var _25;
try{
var _26=_24.contentDocument;
if("designMode" in _26&&_26.designMode=="on"){
return true;
}
_25=_26.body;
}
catch(e1){
try{
_25=_24.contentWindow.document.body;
}
catch(e2){
return false;
}
}
return _25.contentEditable=="true"||(_25.firstChild&&_25.firstChild.contentEditable=="true");
default:
return _24.contentEditable=="true";
}
};
var _27=(_2.isTabNavigable=function(_28){
if(_13(_28,"disabled")){
return false;
}else{
if(_14(_28,"tabIndex")){
return _13(_28,"tabIndex")>=0;
}else{
return _2.hasDefaultTabStop(_28);
}
}
});
_2._getTabNavigable=function(_29){
var _2a,_2b,_2c,_2d,_2e,_2f,_30={};
function _31(_32){
return _32&&_32.tagName.toLowerCase()=="input"&&_32.type&&_32.type.toLowerCase()=="radio"&&_32.name&&_32.name.toLowerCase();
};
var _33=function(_34){
_1.query("> *",_34).forEach(function(_35){
if((_1.isIE&&_35.scopeName!=="HTML")||!_22(_35)){
return;
}
if(_27(_35)){
var _36=_13(_35,"tabIndex");
if(!_14(_35,"tabIndex")||_36==0){
if(!_2a){
_2a=_35;
}
_2b=_35;
}else{
if(_36>0){
if(!_2c||_36<_2d){
_2d=_36;
_2c=_35;
}
if(!_2e||_36>=_2f){
_2f=_36;
_2e=_35;
}
}
}
var rn=_31(_35);
if(_1.attr(_35,"checked")&&rn){
_30[rn]=_35;
}
}
if(_35.nodeName.toUpperCase()!="SELECT"){
_33(_35);
}
});
};
if(_22(_29)){
_33(_29);
}
function rs(_37){
return _30[_31(_37)]||_37;
};
return {first:rs(_2a),last:rs(_2b),lowest:rs(_2c),highest:rs(_2e)};
};
_2.getFirstInTabbingOrder=function(_38){
var _39=_2._getTabNavigable(_1.byId(_38));
return _39.lowest?_39.lowest:_39.first;
};
_2.getLastInTabbingOrder=function(_3a){
var _3b=_2._getTabNavigable(_1.byId(_3a));
return _3b.last?_3b.last:_3b.highest;
};
_2.defaultDuration=_1.config["defaultDuration"]||200;
return _2;
});
