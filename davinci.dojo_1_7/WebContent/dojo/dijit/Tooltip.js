/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
require.cache["dijit/templates/Tooltip.html"]="<div class=\"dijitTooltip dijitTooltipLeft\" id=\"dojoTooltip\"\n\t><div class=\"dijitTooltipContainer dijitTooltipContents\" dojoAttachPoint=\"containerNode\" role='alert'></div\n\t><div class=\"dijitTooltipConnector\" dojoAttachPoint=\"connectorNode\"></div\n></div>\n";
define("dijit/Tooltip",["dojo/_base/kernel",".","dojo/text!./templates/Tooltip.html","./place","./_Widget","./_TemplatedMixin","./BackgroundIframe","dojo/_base/array","dojo/_base/declare","dojo/_base/fx","dojo/_base/html","dojo/_base/lang","dojo/_base/sniff","dojo/_base/window"],function(_1,_2,_3,_4){
_1.declare("dijit._MasterTooltip",[_2._Widget,_2._TemplatedMixin],{duration:_2.defaultDuration,templateString:_3,postCreate:function(){
_1.body().appendChild(this.domNode);
this.bgIframe=new _2.BackgroundIframe(this.domNode);
this.fadeIn=_1.fadeIn({node:this.domNode,duration:this.duration,onEnd:_1.hitch(this,"_onShow")});
this.fadeOut=_1.fadeOut({node:this.domNode,duration:this.duration,onEnd:_1.hitch(this,"_onHide")});
},show:function(_5,_6,_7,_8){
if(this.aroundNode&&this.aroundNode===_6&&this.containerNode.innerHTML==_5){
return;
}
this.domNode.width="auto";
if(this.fadeOut.status()=="playing"){
this._onDeck=arguments;
return;
}
this.containerNode.innerHTML=_5;
var _9=_4.around(this.domNode,_6,_7&&_7.length?_7:_2.Tooltip.defaultPosition,!_8,_1.hitch(this,"orient"));
var _a;
if(_9.corner.charAt(0)=="M"&&_9.aroundCorner.charAt(0)=="M"){
_a=(typeof _6=="string"||"offsetWidth" in _6)?_1.position(_6,true):_6;
this.connectorNode.style.top=_a.y+((_a.h-this.connectorNode.offsetHeight)>>1)-_9.y+"px";
this.connectorNode.style.left="";
}else{
if(_9.corner.charAt(1)=="M"&&_9.aroundCorner.charAt(1)=="M"){
_a=(typeof _6=="string"||"offsetWidth" in _6)?_1.position(_6,true):_6;
this.connectorNode.style.left=_a.x+((_a.w-this.connectorNode.offsetWidth)>>1)-_9.x+"px";
}
}
_1.style(this.domNode,"opacity",0);
this.fadeIn.play();
this.isShowingNow=true;
this.aroundNode=_6;
},orient:function(_b,_c,_d,_e,_f){
this.connectorNode.style.top="";
var _10=_e.w-this.connectorNode.offsetWidth;
_b.className="dijitTooltip "+{"MR-ML":"dijitTooltipRight","ML-MR":"dijitTooltipLeft","TM-BM":"dijitTooltipAbove","BM-TM":"dijitTooltipBelow","BL-TL":"dijitTooltipBelow dijitTooltipABLeft","TL-BL":"dijitTooltipAbove dijitTooltipABLeft","BR-TR":"dijitTooltipBelow dijitTooltipABRight","TR-BR":"dijitTooltipAbove dijitTooltipABRight","BR-BL":"dijitTooltipRight","BL-BR":"dijitTooltipLeft"}[_c+"-"+_d];
this.domNode.style.width="auto";
var _11=_1.contentBox(this.domNode);
var _12=Math.min((Math.max(_10,1)),_11.w);
var _13=_12<_11.w;
this.domNode.style.width=_12+"px";
if(_13){
this.containerNode.style.overflow="auto";
var _14=this.containerNode.scrollWidth;
this.containerNode.style.overflow="visible";
if(_14>_12){
_14=_14+_1.style(this.domNode,"paddingLeft")+_1.style(this.domNode,"paddingRight");
this.domNode.style.width=_14+"px";
}
}
if(_d.charAt(0)=="B"&&_c.charAt(0)=="B"){
var mb=_1.marginBox(_b);
var _15=this.connectorNode.offsetHeight;
if(mb.h>_e.h){
var _16=_e.h-((_f.h+_15)>>1);
this.connectorNode.style.top=_16+"px";
this.connectorNode.style.bottom="";
}else{
this.connectorNode.style.bottom=Math.min(Math.max(_f.h/2-_15/2,0),mb.h-_15)+"px";
this.connectorNode.style.top="";
}
}else{
this.connectorNode.style.top="";
this.connectorNode.style.bottom="";
}
return Math.max(0,_11.w-_10);
},_onShow:function(){
if(_1.isIE){
this.domNode.style.filter="";
}
},hide:function(_17){
if(this._onDeck&&this._onDeck[1]==_17){
this._onDeck=null;
}else{
if(this.aroundNode===_17){
this.fadeIn.stop();
this.isShowingNow=false;
this.aroundNode=null;
this.fadeOut.play();
}else{
}
}
},_onHide:function(){
this.domNode.style.cssText="";
this.containerNode.innerHTML="";
if(this._onDeck){
this.show.apply(this,this._onDeck);
this._onDeck=null;
}
}});
_2.showTooltip=function(_18,_19,_1a,rtl){
if(!_2._masterTT){
_2._masterTT=new _2._MasterTooltip();
}
return _2._masterTT.show(_18,_19,_1a,rtl);
};
_2.hideTooltip=function(_1b){
if(!_2._masterTT){
_2._masterTT=new _2._MasterTooltip();
}
return _2._masterTT.hide(_1b);
};
_1.declare("dijit.Tooltip",_2._Widget,{label:"",showDelay:400,connectId:[],position:[],_setConnectIdAttr:function(_1c){
_1.forEach(this._connections||[],function(_1d){
_1.forEach(_1d,_1.hitch(this,"disconnect"));
},this);
this._connectIds=_1.filter(_1.isArrayLike(_1c)?_1c:(_1c?[_1c]:[]),function(id){
return _1.byId(id);
});
this._connections=_1.map(this._connectIds,function(id){
var _1e=_1.byId(id);
return [this.connect(_1e,"onmouseenter","_onHover"),this.connect(_1e,"onmouseleave","_onUnHover"),this.connect(_1e,"onfocus","_onHover"),this.connect(_1e,"onblur","_onUnHover")];
},this);
this._set("connectId",_1c);
},addTarget:function(_1f){
var id=_1f.id||_1f;
if(_1.indexOf(this._connectIds,id)==-1){
this.set("connectId",this._connectIds.concat(id));
}
},removeTarget:function(_20){
var id=_20.id||_20,idx=_1.indexOf(this._connectIds,id);
if(idx>=0){
this._connectIds.splice(idx,1);
this.set("connectId",this._connectIds);
}
},buildRendering:function(){
this.inherited(arguments);
_1.addClass(this.domNode,"dijitTooltipData");
},startup:function(){
this.inherited(arguments);
var ids=this.connectId;
_1.forEach(_1.isArrayLike(ids)?ids:[ids],this.addTarget,this);
},_onHover:function(e){
if(!this._showTimer){
var _21=e.target;
this._showTimer=setTimeout(_1.hitch(this,function(){
this.open(_21);
}),this.showDelay);
}
},_onUnHover:function(e){
if(this._focus){
return;
}
if(this._showTimer){
clearTimeout(this._showTimer);
delete this._showTimer;
}
this.close();
},open:function(_22){
if(this._showTimer){
clearTimeout(this._showTimer);
delete this._showTimer;
}
_2.showTooltip(this.label||this.domNode.innerHTML,_22,this.position,!this.isLeftToRight());
this._connectNode=_22;
this.onShow(_22,this.position);
},close:function(){
if(this._connectNode){
_2.hideTooltip(this._connectNode);
delete this._connectNode;
this.onHide();
}
if(this._showTimer){
clearTimeout(this._showTimer);
delete this._showTimer;
}
},onShow:function(_23,_24){
},onHide:function(){
},uninitialize:function(){
this.close();
this.inherited(arguments);
}});
_2.Tooltip.defaultPosition=["after","before"];
return _2.Tooltip;
});
