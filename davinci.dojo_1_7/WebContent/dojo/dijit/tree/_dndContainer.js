/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/tree/_dndContainer",["dojo/_base/kernel","..","dojo/dnd/common","dojo/dnd/Container","dojo/_base/array","dojo/_base/connect","dojo/_base/declare","dojo/_base/html"],function(_1,_2){
_1.getObject("tree",true,_2);
_2.tree._compareNodes=function(n1,n2){
if(n1===n2){
return 0;
}
if("sourceIndex" in document.documentElement){
return n1.sourceIndex-n2.sourceIndex;
}else{
if("compareDocumentPosition" in document.documentElement){
return n1.compareDocumentPosition(n2)&2?1:-1;
}else{
if(document.createRange){
var r1=doc.createRange();
r1.setStartBefore(n1);
var r2=doc.createRange();
r2.setStartBefore(n2);
return r1.compareBoundaryPoints(r1.END_TO_END,r2);
}else{
throw Error("dijit.tree._compareNodes don't know how to compare two different nodes in this browser");
}
}
}
};
_1.declare("dijit.tree._dndContainer",null,{constructor:function(_3,_4){
this.tree=_3;
this.node=_3.domNode;
_1.mixin(this,_4);
this.map={};
this.current=null;
this.containerState="";
_1.addClass(this.node,"dojoDndContainer");
this.events=[_1.connect(this.node,"onmouseenter",this,"onOverEvent"),_1.connect(this.node,"onmouseleave",this,"onOutEvent"),_1.connect(this.tree,"_onNodeMouseEnter",this,"onMouseOver"),_1.connect(this.tree,"_onNodeMouseLeave",this,"onMouseOut"),_1.connect(this.node,"ondragstart",_1,"stopEvent"),_1.connect(this.node,"onselectstart",_1,"stopEvent")];
},getItem:function(_5){
var _6=this.selection[_5];
return {data:_6,type:["treeNode"]};
},destroy:function(){
_1.forEach(this.events,_1.disconnect);
this.node=this.parent=null;
},onMouseOver:function(_7,_8){
this.current=_7;
},onMouseOut:function(_9,_a){
this.current=null;
},_changeState:function(_b,_c){
var _d="dojoDnd"+_b;
var _e=_b.toLowerCase()+"State";
_1.replaceClass(this.node,_d+_c,_d+this[_e]);
this[_e]=_c;
},_addItemClass:function(_f,_10){
_1.addClass(_f,"dojoDndItem"+_10);
},_removeItemClass:function(_11,_12){
_1.removeClass(_11,"dojoDndItem"+_12);
},onOverEvent:function(){
this._changeState("Container","Over");
},onOutEvent:function(){
this._changeState("Container","");
}});
return _2.tree._dndContainer;
});
