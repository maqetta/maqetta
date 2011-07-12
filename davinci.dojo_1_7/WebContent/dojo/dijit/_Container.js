/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/_Container",["dojo/_base/kernel",".","dojo/_base/array","dojo/_base/declare","dojo/_base/html"],function(_1,_2){
_1.declare("dijit._Container",null,{isContainer:true,buildRendering:function(){
this.inherited(arguments);
if(!this.containerNode){
this.containerNode=this.domNode;
}
},addChild:function(_3,_4){
var _5=this.containerNode;
if(_4&&typeof _4=="number"){
var _6=this.getChildren();
if(_6&&_6.length>=_4){
_5=_6[_4-1].domNode;
_4="after";
}
}
_1.place(_3.domNode,_5,_4);
if(this._started&&!_3._started){
_3.startup();
}
},removeChild:function(_7){
if(typeof _7=="number"){
_7=this.getChildren()[_7];
}
if(_7){
var _8=_7.domNode;
if(_8&&_8.parentNode){
_8.parentNode.removeChild(_8);
}
}
},hasChildren:function(){
return this.getChildren().length>0;
},destroyDescendants:function(_9){
_1.forEach(this.getChildren(),function(_a){
_a.destroyRecursive(_9);
});
},_getSiblingOfChild:function(_b,_c){
var _d=_b.domNode,_e=(_c>0?"nextSibling":"previousSibling");
do{
_d=_d[_e];
}while(_d&&(_d.nodeType!=1||!_2.byNode(_d)));
return _d&&_2.byNode(_d);
},getIndexOfChild:function(_f){
return _1.indexOf(this.getChildren(),_f);
},startup:function(){
if(this._started){
return;
}
_1.forEach(this.getChildren(),function(_10){
_10.startup();
});
this.inherited(arguments);
}});
return _2._Container;
});
