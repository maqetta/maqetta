//>>built
require({cache:{"url:dijit/templates/Tooltip.html":"<div class=\"dijitTooltip dijitTooltipLeft\" id=\"dojoTooltip\"\n\t><div class=\"dijitTooltipContainer dijitTooltipContents\" data-dojo-attach-point=\"containerNode\" role='alert'></div\n\t><div class=\"dijitTooltipConnector\" data-dojo-attach-point=\"connectorNode\"></div\n></div>\n"}});
define("dijit/Tooltip",["dojo/_base/array","dojo/_base/declare","dojo/_base/fx","dojo/dom","dojo/dom-class","dojo/dom-geometry","dojo/dom-style","dojo/_base/lang","dojo/_base/sniff","dojo/_base/window","./_base/manager","./place","./_Widget","./_TemplatedMixin","./BackgroundIframe","dojo/text!./templates/Tooltip.html","."],function(_1,_2,fx,_3,_4,_5,_6,_7,_8,_9,_a,_b,_c,_d,_e,_f){
var _10=_2("dijit._MasterTooltip",[_c,_d],{duration:_a.defaultDuration,templateString:_f,postCreate:function(){
_9.body().appendChild(this.domNode);
this.bgIframe=new _e(this.domNode);
this.fadeIn=fx.fadeIn({node:this.domNode,duration:this.duration,onEnd:_7.hitch(this,"_onShow")});
this.fadeOut=fx.fadeOut({node:this.domNode,duration:this.duration,onEnd:_7.hitch(this,"_onHide")});
},show:function(_11,_12,_13,rtl){
if(this.aroundNode&&this.aroundNode===_12&&this.containerNode.innerHTML==_11){
return;
}
this.domNode.width="auto";
if(this.fadeOut.status()=="playing"){
this._onDeck=arguments;
return;
}
this.containerNode.innerHTML=_11;
var pos=_b.around(this.domNode,_12,_13&&_13.length?_13:_14.defaultPosition,!rtl,_7.hitch(this,"orient"));
var _15=pos.aroundNodePos;
if(pos.corner.charAt(0)=="M"&&pos.aroundCorner.charAt(0)=="M"){
this.connectorNode.style.top=_15.y+((_15.h-this.connectorNode.offsetHeight)>>1)-pos.y+"px";
this.connectorNode.style.left="";
}else{
if(pos.corner.charAt(1)=="M"&&pos.aroundCorner.charAt(1)=="M"){
this.connectorNode.style.left=_15.x+((_15.w-this.connectorNode.offsetWidth)>>1)-pos.x+"px";
}
}
_6.set(this.domNode,"opacity",0);
this.fadeIn.play();
this.isShowingNow=true;
this.aroundNode=_12;
},orient:function(_16,_17,_18,_19,_1a){
this.connectorNode.style.top="";
var _1b=_19.w-this.connectorNode.offsetWidth;
_16.className="dijitTooltip "+{"MR-ML":"dijitTooltipRight","ML-MR":"dijitTooltipLeft","TM-BM":"dijitTooltipAbove","BM-TM":"dijitTooltipBelow","BL-TL":"dijitTooltipBelow dijitTooltipABLeft","TL-BL":"dijitTooltipAbove dijitTooltipABLeft","BR-TR":"dijitTooltipBelow dijitTooltipABRight","TR-BR":"dijitTooltipAbove dijitTooltipABRight","BR-BL":"dijitTooltipRight","BL-BR":"dijitTooltipLeft"}[_17+"-"+_18];
this.domNode.style.width="auto";
var _1c=_5.getContentBox(this.domNode);
var _1d=Math.min((Math.max(_1b,1)),_1c.w);
var _1e=_1d<_1c.w;
this.domNode.style.width=_1d+"px";
if(_1e){
this.containerNode.style.overflow="auto";
var _1f=this.containerNode.scrollWidth;
this.containerNode.style.overflow="visible";
if(_1f>_1d){
_1f=_1f+_6.get(this.domNode,"paddingLeft")+_6.get(this.domNode,"paddingRight");
this.domNode.style.width=_1f+"px";
}
}
if(_18.charAt(0)=="B"&&_17.charAt(0)=="B"){
var mb=_5.getMarginBox(_16);
var _20=this.connectorNode.offsetHeight;
if(mb.h>_19.h){
var _21=_19.h-((_1a.h+_20)>>1);
this.connectorNode.style.top=_21+"px";
this.connectorNode.style.bottom="";
}else{
this.connectorNode.style.bottom=Math.min(Math.max(_1a.h/2-_20/2,0),mb.h-_20)+"px";
this.connectorNode.style.top="";
}
}else{
this.connectorNode.style.top="";
this.connectorNode.style.bottom="";
}
return Math.max(0,_1c.w-_1b);
},_onShow:function(){
if(_8("ie")){
this.domNode.style.filter="";
}
},hide:function(_22){
if(this._onDeck&&this._onDeck[1]==_22){
this._onDeck=null;
}else{
if(this.aroundNode===_22){
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
dijit.showTooltip=function(_23,_24,_25,rtl){
if(!_14._masterTT){
dijit._masterTT=_14._masterTT=new _10();
}
return _14._masterTT.show(_23,_24,_25,rtl);
};
dijit.hideTooltip=function(_26){
return _14._masterTT&&_14._masterTT.hide(_26);
};
var _14=_2("dijit.Tooltip",_c,{label:"",showDelay:400,connectId:[],position:[],_setConnectIdAttr:function(_27){
_1.forEach(this._connections||[],function(_28){
_1.forEach(_28,_7.hitch(this,"disconnect"));
},this);
this._connectIds=_1.filter(_7.isArrayLike(_27)?_27:(_27?[_27]:[]),function(id){
return _3.byId(id);
});
this._connections=_1.map(this._connectIds,function(id){
var _29=_3.byId(id);
return [this.connect(_29,"onmouseenter","_onHover"),this.connect(_29,"onmouseleave","_onUnHover"),this.connect(_29,"onfocus","_onHover"),this.connect(_29,"onblur","_onUnHover")];
},this);
this._set("connectId",_27);
},addTarget:function(_2a){
var id=_2a.id||_2a;
if(_1.indexOf(this._connectIds,id)==-1){
this.set("connectId",this._connectIds.concat(id));
}
},removeTarget:function(_2b){
var id=_2b.id||_2b,idx=_1.indexOf(this._connectIds,id);
if(idx>=0){
this._connectIds.splice(idx,1);
this.set("connectId",this._connectIds);
}
},buildRendering:function(){
this.inherited(arguments);
_4.add(this.domNode,"dijitTooltipData");
},startup:function(){
this.inherited(arguments);
var ids=this.connectId;
_1.forEach(_7.isArrayLike(ids)?ids:[ids],this.addTarget,this);
},_onHover:function(e){
if(!this._showTimer){
var _2c=e.target;
this._showTimer=setTimeout(_7.hitch(this,function(){
this.open(_2c);
}),this.showDelay);
}
},_onUnHover:function(){
if(this._focus){
return;
}
if(this._showTimer){
clearTimeout(this._showTimer);
delete this._showTimer;
}
this.close();
},open:function(_2d){
if(this._showTimer){
clearTimeout(this._showTimer);
delete this._showTimer;
}
_14.show(this.label||this.domNode.innerHTML,_2d,this.position,!this.isLeftToRight());
this._connectNode=_2d;
this.onShow(_2d,this.position);
},close:function(){
if(this._connectNode){
_14.hide(this._connectNode);
delete this._connectNode;
this.onHide();
}
if(this._showTimer){
clearTimeout(this._showTimer);
delete this._showTimer;
}
},onShow:function(){
},onHide:function(){
},uninitialize:function(){
this.close();
this.inherited(arguments);
}});
_14._MasterTooltip=_10;
_14.show=dijit.showTooltip;
_14.hide=dijit.hideTooltip;
_14.defaultPosition=["after","before"];
return _14;
});
