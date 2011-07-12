/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/widget/UpgradeBar",["dojo","dijit","dojox","dojo/window","dojo/fx","dojo/cookie","dijit/_Widget","dijit/_Templated"],function(_1,_2,_3){
_1.getObject("dojox.widget.UpgradeBar",1);
_1.experimental("dojox.widget.UpgradeBar");
_1.declare("dojox.widget.UpgradeBar",[_2._Widget,_2._Templated],{notifications:[],buttonCancel:"Close for now",noRemindButton:"Don't Remind Me Again",templateString:_1.cache("dojox.widget","UpgradeBar/UpgradeBar.html","<div class=\"dojoxUpgradeBar\">\n\t<div class=\"dojoxUpgradeBarMessage\" dojoAttachPoint=\"messageNode\">message</div>\n\t<div class=\"dojoxUpgradeBarReminderButton\" dojoAttachPoint=\"dontRemindButtonNode\" dojoAttachEvent=\"onclick:_onDontRemindClick\">${noRemindButton}</div>\n\t<span dojoAttachPoint=\"closeButtonNode\" class=\"dojoxUpgradeBarCloseIcon\" dojoAttachEvent=\"onclick: hide, onmouseenter: _onCloseEnter, onmouseleave: _onCloseLeave\" title=\"${buttonCancel}\"></span>\n</div>"),constructor:function(_4,_5){
if(!_4.notifications&&_5){
_1.forEach(_5.childNodes,function(n){
if(n.nodeType==1){
var _6=_1.attr(n,"validate");
this.notifications.push({message:n.innerHTML,validate:function(){
var _7=true;
try{
_7=_1.eval(_6);
}
catch(e){
}
return _7;
}});
}
},this);
}
},checkNotifications:function(){
if(!this.notifications.length){
return;
}
for(var i=0;i<this.notifications.length;i++){
var _8=this.notifications[i].validate();
if(_8){
this.notify(this.notifications[i].message);
break;
}
}
},postCreate:function(){
this.inherited(arguments);
if(this.domNode.parentNode){
_1.style(this.domNode,"display","none");
}
_1.mixin(this.attributeMap,{message:{node:"messageNode",type:"innerHTML"}});
if(!this.noRemindButton){
_1.destroy(this.dontRemindButtonNode);
}
if(_1.isIE==6){
var _9=this;
var _a=function(){
var v=_1.window.getBox();
_1.style(_9.domNode,"width",v.w+"px");
};
this.connect(window,"resize",function(){
_a();
});
_a();
}
_1.addOnLoad(this,"checkNotifications");
},notify:function(_b){
if(_1.cookie("disableUpgradeReminders")){
return;
}
if(!this.domNode.parentNode||!this.domNode.parentNode.innerHTML){
document.body.appendChild(this.domNode);
}
_1.style(this.domNode,"display","");
if(_b){
this.set("message",_b);
}
},show:function(){
this._bodyMarginTop=_1.style(_1.body(),"marginTop");
this._size=_1.contentBox(this.domNode).h;
_1.style(this.domNode,{display:"block",height:0,opacity:0});
if(!this._showAnim){
this._showAnim=_1.fx.combine([_1.animateProperty({node:_1.body(),duration:500,properties:{marginTop:this._bodyMarginTop+this._size}}),_1.animateProperty({node:this.domNode,duration:500,properties:{height:this._size,opacity:1}})]);
}
this._showAnim.play();
},hide:function(){
if(!this._hideAnim){
this._hideAnim=_1.fx.combine([_1.animateProperty({node:_1.body(),duration:500,properties:{marginTop:this._bodyMarginTop}}),_1.animateProperty({node:this.domNode,duration:500,properties:{height:0,opacity:0}})]);
_1.connect(this._hideAnim,"onEnd",this,function(){
_1.style(this.domNode,"display","none");
});
}
this._hideAnim.play();
},_onDontRemindClick:function(){
_1.cookie("disableUpgradeReminders",true,{expires:3650});
this.hide();
},_onCloseEnter:function(){
_1.addClass(this.closeButtonNode,"dojoxUpgradeBarCloseIcon-hover");
},_onCloseLeave:function(){
_1.removeClass(this.closeButtonNode,"dojoxUpgradeBarCloseIcon-hover");
}});
return _1.getObject("dojox.widget.UpgradeBar");
});
require(["dojox/widget/UpgradeBar"]);
