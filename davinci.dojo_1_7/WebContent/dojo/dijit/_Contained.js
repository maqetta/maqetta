/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/_Contained",["dojo/_base/kernel",".","dojo/_base/declare"],function(_1,_2){
_1.declare("dijit._Contained",null,{getParent:function(){
var _3=_2.getEnclosingWidget(this.domNode.parentNode);
return _3&&_3.isContainer?_3:null;
},_getSibling:function(_4){
var _5=this.domNode;
do{
_5=_5[_4+"Sibling"];
}while(_5&&_5.nodeType!=1);
return _5&&_2.byNode(_5);
},getPreviousSibling:function(){
return this._getSibling("previous");
},getNextSibling:function(){
return this._getSibling("next");
},getIndexInParent:function(){
var p=this.getParent();
if(!p||!p.getIndexOfChild){
return -1;
}
return p.getIndexOfChild(this);
}});
return _2._Contained;
});
