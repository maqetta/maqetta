/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/Menu",["dojo/_base/kernel",".","./popup","require","dojo/window","./DropDownMenu","dojo/_base/array","dojo/_base/connect","dojo/_base/event","dojo/_base/html","dojo/_base/lang","dojo/_base/sniff","dojo/_base/window"],function(_1,_2,pm,_3){
_1.declare("dijit.Menu",_2.DropDownMenu,{constructor:function(){
this._bindings=[];
},targetNodeIds:[],contextMenuForWindow:false,leftClickToOpen:false,refocus:true,postCreate:function(){
if(this.contextMenuForWindow){
this.bindDomNode(_1.body());
}else{
_1.forEach(this.targetNodeIds,this.bindDomNode,this);
}
this.inherited(arguments);
},_iframeContentWindow:function(_4){
return _1.window.get(this._iframeContentDocument(_4))||this._iframeContentDocument(_4)["__parent__"]||(_4.name&&_1.doc.frames[_4.name])||null;
},_iframeContentDocument:function(_5){
return _5.contentDocument||(_5.contentWindow&&_5.contentWindow.document)||(_5.name&&_1.doc.frames[_5.name]&&_1.doc.frames[_5.name].document)||null;
},bindDomNode:function(_6){
_6=_1.byId(_6);
var cn;
if(_6.tagName.toLowerCase()=="iframe"){
var _7=_6,_8=this._iframeContentWindow(_7);
cn=_1.withGlobal(_8,_1.body);
}else{
cn=(_6==_1.body()?_1.doc.documentElement:_6);
}
var _9={node:_6,iframe:_7};
_1.attr(_6,"_dijitMenu"+this.id,this._bindings.push(_9));
var _a=_1.hitch(this,function(cn){
return [_1.connect(cn,this.leftClickToOpen?"onclick":"oncontextmenu",this,function(_b){
_1.stopEvent(_b);
this._scheduleOpen(_b.target,_7,{x:_b.pageX,y:_b.pageY});
}),_1.connect(cn,"onkeydown",this,function(_c){
if(_c.shiftKey&&_c.keyCode==_1.keys.F10){
_1.stopEvent(_c);
this._scheduleOpen(_c.target,_7);
}
})];
});
_9.connects=cn?_a(cn):[];
if(_7){
_9.onloadHandler=_1.hitch(this,function(){
var _d=this._iframeContentWindow(_7);
cn=_1.withGlobal(_d,_1.body);
_9.connects=_a(cn);
});
if(_7.addEventListener){
_7.addEventListener("load",_9.onloadHandler,false);
}else{
_7.attachEvent("onload",_9.onloadHandler);
}
}
},unBindDomNode:function(_e){
var _f;
try{
_f=_1.byId(_e);
}
catch(e){
return;
}
var _10="_dijitMenu"+this.id;
if(_f&&_1.hasAttr(_f,_10)){
var bid=_1.attr(_f,_10)-1,b=this._bindings[bid];
_1.forEach(b.connects,_1.disconnect);
var _11=b.iframe;
if(_11){
if(_11.removeEventListener){
_11.removeEventListener("load",b.onloadHandler,false);
}else{
_11.detachEvent("onload",b.onloadHandler);
}
}
_1.removeAttr(_f,_10);
delete this._bindings[bid];
}
},_scheduleOpen:function(_12,_13,_14){
if(!this._openTimer){
this._openTimer=setTimeout(_1.hitch(this,function(){
delete this._openTimer;
this._openMyself({target:_12,iframe:_13,coords:_14});
}),1);
}
},_openMyself:function(_15){
var _16=_15.target,_17=_15.iframe,_18=_15.coords;
if(_18){
if(_17){
var od=_16.ownerDocument,ifc=_1.position(_17,true),win=this._iframeContentWindow(_17),_19=_1.withGlobal(win,"_docScroll",_1);
var cs=_1.getComputedStyle(_17),tp=_1._toPixelValue,_1a=(_1.isIE&&_1.isQuirks?0:tp(_17,cs.paddingLeft))+(_1.isIE&&_1.isQuirks?tp(_17,cs.borderLeftWidth):0),top=(_1.isIE&&_1.isQuirks?0:tp(_17,cs.paddingTop))+(_1.isIE&&_1.isQuirks?tp(_17,cs.borderTopWidth):0);
_18.x+=ifc.x+_1a-_19.x;
_18.y+=ifc.y+top-_19.y;
}
}else{
_18=_1.position(_16,true);
_18.x+=10;
_18.y+=10;
}
var _1b=this;
var _1c=this._focusManager.get("prevNode");
var _1d=this._focusManager.get("curNode");
var _1e=!_1d||(_1.isDescendant(_1d,this.domNode))?_1c:_1d;
function _1f(){
if(_1b.refocus&&_1e){
_1e.focus();
}
pm.close(_1b);
};
pm.open({popup:this,x:_18.x,y:_18.y,onExecute:_1f,onCancel:_1f,orient:this.isLeftToRight()?"L":"R"});
this.focus();
this._onBlur=function(){
this.inherited("_onBlur",arguments);
pm.close(this);
};
},uninitialize:function(){
_1.forEach(this._bindings,function(b){
if(b){
this.unBindDomNode(b.node);
}
},this);
this.inherited(arguments);
}});
if(!_1.isAsync){
_1.ready(0,function(){
var _20=["dijit/MenuItem","dijit/PopupMenuItem","dijit/CheckedMenuItem","dijit/MenuSeparator"];
_3(_20);
});
}
return _2.Menu;
});
