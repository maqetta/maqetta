/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/dtl/contrib/dijit",["dojo/_base/kernel","dojo/_base/lang","../_base","../dom","dojo/parser"],function(_1,_2,dd){
_1.getObject("dtl.contrib.dijit",true,dojox);
var _3=dd.contrib.dijit;
_3.AttachNode=_1.extend(function(_4,_5){
this._keys=_4;
this._object=_5;
},{render:function(_6,_7){
if(!this._rendered){
this._rendered=true;
for(var i=0,_8;_8=this._keys[i];i++){
_6.getThis()[_8]=this._object||_7.getParent();
}
}
return _7;
},unrender:function(_9,_a){
if(this._rendered){
this._rendered=false;
for(var i=0,_b;_b=this._keys[i];i++){
if(_9.getThis()[_b]===(this._object||_a.getParent())){
delete _9.getThis()[_b];
}
}
}
return _a;
},clone:function(_c){
return new this.constructor(this._keys,this._object);
}});
_3.EventNode=_1.extend(function(_d,_e){
this._command=_d;
var _f,_10=_d.split(/\s*,\s*/);
var _11=_1.trim;
var _12=[];
var fns=[];
while(_f=_10.pop()){
if(_f){
var fn=null;
if(_f.indexOf(":")!=-1){
var _13=_f.split(":");
_f=_11(_13[0]);
fn=_11(_13.slice(1).join(":"));
}else{
_f=_11(_f);
}
if(!fn){
fn=_f;
}
_12.push(_f);
fns.push(fn);
}
}
this._types=_12;
this._fns=fns;
this._object=_e;
this._rendered=[];
},{_clear:false,render:function(_14,_15){
for(var i=0,_16;_16=this._types[i];i++){
if(!this._clear&&!this._object){
_15.getParent()[_16]=null;
}
var fn=this._fns[i];
var _17;
if(fn.indexOf(" ")!=-1){
if(this._rendered[i]){
_1.disconnect(this._rendered[i]);
this._rendered[i]=false;
}
_17=_1.map(fn.split(" ").slice(1),function(_18){
return new dd._Filter(_18).resolve(_14);
});
fn=fn.split(" ",2)[0];
}
if(!this._rendered[i]){
if(!this._object){
this._rendered[i]=_15.addEvent(_14,_16,fn,_17);
}else{
this._rendered[i]=_1.connect(this._object,_16,_14.getThis(),fn);
}
}
}
this._clear=true;
return _15;
},unrender:function(_19,_1a){
while(this._rendered.length){
_1.disconnect(this._rendered.pop());
}
return _1a;
},clone:function(){
return new this.constructor(this._command,this._object);
}});
function _1b(n1){
var n2=n1.cloneNode(true);
if(_1.isIE){
_1.query("script",n2).forEach("item.text = this[index].text;",_1.query("script",n1));
}
return n2;
};
_3.DojoTypeNode=_1.extend(function(_1c,_1d){
this._node=_1c;
this._parsed=_1d;
var _1e=_1c.getAttribute("dojoAttachEvent");
if(_1e){
this._events=new _3.EventNode(_1.trim(_1e));
}
var _1f=_1c.getAttribute("dojoAttachPoint");
if(_1f){
this._attach=new _3.AttachNode(_1.trim(_1f).split(/\s*,\s*/));
}
if(!_1d){
this._dijit=_1.parser.instantiate([_1b(_1c)])[0];
}else{
_1c=_1b(_1c);
var old=_3.widgetsInTemplate;
_3.widgetsInTemplate=false;
this._template=new dd.DomTemplate(_1c);
_3.widgetsInTemplate=old;
}
},{render:function(_20,_21){
if(this._parsed){
var _22=new dd.DomBuffer();
this._template.render(_20,_22);
var _23=_1b(_22.getRootNode());
var div=document.createElement("div");
div.appendChild(_23);
var _24=div.innerHTML;
div.removeChild(_23);
if(_24!=this._rendered){
this._rendered=_24;
if(this._dijit){
this._dijit.destroyRecursive();
}
this._dijit=_1.parser.instantiate([_23])[0];
}
}
var _25=this._dijit.domNode;
if(this._events){
this._events._object=this._dijit;
this._events.render(_20,_21);
}
if(this._attach){
this._attach._object=this._dijit;
this._attach.render(_20,_21);
}
return _21.concat(_25);
},unrender:function(_26,_27){
return _27.remove(this._dijit.domNode);
},clone:function(){
return new this.constructor(this._node,this._parsed);
}});
_1.mixin(_3,{widgetsInTemplate:true,dojoAttachPoint:function(_28,_29){
return new _3.AttachNode(_29.contents.slice(16).split(/\s*,\s*/));
},dojoAttachEvent:function(_2a,_2b){
return new _3.EventNode(_2b.contents.slice(16));
},dojoType:function(_2c,_2d){
var _2e=false;
if(_2d.contents.slice(-7)==" parsed"){
_2e=true;
}
var _2f=_2d.contents.slice(9);
var _30=_2e?_2f.slice(0,-7):_2f.toString();
if(_3.widgetsInTemplate){
var _31=_2c.swallowNode();
_31.setAttribute("dojoType",_30);
return new _3.DojoTypeNode(_31,_2e);
}
return new dd.AttributeNode("dojoType",_30);
},on:function(_32,_33){
var _34=_33.contents.split();
return new _3.EventNode(_34[0]+":"+_34.slice(1).join(" "));
}});
dd.register.tags("dojox.dtl.contrib",{"dijit":["attr:dojoType","attr:dojoAttachPoint",["attr:attach","dojoAttachPoint"],"attr:dojoAttachEvent",[/(attr:)?on(click|key(up))/i,"on"]]});
return dojox.dtl.contrib.dijit;
});
