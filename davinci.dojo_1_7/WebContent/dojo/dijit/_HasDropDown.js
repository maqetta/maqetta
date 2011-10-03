//>>built
define("dijit/_HasDropDown",["dojo/_base/declare","dojo/_base/event","dojo/dom","dojo/dom-attr","dojo/dom-class","dojo/dom-geometry","dojo/dom-style","dojo/has","dojo/keys","dojo/_base/lang","dojo/touch","dojo/_base/window","dojo/window","./registry","./focus","./popup","./_FocusMixin"],function(_1,_2,_3,_4,_5,_6,_7,_8,_9,_a,_b,_c,_d,_e,_f,_10,_11){
return _1("dijit._HasDropDown",_11,{_buttonNode:null,_arrowWrapperNode:null,_popupStateNode:null,_aroundNode:null,dropDown:null,autoWidth:true,forceWidth:false,maxHeight:0,dropDownPosition:["below","above"],_stopClickEvents:true,_onDropDownMouseDown:function(e){
if(this.disabled||this.readOnly){
return;
}
_2.stop(e);
this._docHandler=this.connect(_c.doc,_b.release,"_onDropDownMouseUp");
this.toggleDropDown();
},_onDropDownMouseUp:function(e){
if(e&&this._docHandler){
this.disconnect(this._docHandler);
}
var _12=this.dropDown,_13=false;
if(e&&this._opened){
var c=_6.position(this._buttonNode,true);
if(!(e.pageX>=c.x&&e.pageX<=c.x+c.w)||!(e.pageY>=c.y&&e.pageY<=c.y+c.h)){
var t=e.target;
while(t&&!_13){
if(_5.contains(t,"dijitPopup")){
_13=true;
}else{
t=t.parentNode;
}
}
if(_13){
t=e.target;
if(_12.onItemClick){
var _14;
while(t&&!(_14=_e.byNode(t))){
t=t.parentNode;
}
if(_14&&_14.onClick&&_14.getParent){
_14.getParent().onItemClick(_14,e);
}
}
return;
}
}
}
if(this._opened){
if(_12.focus&&_12.autoFocus!==false){
window.setTimeout(_a.hitch(_12,"focus"),1);
}
}else{
setTimeout(_a.hitch(this,"focus"),0);
}
if(_8("ios")){
this._justGotMouseUp=true;
setTimeout(_a.hitch(this,function(){
this._justGotMouseUp=false;
}),0);
}
},_onDropDownClick:function(e){
if(_8("ios")&&!this._justGotMouseUp){
this._onDropDownMouseDown(e);
this._onDropDownMouseUp(e);
}
if(this._stopClickEvents){
_2.stop(e);
}
},buildRendering:function(){
this.inherited(arguments);
this._buttonNode=this._buttonNode||this.focusNode||this.domNode;
this._popupStateNode=this._popupStateNode||this.focusNode||this._buttonNode;
var _15={"after":this.isLeftToRight()?"Right":"Left","before":this.isLeftToRight()?"Left":"Right","above":"Up","below":"Down","left":"Left","right":"Right"}[this.dropDownPosition[0]]||this.dropDownPosition[0]||"Down";
_5.add(this._arrowWrapperNode||this._buttonNode,"dijit"+_15+"ArrowButton");
},postCreate:function(){
this.inherited(arguments);
this.connect(this._buttonNode,_b.press,"_onDropDownMouseDown");
this.connect(this._buttonNode,"onclick","_onDropDownClick");
this.connect(this.focusNode,"onkeypress","_onKey");
this.connect(this.focusNode,"onkeyup","_onKeyUp");
},destroy:function(){
if(this.dropDown){
if(!this.dropDown._destroyed){
this.dropDown.destroyRecursive();
}
delete this.dropDown;
}
this.inherited(arguments);
},_onKey:function(e){
if(this.disabled||this.readOnly){
return;
}
var d=this.dropDown,_16=e.target;
if(d&&this._opened&&d.handleKey){
if(d.handleKey(e)===false){
_2.stop(e);
return;
}
}
if(d&&this._opened&&e.charOrCode==_9.ESCAPE){
this.closeDropDown();
_2.stop(e);
}else{
if(!this._opened&&(e.charOrCode==_9.DOWN_ARROW||((e.charOrCode==_9.ENTER||e.charOrCode==" ")&&((_16.tagName||"").toLowerCase()!=="input"||(_16.type&&_16.type.toLowerCase()!=="text"))))){
this._toggleOnKeyUp=true;
_2.stop(e);
}
}
},_onKeyUp:function(){
if(this._toggleOnKeyUp){
delete this._toggleOnKeyUp;
this.toggleDropDown();
var d=this.dropDown;
if(d&&d.focus){
setTimeout(_a.hitch(d,"focus"),1);
}
}
},_onBlur:function(){
var _17=_f.curNode&&this.dropDown&&_3.isDescendant(_f.curNode,this.dropDown.domNode);
this.closeDropDown(_17);
this.inherited(arguments);
},isLoaded:function(){
return true;
},loadDropDown:function(_18){
_18();
},toggleDropDown:function(){
if(this.disabled||this.readOnly){
return;
}
if(!this._opened){
if(!this.isLoaded()){
this.loadDropDown(_a.hitch(this,"openDropDown"));
}else{
this.openDropDown();
}
}else{
this.closeDropDown();
}
},openDropDown:function(){
var _19=this.dropDown,_1a=_19.domNode,_1b=this._aroundNode||this.domNode,_1c=this;
if(!this._preparedNode){
this._preparedNode=true;
if(_1a.style.width){
this._explicitDDWidth=true;
}
if(_1a.style.height){
this._explicitDDHeight=true;
}
}
if(this.maxHeight||this.forceWidth||this.autoWidth){
var _1d={display:"",visibility:"hidden"};
if(!this._explicitDDWidth){
_1d.width="";
}
if(!this._explicitDDHeight){
_1d.height="";
}
_7.set(_1a,_1d);
var _1e=this.maxHeight;
if(_1e==-1){
var _1f=_d.getBox(),_20=_6.position(_1b,false);
_1e=Math.floor(Math.max(_20.y,_1f.h-(_20.y+_20.h)));
}
_10.moveOffScreen(_19);
if(_19.startup&&!_19._started){
_19.startup();
}
var mb=_6.getMarginSize(_1a);
var _21=(_1e&&mb.h>_1e);
_7.set(_1a,{overflowX:"hidden",overflowY:_21?"auto":"hidden"});
if(_21){
mb.h=_1e;
if("w" in mb){
mb.w+=16;
}
}else{
delete mb.h;
}
if(this.forceWidth){
mb.w=_1b.offsetWidth;
}else{
if(this.autoWidth){
mb.w=Math.max(mb.w,_1b.offsetWidth);
}else{
delete mb.w;
}
}
if(_a.isFunction(_19.resize)){
_19.resize(mb);
}else{
_6.setMarginBox(_1a,mb);
}
}
var _22=_10.open({parent:this,popup:_19,around:_1b,orient:this.dropDownPosition,onExecute:function(){
_1c.closeDropDown(true);
},onCancel:function(){
_1c.closeDropDown(true);
},onClose:function(){
_4.set(_1c._popupStateNode,"popupActive",false);
_5.remove(_1c._popupStateNode,"dijitHasDropDownOpen");
_1c._opened=false;
}});
_4.set(this._popupStateNode,"popupActive","true");
_5.add(_1c._popupStateNode,"dijitHasDropDownOpen");
this._opened=true;
return _22;
},closeDropDown:function(_23){
if(this._opened){
if(_23){
this.focus();
}
_10.close(this.dropDown);
this._opened=false;
}
}});
});
