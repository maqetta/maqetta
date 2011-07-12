/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/layout/FloatingPane",["dojo","dijit","dojox","dojo/window","dijit/_Templated","dijit/_Widget","dijit/BackgroundIframe","dojo/dnd/Moveable","dojox/layout/ContentPane","dojox/layout/ResizeHandle"],function(_1,_2,_3){
_1.getObject("dojox.layout.FloatingPane",1);
_1.experimental("dojox.layout.FloatingPane");
_1.declare("dojox.layout.FloatingPane",[_3.layout.ContentPane,_2._Templated],{closable:true,dockable:true,resizable:false,maxable:false,resizeAxis:"xy",title:"",dockTo:"",duration:400,contentClass:"dojoxFloatingPaneContent",_showAnim:null,_hideAnim:null,_dockNode:null,_restoreState:{},_allFPs:[],_startZ:100,templateString:_1.cache("dojox.layout","resources/FloatingPane.html","<div class=\"dojoxFloatingPane\" id=\"${id}\">\n\t<div tabindex=\"0\" role=\"button\" class=\"dojoxFloatingPaneTitle\" dojoAttachPoint=\"focusNode\">\n\t\t<span dojoAttachPoint=\"closeNode\" dojoAttachEvent=\"onclick: close\" class=\"dojoxFloatingCloseIcon\"></span>\n\t\t<span dojoAttachPoint=\"maxNode\" dojoAttachEvent=\"onclick: maximize\" class=\"dojoxFloatingMaximizeIcon\">&thinsp;</span>\n\t\t<span dojoAttachPoint=\"restoreNode\" dojoAttachEvent=\"onclick: _restore\" class=\"dojoxFloatingRestoreIcon\">&thinsp;</span>\t\n\t\t<span dojoAttachPoint=\"dockNode\" dojoAttachEvent=\"onclick: minimize\" class=\"dojoxFloatingMinimizeIcon\">&thinsp;</span>\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dijitInline dijitTitleNode\"></span>\n\t</div>\n\t<div dojoAttachPoint=\"canvas\" class=\"dojoxFloatingPaneCanvas\">\n\t\t<div dojoAttachPoint=\"containerNode\" role=\"region\" tabindex=\"-1\" class=\"${contentClass}\">\n\t\t</div>\n\t\t<span dojoAttachPoint=\"resizeHandle\" class=\"dojoxFloatingResizeHandle\"></span>\n\t</div>\n</div>\n"),attributeMap:_1.delegate(_2._Widget.prototype.attributeMap,{title:{type:"innerHTML",node:"titleNode"}}),postCreate:function(){
this.inherited(arguments);
new _1.dnd.Moveable(this.domNode,{handle:this.focusNode});
if(!this.dockable){
this.dockNode.style.display="none";
}
if(!this.closable){
this.closeNode.style.display="none";
}
if(!this.maxable){
this.maxNode.style.display="none";
this.restoreNode.style.display="none";
}
if(!this.resizable){
this.resizeHandle.style.display="none";
}else{
this.domNode.style.width=_1.marginBox(this.domNode).w+"px";
}
this._allFPs.push(this);
this.domNode.style.position="absolute";
this.bgIframe=new _2.BackgroundIframe(this.domNode);
this._naturalState=_1.coords(this.domNode);
},startup:function(){
if(this._started){
return;
}
this.inherited(arguments);
if(this.resizable){
if(_1.isIE){
this.canvas.style.overflow="auto";
}else{
this.containerNode.style.overflow="auto";
}
this._resizeHandle=new _3.layout.ResizeHandle({targetId:this.id,resizeAxis:this.resizeAxis},this.resizeHandle);
}
if(this.dockable){
var _4=this.dockTo;
if(this.dockTo){
this.dockTo=_2.byId(this.dockTo);
}else{
this.dockTo=_2.byId("dojoxGlobalFloatingDock");
}
if(!this.dockTo){
var _5,_6;
if(_4){
_5=_4;
_6=_1.byId(_4);
}else{
_6=_1.create("div",null,_1.body());
_1.addClass(_6,"dojoxFloatingDockDefault");
_5="dojoxGlobalFloatingDock";
}
this.dockTo=new _3.layout.Dock({id:_5,autoPosition:"south"},_6);
this.dockTo.startup();
}
if((this.domNode.style.display=="none")||(this.domNode.style.visibility=="hidden")){
this.minimize();
}
}
this.connect(this.focusNode,"onmousedown","bringToTop");
this.connect(this.domNode,"onmousedown","bringToTop");
this.resize(_1.coords(this.domNode));
this._started=true;
},setTitle:function(_7){
_1.deprecated("pane.setTitle","Use pane.set('title', someTitle)","2.0");
this.set("title",_7);
},close:function(){
if(!this.closable){
return;
}
_1.unsubscribe(this._listener);
this.hide(_1.hitch(this,function(){
this.destroyRecursive();
}));
},hide:function(_8){
_1.fadeOut({node:this.domNode,duration:this.duration,onEnd:_1.hitch(this,function(){
this.domNode.style.display="none";
this.domNode.style.visibility="hidden";
if(this.dockTo&&this.dockable){
this.dockTo._positionDock(null);
}
if(_8){
_8();
}
})}).play();
},show:function(_9){
var _a=_1.fadeIn({node:this.domNode,duration:this.duration,beforeBegin:_1.hitch(this,function(){
this.domNode.style.display="";
this.domNode.style.visibility="visible";
if(this.dockTo&&this.dockable){
this.dockTo._positionDock(null);
}
if(typeof _9=="function"){
_9();
}
this._isDocked=false;
if(this._dockNode){
this._dockNode.destroy();
this._dockNode=null;
}
})}).play();
this.resize(_1.coords(this.domNode));
this._onShow();
},minimize:function(){
if(!this._isDocked){
this.hide(_1.hitch(this,"_dock"));
}
},maximize:function(){
if(this._maximized){
return;
}
this._naturalState=_1.position(this.domNode);
if(this._isDocked){
this.show();
setTimeout(_1.hitch(this,"maximize"),this.duration);
}
_1.addClass(this.focusNode,"floatingPaneMaximized");
this.resize(_1.window.getBox());
this._maximized=true;
},_restore:function(){
if(this._maximized){
this.resize(this._naturalState);
_1.removeClass(this.focusNode,"floatingPaneMaximized");
this._maximized=false;
}
},_dock:function(){
if(!this._isDocked&&this.dockable){
this._dockNode=this.dockTo.addNode(this);
this._isDocked=true;
}
},resize:function(_b){
_b=_b||this._naturalState;
this._currentState=_b;
var _c=this.domNode.style;
if("t" in _b){
_c.top=_b.t+"px";
}
if("l" in _b){
_c.left=_b.l+"px";
}
_c.width=_b.w+"px";
_c.height=_b.h+"px";
var _d={l:0,t:0,w:_b.w,h:(_b.h-this.focusNode.offsetHeight)};
_1.marginBox(this.canvas,_d);
this._checkIfSingleChild();
if(this._singleChild&&this._singleChild.resize){
this._singleChild.resize(_d);
}
},bringToTop:function(){
var _e=_1.filter(this._allFPs,function(i){
return i!==this;
},this);
_e.sort(function(a,b){
return a.domNode.style.zIndex-b.domNode.style.zIndex;
});
_e.push(this);
_1.forEach(_e,function(w,x){
w.domNode.style.zIndex=this._startZ+(x*2);
_1.removeClass(w.domNode,"dojoxFloatingPaneFg");
},this);
_1.addClass(this.domNode,"dojoxFloatingPaneFg");
},destroy:function(){
this._allFPs.splice(_1.indexOf(this._allFPs,this),1);
if(this._resizeHandle){
this._resizeHandle.destroy();
}
this.inherited(arguments);
}});
_1.declare("dojox.layout.Dock",[_2._Widget,_2._Templated],{templateString:"<div class=\"dojoxDock\"><ul dojoAttachPoint=\"containerNode\" class=\"dojoxDockList\"></ul></div>",_docked:[],_inPositioning:false,autoPosition:false,addNode:function(_f){
var div=_1.create("li",null,this.containerNode),_10=new _3.layout._DockNode({title:_f.title,paneRef:_f},div);
_10.startup();
return _10;
},startup:function(){
if(this.id=="dojoxGlobalFloatingDock"||this.isFixedDock){
this.connect(window,"onresize","_positionDock");
this.connect(window,"onscroll","_positionDock");
if(_1.isIE){
this.connect(this.domNode,"onresize","_positionDock");
}
}
this._positionDock(null);
this.inherited(arguments);
},_positionDock:function(e){
if(!this._inPositioning){
if(this.autoPosition=="south"){
setTimeout(_1.hitch(this,function(){
this._inPositiononing=true;
var _11=_1.window.getBox();
var s=this.domNode.style;
s.left=_11.l+"px";
s.width=(_11.w-2)+"px";
s.top=(_11.h+_11.t)-this.domNode.offsetHeight+"px";
this._inPositioning=false;
}),125);
}
}
}});
_1.declare("dojox.layout._DockNode",[_2._Widget,_2._Templated],{title:"",paneRef:null,templateString:"<li dojoAttachEvent=\"onclick: restore\" class=\"dojoxDockNode\">"+"<span dojoAttachPoint=\"restoreNode\" class=\"dojoxDockRestoreButton\" dojoAttachEvent=\"onclick: restore\"></span>"+"<span class=\"dojoxDockTitleNode\" dojoAttachPoint=\"titleNode\">${title}</span>"+"</li>",restore:function(){
this.paneRef.show();
this.paneRef.bringToTop();
this.destroy();
}});
return _1.getObject("dojox.layout.FloatingPane");
});
require(["dojox/layout/FloatingPane"]);
