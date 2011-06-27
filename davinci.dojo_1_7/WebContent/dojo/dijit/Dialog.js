/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
require.cache["dijit/templates/Dialog.html"]="<div class=\"dijitDialog\" role=\"dialog\" aria-labelledby=\"${id}_title\">\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\">\n\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\" id=\"${id}_title\"></span>\n\t<span dojoAttachPoint=\"closeButtonNode\" class=\"dijitDialogCloseIcon\" dojoAttachEvent=\"ondijitclick: onCancel\" title=\"${buttonCancel}\" role=\"button\" tabIndex=\"-1\">\n\t\t<span dojoAttachPoint=\"closeText\" class=\"closeText\" title=\"${buttonCancel}\">x</span>\n\t</span>\n\t</div>\n\t\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\"></div>\n</div>\n";
define("dijit/Dialog",["dojo/_base/kernel",".","dijit/focus","dojo/text!./templates/Dialog.html","require","./_Widget","./_TemplatedMixin","./_CssStateMixin","./form/_FormMixin","./_DialogMixin","./DialogUnderlay","./layout/ContentPane","./focus","dojo/i18n!./nls/common","dojo/_base/Deferred","dojo/_base/array","dojo/_base/connect","dojo/_base/declare","dojo/_base/event","dojo/_base/fx","dojo/_base/html","dojo/_base/lang","dojo/_base/sniff","dojo/_base/window","dojo/window","dojo/dnd/Moveable","dojo/dnd/TimedMoveable","dojo/i18n"],function(_1,_2,_3,_4,_5){
_1.declare("dijit._DialogBase",[_2._TemplatedMixin,_2.form._FormMixin,_2._DialogMixin,_2._CssStateMixin],{templateString:_4,baseClass:"dijitDialog",cssStateNodes:{closeButtonNode:"dijitDialogCloseIcon"},_setTitleAttr:[{node:"titleNode",type:"innerHTML"},{node:"titleBar",type:"attribute"}],open:false,duration:_2.defaultDuration,refocus:true,autofocus:true,_firstFocusItem:null,_lastFocusItem:null,doLayout:false,draggable:true,"aria-describedby":"",postMixInProperties:function(){
var _6=_1.i18n.getLocalization("dijit","common");
_1.mixin(this,_6);
this.inherited(arguments);
},postCreate:function(){
_1.style(this.domNode,{display:"none",position:"absolute"});
_1.body().appendChild(this.domNode);
this.inherited(arguments);
this.connect(this,"onExecute","hide");
this.connect(this,"onCancel","hide");
this._modalconnects=[];
},onLoad:function(){
this._position();
if(this.autofocus&&_2._DialogLevelManager.isTop(this)){
this._getFocusItems(this.domNode);
_2.focus(this._firstFocusItem);
}
this.inherited(arguments);
},_endDrag:function(){
var _7=_1.position(this.domNode),_8=_1.window.getBox();
_7.y=Math.min(Math.max(_7.y,0),(_8.h-_7.h));
_7.x=Math.min(Math.max(_7.x,0),(_8.w-_7.w));
this._relativePosition=_7;
this._position();
},_setup:function(){
var _9=this.domNode;
if(this.titleBar&&this.draggable){
this._moveable=(_1.isIE==6)?new _1.dnd.TimedMoveable(_9,{handle:this.titleBar}):new _1.dnd.Moveable(_9,{handle:this.titleBar,timeout:0});
this.connect(this._moveable,"onMoveStop","_endDrag");
}else{
_1.addClass(_9,"dijitDialogFixed");
}
this.underlayAttrs={dialogId:this.id,"class":_1.map(this["class"].split(/\s/),function(s){
return s+"_underlay";
}).join(" ")};
},_size:function(){
this._checkIfSingleChild();
if(this._singleChild){
if(this._singleChildOriginalStyle){
this._singleChild.domNode.style.cssText=this._singleChildOriginalStyle;
}
delete this._singleChildOriginalStyle;
}else{
_1.style(this.containerNode,{width:"auto",height:"auto"});
}
var bb=_1.position(this.domNode);
var _a=_1.window.getBox();
if(bb.w>=_a.w||bb.h>=_a.h){
var w=Math.min(bb.w,Math.floor(_a.w*0.75)),h=Math.min(bb.h,Math.floor(_a.h*0.75));
if(this._singleChild&&this._singleChild.resize){
this._singleChildOriginalStyle=this._singleChild.domNode.style.cssText;
this._singleChild.resize({w:w,h:h});
}else{
_1.style(this.containerNode,{width:w+"px",height:h+"px",overflow:"auto",position:"relative"});
}
}else{
if(this._singleChild&&this._singleChild.resize){
this._singleChild.resize();
}
}
},_position:function(){
if(!_1.hasClass(_1.body(),"dojoMove")){
var _b=this.domNode,_c=_1.window.getBox(),p=this._relativePosition,bb=p?null:_1.position(_b),l=Math.floor(_c.l+(p?p.x:(_c.w-bb.w)/2)),t=Math.floor(_c.t+(p?p.y:(_c.h-bb.h)/2));
_1.style(_b,{left:l+"px",top:t+"px"});
}
},_onKey:function(_d){
if(_d.charOrCode){
var dk=_1.keys;
var _e=_d.target;
if(_d.charOrCode===dk.TAB){
this._getFocusItems(this.domNode);
}
var _f=(this._firstFocusItem==this._lastFocusItem);
if(_e==this._firstFocusItem&&_d.shiftKey&&_d.charOrCode===dk.TAB){
if(!_f){
_2.focus(this._lastFocusItem);
}
_1.stopEvent(_d);
}else{
if(_e==this._lastFocusItem&&_d.charOrCode===dk.TAB&&!_d.shiftKey){
if(!_f){
_2.focus(this._firstFocusItem);
}
_1.stopEvent(_d);
}else{
while(_e){
if(_e==this.domNode||_1.hasClass(_e,"dijitPopup")){
if(_d.charOrCode==dk.ESCAPE){
this.onCancel();
}else{
return;
}
}
_e=_e.parentNode;
}
if(_d.charOrCode!==dk.TAB){
_1.stopEvent(_d);
}else{
if(!_1.isOpera){
try{
this._firstFocusItem.focus();
}
catch(e){
}
}
}
}
}
}
},show:function(){
if(this.open){
return;
}
if(!this._started){
this.startup();
}
if(!this._alreadyInitialized){
this._setup();
this._alreadyInitialized=true;
}
if(this._fadeOutDeferred){
this._fadeOutDeferred.cancel();
}
this._modalconnects.push(_1.connect(window,"onscroll",this,"layout"));
this._modalconnects.push(_1.connect(window,"onresize",this,function(){
var _10=_1.window.getBox();
if(!this._oldViewport||_10.h!=this._oldViewport.h||_10.w!=this._oldViewport.w){
this.layout();
this._oldViewport=_10;
}
}));
this._modalconnects.push(_1.connect(this.domNode,"onkeypress",this,"_onKey"));
_1.style(this.domNode,{opacity:0,display:""});
this._set("open",true);
this._onShow();
this._size();
this._position();
var _11;
this._fadeInDeferred=new _1.Deferred(_1.hitch(this,function(){
_11.stop();
delete this._fadeInDeferred;
}));
_11=_1.fadeIn({node:this.domNode,duration:this.duration,beforeBegin:_1.hitch(this,function(){
_2._DialogLevelManager.show(this,this.underlayAttrs);
}),onEnd:_1.hitch(this,function(){
if(this.autofocus&&_2._DialogLevelManager.isTop(this)){
this._getFocusItems(this.domNode);
_2.focus(this._firstFocusItem);
}
this._fadeInDeferred.callback(true);
delete this._fadeInDeferred;
})}).play();
return this._fadeInDeferred;
},hide:function(){
if(!this._alreadyInitialized){
return;
}
if(this._fadeInDeferred){
this._fadeInDeferred.cancel();
}
var _12;
this._fadeOutDeferred=new _1.Deferred(_1.hitch(this,function(){
_12.stop();
delete this._fadeOutDeferred;
}));
this._fadeOutDeferred.then(_1.hitch(this,"onHide"));
_12=_1.fadeOut({node:this.domNode,duration:this.duration,onEnd:_1.hitch(this,function(){
this.domNode.style.display="none";
_2._DialogLevelManager.hide(this);
this._fadeOutDeferred.callback(true);
delete this._fadeOutDeferred;
})}).play();
if(this._scrollConnected){
this._scrollConnected=false;
}
_1.forEach(this._modalconnects,_1.disconnect);
this._modalconnects=[];
if(this._relativePosition){
delete this._relativePosition;
}
this._set("open",false);
return this._fadeOutDeferred;
},layout:function(){
if(this.domNode.style.display!="none"){
if(_2._underlay){
_2._underlay.layout();
}
this._position();
}
},destroy:function(){
if(this._fadeInDeferred){
this._fadeInDeferred.cancel();
}
if(this._fadeOutDeferred){
this._fadeOutDeferred.cancel();
}
if(this._moveable){
this._moveable.destroy();
}
_1.forEach(this._modalconnects,_1.disconnect);
_2._DialogLevelManager.hide(this);
this.inherited(arguments);
}});
_1.declare("dijit.Dialog",[_2.layout.ContentPane,_2._DialogBase],{});
_2._DialogLevelManager={show:function(_13,_14){
var ds=_2._dialogStack;
ds[ds.length-1].focus=_3.curNode;
var _15=_2._underlay;
if(!_15||_15._destroyed){
_15=_2._underlay=new _2.DialogUnderlay(_14);
}else{
_15.set(_13.underlayAttrs);
}
var _16=ds[ds.length-1].dialog?ds[ds.length-1].zIndex+2:950;
if(ds.length==1){
_15.show();
}
_1.style(_2._underlay.domNode,"zIndex",_16-1);
_1.style(_13.domNode,"zIndex",_16);
ds.push({dialog:_13,underlayAttrs:_14,zIndex:_16});
},hide:function(_17){
var ds=_2._dialogStack;
if(ds[ds.length-1].dialog==_17){
ds.pop();
var pd=ds[ds.length-1];
if(ds.length==1){
if(!_2._underlay._destroyed){
_2._underlay.hide();
}
}else{
_1.style(_2._underlay.domNode,"zIndex",pd.zIndex-1);
_2._underlay.set(pd.underlayAttrs);
}
if(_17.refocus){
var _18=pd.focus;
if(pd.dialog&&(!_18||!_1.isDescendant(_18,pd.dialog.domNode))){
pd.dialog._getFocusItems(pd.dialog.domNode);
_18=pd.dialog._firstFocusItem;
}
if(_18){
_18.focus();
}
}
}else{
var idx=_1.indexOf(_1.map(ds,function(_19){
return _19.dialog;
}),_17);
if(idx!=-1){
ds.splice(idx,1);
}
}
},isTop:function(_1a){
var ds=_2._dialogStack;
return ds[ds.length-1].dialog==_1a;
}};
_2._dialogStack=[{dialog:null,focus:null,underlayAttrs:null}];
if(!_1.isAsync){
_1.ready(0,function(){
var _1b=["dijit/TooltipDialog"];
_5(_1b);
});
}
return _2.Dialog;
});
