/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/mobile/TabBar",["dojo/_base/kernel","dojo/_base/declare","dojo/_base/array","dojo/_base/html","./common","dijit/_WidgetBase","dijit/_Container","dijit/_Contained","./Heading","./_ItemBase","./TabBarButton"],function(_1,_2,_3,_4,_5,_6,_7,_8,_9,_a){
return _1.declare("dojox.mobile.TabBar",[dijit._WidgetBase,dijit._Container,dijit._Contained],{iconBase:"",iconPos:"",barType:"tabBar",inHeading:false,tag:"UL",_fixedButtonWidth:76,_fixedButtonMargin:17,_largeScreenWidth:500,buildRendering:function(){
this._clsName=this.barType=="segmentedControl"?"mblTabButton":"mblTabBarButton";
this.domNode=this.containerNode=this.srcNodeRef||_1.create(this.tag);
this.domNode.className=this.barType=="segmentedControl"?"mblTabPanelHeader":"mblTabBar";
},startup:function(){
if(this._started){
return;
}
var _b=this;
setTimeout(function(){
_b.resize();
},0);
this.inherited(arguments);
},resize:function(_c){
var i,w;
if(_c&&_c.w){
_1.marginBox(this.domNode,_c);
w=_c.w;
}else{
w=_1.style(this.domNode,"position")==="absolute"?_1.contentBox(this.domNode).w:_1.marginBox(this.domNode).w;
}
var bw=this._fixedButtonWidth;
var bm=this._fixedButtonMargin;
var _d=this.containerNode.childNodes;
var _e=[];
for(i=0;i<_d.length;i++){
var c=_d[i];
if(c.nodeType!=1){
continue;
}
if(_1.hasClass(c,this._clsName)){
_e.push(c);
}
}
var _f;
if(this.barType=="segmentedControl"){
_f=w;
var _10=0;
for(i=0;i<_e.length;i++){
_f-=_1.marginBox(_e[i]).w;
_10+=_e[i].offsetWidth;
}
_f=Math.floor(_f/2);
var _11=this.getParent();
var _12=this.inHeading||_11 instanceof dojox.mobile.Heading;
this.containerNode.style.padding=(_12?0:3)+"px 0px 0px "+(_12?0:_f)+"px";
if(_12){
_1.style(this.domNode,{background:"none",border:"none",width:_10+2+"px"});
}
}else{
_f=Math.floor((w-(bw+bm*2)*_e.length)/2);
if(w<this._largeScreenWidth||_f<0){
for(i=0;i<_e.length;i++){
_e[i].style.width=Math.round(98/_e.length)+"%";
_e[i].style.margin="0px";
}
this.containerNode.style.padding="0px 0px 0px 1%";
}else{
for(i=0;i<_e.length;i++){
_e[i].style.width=bw+"px";
_e[i].style.margin="0 "+bm+"px";
}
this.containerNode.style.padding="0px 0px 0px "+_f+"px";
}
}
if(!_1.some(this.getChildren(),function(_13){
return _13.iconNode1;
})){
_1.addClass(this.domNode,"mblTabBarNoIcons");
}
if(!_1.some(this.getChildren(),function(_14){
return _14.label;
})){
_1.addClass(this.domNode,"mblTabBarNoText");
}
}});
});
