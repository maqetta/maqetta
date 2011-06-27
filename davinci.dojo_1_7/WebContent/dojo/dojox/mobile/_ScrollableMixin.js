/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/mobile/_ScrollableMixin",["dojo/_base/kernel","dojo/_base/declare","dojo/_base/lang","./common","dijit/_WidgetBase","./scrollable"],function(_1,_2,_3,_4,_5,_6){
_1.declare("dojox.mobile._ScrollableMixin",null,{fixedHeader:"",fixedFooter:"",scrollableParams:{},allowNestedScrolls:true,destroy:function(){
this.cleanup();
this.inherited(arguments);
},startup:function(){
if(this._started){
return;
}
var _7;
var _8=this.scrollableParams;
if(this.fixedHeader){
_7=_1.byId(this.fixedHeader);
if(_7.parentNode==this.domNode){
this.isLocalHeader=true;
}
_8.fixedHeaderHeight=_7.offsetHeight;
}
if(this.fixedFooter){
_7=_1.byId(this.fixedFooter);
if(_7.parentNode==this.domNode){
this.isLocalFooter=true;
_7.style.bottom="0px";
}
_8.fixedFooterHeight=_7.offsetHeight;
}
this.init(_8);
if(this.allowNestedScrolls){
for(var p=this.getParent();p;p=p.getParent()){
if(p&&p.scrollableParams){
this.isNested=true;
this.dirLock=true;
p.dirLock=true;
break;
}
}
}
this.inherited(arguments);
},findAppBars:function(){
var i,_9,c;
for(i=0,_9=_1.body().childNodes.length;i<_9;i++){
c=_1.body().childNodes[i];
this.checkFixedBar(c,false);
}
if(this.domNode.parentNode){
for(i=0,_9=this.domNode.parentNode.childNodes.length;i<_9;i++){
c=this.domNode.parentNode.childNodes[i];
this.checkFixedBar(c,false);
}
}
this.fixedFooterHeight=this.fixedFooter?this.fixedFooter.offsetHeight:0;
},checkFixedBar:function(_a,_b){
if(_a.nodeType===1){
var _c=_a.getAttribute("fixed")||(dijit.byNode(_a)&&dijit.byNode(_a).fixed);
if(_c==="top"){
_1.addClass(_a,"mblFixedHeaderBar");
if(_b){
_a.style.top="0px";
this.fixedHeader=_a;
}
return _c;
}else{
if(_c==="bottom"){
_1.addClass(_a,"mblFixedBottomBar");
this.fixedFooter=_a;
return _c;
}
}
}
return null;
}});
_1.extend(dojox.mobile._ScrollableMixin,new _6(_1,dojox));
return dojox.mobile._ScrollableMixin;
});
