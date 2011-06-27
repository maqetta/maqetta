/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/dnd/Container",["../main","./common","../parser"],function(_1){
_1.declare("dojo.dnd.Container",null,{skipForm:false,constructor:function(_2,_3){
this.node=_1.byId(_2);
if(!_3){
_3={};
}
this.creator=_3.creator||null;
this.skipForm=_3.skipForm;
this.parent=_3.dropParent&&_1.byId(_3.dropParent);
this.map={};
this.current=null;
this.containerState="";
_1.addClass(this.node,"dojoDndContainer");
if(!(_3&&_3._skipStartup)){
this.startup();
}
this.events=[_1.connect(this.node,"onmouseover",this,"onMouseOver"),_1.connect(this.node,"onmouseout",this,"onMouseOut"),_1.connect(this.node,"ondragstart",this,"onSelectStart"),_1.connect(this.node,"onselectstart",this,"onSelectStart")];
},creator:function(){
},getItem:function(_4){
return this.map[_4];
},setItem:function(_5,_6){
this.map[_5]=_6;
},delItem:function(_7){
delete this.map[_7];
},forInItems:function(f,o){
o=o||_1.global;
var m=this.map,e=_1.dnd._empty;
for(var i in m){
if(i in e){
continue;
}
f.call(o,m[i],i,this);
}
return o;
},clearItems:function(){
this.map={};
},getAllNodes:function(){
return _1.query("> .dojoDndItem",this.parent);
},sync:function(){
var _8={};
this.getAllNodes().forEach(function(_9){
if(_9.id){
var _a=this.getItem(_9.id);
if(_a){
_8[_9.id]=_a;
return;
}
}else{
_9.id=_1.dnd.getUniqueId();
}
var _b=_9.getAttribute("dndType"),_c=_9.getAttribute("dndData");
_8[_9.id]={data:_c||_9.innerHTML,type:_b?_b.split(/\s*,\s*/):["text"]};
},this);
this.map=_8;
return this;
},insertNodes:function(_d,_e,_f){
if(!this.parent.firstChild){
_f=null;
}else{
if(_e){
if(!_f){
_f=this.parent.firstChild;
}
}else{
if(_f){
_f=_f.nextSibling;
}
}
}
if(_f){
for(var i=0;i<_d.length;++i){
var t=this._normalizedCreator(_d[i]);
this.setItem(t.node.id,{data:t.data,type:t.type});
this.parent.insertBefore(t.node,_f);
}
}else{
for(var i=0;i<_d.length;++i){
var t=this._normalizedCreator(_d[i]);
this.setItem(t.node.id,{data:t.data,type:t.type});
this.parent.appendChild(t.node);
}
}
return this;
},destroy:function(){
_1.forEach(this.events,_1.disconnect);
this.clearItems();
this.node=this.parent=this.current=null;
},markupFactory:function(_10,_11){
_10._skipStartup=true;
return new _1.dnd.Container(_11,_10);
},startup:function(){
if(!this.parent){
this.parent=this.node;
if(this.parent.tagName.toLowerCase()=="table"){
var c=this.parent.getElementsByTagName("tbody");
if(c&&c.length){
this.parent=c[0];
}
}
}
this.defaultCreator=_1.dnd._defaultCreator(this.parent);
this.sync();
},onMouseOver:function(e){
var n=e.relatedTarget;
while(n){
if(n==this.node){
break;
}
try{
n=n.parentNode;
}
catch(x){
n=null;
}
}
if(!n){
this._changeState("Container","Over");
this.onOverEvent();
}
n=this._getChildByEvent(e);
if(this.current==n){
return;
}
if(this.current){
this._removeItemClass(this.current,"Over");
}
if(n){
this._addItemClass(n,"Over");
}
this.current=n;
},onMouseOut:function(e){
for(var n=e.relatedTarget;n;){
if(n==this.node){
return;
}
try{
n=n.parentNode;
}
catch(x){
n=null;
}
}
if(this.current){
this._removeItemClass(this.current,"Over");
this.current=null;
}
this._changeState("Container","");
this.onOutEvent();
},onSelectStart:function(e){
if(!this.skipForm||!_1.dnd.isFormElement(e)){
_1.stopEvent(e);
}
},onOverEvent:function(){
},onOutEvent:function(){
},_changeState:function(_12,_13){
var _14="dojoDnd"+_12;
var _15=_12.toLowerCase()+"State";
_1.replaceClass(this.node,_14+_13,_14+this[_15]);
this[_15]=_13;
},_addItemClass:function(_16,_17){
_1.addClass(_16,"dojoDndItem"+_17);
},_removeItemClass:function(_18,_19){
_1.removeClass(_18,"dojoDndItem"+_19);
},_getChildByEvent:function(e){
var _1a=e.target;
if(_1a){
for(var _1b=_1a.parentNode;_1b;_1a=_1b,_1b=_1a.parentNode){
if(_1b==this.parent&&_1.hasClass(_1a,"dojoDndItem")){
return _1a;
}
}
}
return null;
},_normalizedCreator:function(_1c,_1d){
var t=(this.creator||this.defaultCreator).call(this,_1c,_1d);
if(!_1.isArray(t.type)){
t.type=["text"];
}
if(!t.node.id){
t.node.id=_1.dnd.getUniqueId();
}
_1.addClass(t.node,"dojoDndItem");
return t;
}});
_1.dnd._createNode=function(tag){
if(!tag){
return _1.dnd._createSpan;
}
return function(_1e){
return _1.create(tag,{innerHTML:_1e});
};
};
_1.dnd._createTrTd=function(_1f){
var tr=_1.create("tr");
_1.create("td",{innerHTML:_1f},tr);
return tr;
};
_1.dnd._createSpan=function(_20){
return _1.create("span",{innerHTML:_20});
};
_1.dnd._defaultCreatorNodes={ul:"li",ol:"li",div:"div",p:"div"};
_1.dnd._defaultCreator=function(_21){
var tag=_21.tagName.toLowerCase();
var c=tag=="tbody"||tag=="thead"?_1.dnd._createTrTd:_1.dnd._createNode(_1.dnd._defaultCreatorNodes[tag]);
return function(_22,_23){
var _24=_22&&_1.isObject(_22),_25,_26,n;
if(_24&&_22.tagName&&_22.nodeType&&_22.getAttribute){
_25=_22.getAttribute("dndData")||_22.innerHTML;
_26=_22.getAttribute("dndType");
_26=_26?_26.split(/\s*,\s*/):["text"];
n=_22;
}else{
_25=(_24&&_22.data)?_22.data:_22;
_26=(_24&&_22.type)?_22.type:["text"];
n=(_23=="avatar"?_1.dnd._createSpan:c)(String(_25));
}
if(!n.id){
n.id=_1.dnd.getUniqueId();
}
return {node:n,data:_25,type:_26};
};
};
return _1.dnd.Container;
});
