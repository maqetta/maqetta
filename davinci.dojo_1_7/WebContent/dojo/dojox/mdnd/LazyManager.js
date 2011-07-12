/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/mdnd/LazyManager",["dojo/_base/kernel","dojo/dnd/Manager","./PureSource"],function(_1){
return _1.declare("dojox.mdnd.LazyManager",null,{constructor:function(){
this._registry={};
this._fakeSource=new dojox.mdnd.PureSource(_1.create("div"),{"copyOnly":false});
this._fakeSource.startup();
_1.addOnUnload(_1.hitch(this,"destroy"));
this.manager=_1.dnd.manager();
},getItem:function(_2){
var _3=_2.getAttribute("dndType");
return {"data":_2.getAttribute("dndData")||_2.innerHTML,"type":_3?_3.split(/\s*,\s*/):["text"]};
},startDrag:function(e,_4){
_4=_4||e.target;
if(_4){
var m=this.manager,_5=this.getItem(_4);
if(_4.id==""){
_1.attr(_4,"id",_1.dnd.getUniqueId());
}
_1.addClass(_4,"dojoDndItem");
this._fakeSource.setItem(_4.id,_5);
m.startDrag(this._fakeSource,[_4],false);
m.onMouseMove(e);
}
},cancelDrag:function(){
var m=this.manager;
m.target=null;
m.onMouseUp();
},destroy:function(){
this._fakeSource.destroy();
}});
});
