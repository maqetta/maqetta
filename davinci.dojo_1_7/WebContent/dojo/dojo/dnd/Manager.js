/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/dnd/Manager",["../main","./common","./autoscroll","./Avatar"],function(_1){
_1.declare("dojo.dnd.Manager",null,{constructor:function(){
this.avatar=null;
this.source=null;
this.nodes=[];
this.copy=true;
this.target=null;
this.canDropFlag=false;
this.events=[];
},OFFSET_X:16,OFFSET_Y:16,overSource:function(_2){
if(this.avatar){
this.target=(_2&&_2.targetState!="Disabled")?_2:null;
this.canDropFlag=Boolean(this.target);
this.avatar.update();
}
_1.publish("/dnd/source/over",[_2]);
},outSource:function(_3){
if(this.avatar){
if(this.target==_3){
this.target=null;
this.canDropFlag=false;
this.avatar.update();
_1.publish("/dnd/source/over",[null]);
}
}else{
_1.publish("/dnd/source/over",[null]);
}
},startDrag:function(_4,_5,_6){
this.source=_4;
this.nodes=_5;
this.copy=Boolean(_6);
this.avatar=this.makeAvatar();
_1.body().appendChild(this.avatar.node);
_1.publish("/dnd/start",[_4,_5,this.copy]);
this.events=[_1.connect(_1.doc,"onmousemove",this,"onMouseMove"),_1.connect(_1.doc,"onmouseup",this,"onMouseUp"),_1.connect(_1.doc,"onkeydown",this,"onKeyDown"),_1.connect(_1.doc,"onkeyup",this,"onKeyUp"),_1.connect(_1.doc,"ondragstart",_1.stopEvent),_1.connect(_1.body(),"onselectstart",_1.stopEvent)];
var c="dojoDnd"+(_6?"Copy":"Move");
_1.addClass(_1.body(),c);
},canDrop:function(_7){
var _8=Boolean(this.target&&_7);
if(this.canDropFlag!=_8){
this.canDropFlag=_8;
this.avatar.update();
}
},stopDrag:function(){
_1.removeClass(_1.body(),["dojoDndCopy","dojoDndMove"]);
_1.forEach(this.events,_1.disconnect);
this.events=[];
this.avatar.destroy();
this.avatar=null;
this.source=this.target=null;
this.nodes=[];
},makeAvatar:function(){
return new _1.dnd.Avatar(this);
},updateAvatar:function(){
this.avatar.update();
},onMouseMove:function(e){
var a=this.avatar;
if(a){
_1.dnd.autoScrollNodes(e);
var s=a.node.style;
s.left=(e.pageX+this.OFFSET_X)+"px";
s.top=(e.pageY+this.OFFSET_Y)+"px";
var _9=Boolean(this.source.copyState(_1.isCopyKey(e)));
if(this.copy!=_9){
this._setCopyStatus(_9);
}
}
},onMouseUp:function(e){
if(this.avatar){
if(this.target&&this.canDropFlag){
var _a=Boolean(this.source.copyState(_1.isCopyKey(e))),_b=[this.source,this.nodes,_a,this.target,e];
_1.publish("/dnd/drop/before",_b);
_1.publish("/dnd/drop",_b);
}else{
_1.publish("/dnd/cancel");
}
this.stopDrag();
}
},onKeyDown:function(e){
if(this.avatar){
switch(e.keyCode){
case _1.keys.CTRL:
var _c=Boolean(this.source.copyState(true));
if(this.copy!=_c){
this._setCopyStatus(_c);
}
break;
case _1.keys.ESCAPE:
_1.publish("/dnd/cancel");
this.stopDrag();
break;
}
}
},onKeyUp:function(e){
if(this.avatar&&e.keyCode==_1.keys.CTRL){
var _d=Boolean(this.source.copyState(false));
if(this.copy!=_d){
this._setCopyStatus(_d);
}
}
},_setCopyStatus:function(_e){
this.copy=_e;
this.source._markDndStatus(this.copy);
this.updateAvatar();
_1.replaceClass(_1.body(),"dojoDnd"+(this.copy?"Copy":"Move"),"dojoDnd"+(this.copy?"Move":"Copy"));
}});
_1.dnd._manager=null;
_1.dnd.manager=function(){
if(!_1.dnd._manager){
_1.dnd._manager=new _1.dnd.Manager();
}
return _1.dnd._manager;
};
return _1.dnd.Manager;
});
