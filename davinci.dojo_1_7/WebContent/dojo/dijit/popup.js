/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/popup",["dojo/_base/kernel",".","./place","./BackgroundIframe","dojo/_base/array","dojo/_base/connect","dojo/_base/declare","dojo/_base/event","dojo/_base/html","dojo/_base/lang","dojo/_base/sniff","dojo/_base/window"],function(_1,_2,_3,_4){
var _5=_1.declare(null,{_stack:[],_beginZIndex:1000,_idGen:1,_createWrapper:function(_6){
var _7=_6._popupWrapper,_8=_6.domNode;
if(!_7){
_7=_1.create("div",{"class":"dijitPopup",style:{display:"none"},role:"presentation"},_1.body());
_7.appendChild(_8);
var s=_8.style;
s.display="";
s.visibility="";
s.position="";
s.top="0px";
_6._popupWrapper=_7;
_1.connect(_6,"destroy",function(){
_1.destroy(_7);
delete _6._popupWrapper;
});
}
return _7;
},moveOffScreen:function(_9){
var _a=this._createWrapper(_9);
_1.style(_a,{visibility:"hidden",top:"-9999px",display:""});
},hide:function(_b){
var _c=this._createWrapper(_b);
_1.style(_c,"display","none");
},getTopPopup:function(){
var _d=this._stack;
for(var pi=_d.length-1;pi>0&&_d[pi].parent===_d[pi-1].widget;pi--){
}
return _d[pi];
},open:function(_e){
var _f=this._stack,_10=_e.popup,_11=_e.orient||["below","below-alt","above","above-alt"],ltr=_e.parent?_e.parent.isLeftToRight():_1._isBodyLtr(),_12=_e.around,id=(_e.around&&_e.around.id)?(_e.around.id+"_dropdown"):("popup_"+this._idGen++);
while(_f.length&&(!_e.parent||!_1.isDescendant(_e.parent.domNode,_f[_f.length-1].widget.domNode))){
this.close(_f[_f.length-1].widget);
}
var _13=this._createWrapper(_10);
_1.attr(_13,{id:id,style:{zIndex:this._beginZIndex+_f.length},"class":"dijitPopup "+(_10.baseClass||_10["class"]||"").split(" ")[0]+"Popup",dijitPopupParent:_e.parent?_e.parent.id:""});
if(_1.isIE||_1.isMoz){
if(!_10.bgIframe){
_10.bgIframe=new _4(_13);
}
}
var _14=_12?_3.around(_13,_12,_11,ltr,_10.orient?_1.hitch(_10,"orient"):null):_3.at(_13,_e,_11=="R"?["TR","BR","TL","BL"]:["TL","BL","TR","BR"],_e.padding);
_13.style.display="";
_13.style.visibility="visible";
_10.domNode.style.visibility="visible";
var _15=[];
_15.push(_1.connect(_13,"onkeypress",this,function(evt){
if(evt.charOrCode==_1.keys.ESCAPE&&_e.onCancel){
_1.stopEvent(evt);
_e.onCancel();
}else{
if(evt.charOrCode===_1.keys.TAB){
_1.stopEvent(evt);
var _16=this.getTopPopup();
if(_16&&_16.onCancel){
_16.onCancel();
}
}
}
}));
if(_10.onCancel&&_e.onCancel){
_15.push(_1.connect(_10,"onCancel",_e.onCancel));
}
_15.push(_1.connect(_10,_10.onExecute?"onExecute":"onChange",this,function(){
var _17=this.getTopPopup();
if(_17&&_17.onExecute){
_17.onExecute();
}
}));
_f.push({widget:_10,parent:_e.parent,onExecute:_e.onExecute,onCancel:_e.onCancel,onClose:_e.onClose,handlers:_15});
if(_10.onOpen){
_10.onOpen(_14);
}
return _14;
},close:function(_18){
var _19=this._stack;
while((_18&&_1.some(_19,function(_1a){
return _1a.widget==_18;
}))||(!_18&&_19.length)){
var top=_19.pop(),_1b=top.widget,_1c=top.onClose;
if(_1b.onClose){
_1b.onClose();
}
_1.forEach(top.handlers,_1.disconnect);
if(_1b&&_1b.domNode){
this.hide(_1b);
}
if(_1c){
_1c();
}
}
}});
_2.popup=new _5();
return _2.popup;
});
