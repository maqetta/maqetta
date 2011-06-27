/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/mobile/Switch",["./common","dijit/_WidgetBase","dijit/_Contained"],function(_1,_2,_3){
return dojo.declare("dojox.mobile.Switch",[dijit._WidgetBase,dijit._Contained],{value:"on",name:"",leftLabel:"ON",rightLabel:"OFF",_width:53,buildRendering:function(){
this.domNode=dojo.doc.createElement("DIV");
var c=this.srcNodeRef?this.srcNodeRef.className:this.className;
this._swClass=(c||"").replace(/ .*/,"");
this.domNode.className="mblSwitch";
var _4=this.name?" name=\""+this.name+"\"":"";
this.domNode.innerHTML="<div class=\"mblSwitchInner\">"+"<div class=\"mblSwitchBg mblSwitchBgLeft\">"+"<div class=\"mblSwitchText mblSwitchTextLeft\"></div>"+"</div>"+"<div class=\"mblSwitchBg mblSwitchBgRight\">"+"<div class=\"mblSwitchText mblSwitchTextRight\"></div>"+"</div>"+"<div class=\"mblSwitchKnob\"></div>"+"<input type=\"hidden\""+_4+"></div>"+"</div>";
var n=this.inner=this.domNode.firstChild;
this.left=n.childNodes[0];
this.right=n.childNodes[1];
this.knob=n.childNodes[2];
this.input=n.childNodes[3];
},postCreate:function(){
this.connect(this.domNode,"onclick","onClick");
this.connect(this.domNode,dojox.mobile.hasTouch?"touchstart":"onmousedown","onTouchStart");
},_changeState:function(_5,_6){
var on=(_5==="on");
this.left.style.display="";
this.right.style.display="";
this.inner.style.left="";
if(_6){
dojo.addClass(this.domNode,"mblSwitchAnimation");
}
dojo.removeClass(this.domNode,on?"mblSwitchOff":"mblSwitchOn");
dojo.addClass(this.domNode,on?"mblSwitchOn":"mblSwitchOff");
var _7=this;
setTimeout(function(){
_7.left.style.display=on?"":"none";
_7.right.style.display=!on?"":"none";
dojo.removeClass(_7.domNode,"mblSwitchAnimation");
},_6?300:0);
},startup:function(){
if(this._swClass.indexOf("Round")!=-1){
var r=Math.round(this.domNode.offsetHeight/2);
this.createRoundMask(this._swClass,r,this.domNode.offsetWidth);
}
},createRoundMask:function(_8,r,w){
if(!dojo.isWebKit||!_8){
return;
}
if(!this._createdMasks){
this._createdMasks=[];
}
if(this._createdMasks[_8]){
return;
}
this._createdMasks[_8]=1;
var _9=dojo.doc.getCSSCanvasContext("2d",_8+"Mask",w,100);
_9.fillStyle="#000000";
_9.beginPath();
_9.moveTo(r,0);
_9.arcTo(0,0,0,2*r,r);
_9.arcTo(0,2*r,r,2*r,r);
_9.lineTo(w-r,2*r);
_9.arcTo(w,2*r,w,r,r);
_9.arcTo(w,0,w-r,0,r);
_9.closePath();
_9.fill();
},onClick:function(e){
if(this._moved){
return;
}
this.value=this.input.value=(this.value=="on")?"off":"on";
this._changeState(this.value,true);
this.onStateChanged(this.value);
},onTouchStart:function(e){
this._moved=false;
this.innerStartX=this.inner.offsetLeft;
if(!this._conn){
this._conn=[];
this._conn.push(dojo.connect(this.inner,dojox.mobile.hasTouch?"touchmove":"onmousemove",this,"onTouchMove"));
this._conn.push(dojo.connect(this.inner,dojox.mobile.hasTouch?"touchend":"onmouseup",this,"onTouchEnd"));
}
this.touchStartX=e.touches?e.touches[0].pageX:e.clientX;
this.left.style.display="";
this.right.style.display="";
dojo.stopEvent(e);
},onTouchMove:function(e){
e.preventDefault();
var dx;
if(e.targetTouches){
if(e.targetTouches.length!=1){
return false;
}
dx=e.targetTouches[0].clientX-this.touchStartX;
}else{
dx=e.clientX-this.touchStartX;
}
var _a=this.innerStartX+dx;
var d=10;
if(_a<=-(this._width-d)){
_a=-this._width;
}
if(_a>=-d){
_a=0;
}
this.inner.style.left=_a+"px";
if(Math.abs(dx)>d){
this._moved=true;
}
},onTouchEnd:function(e){
dojo.forEach(this._conn,dojo.disconnect);
this._conn=null;
if(this.innerStartX==this.inner.offsetLeft){
if(dojox.mobile.hasTouch){
var ev=dojo.doc.createEvent("MouseEvents");
ev.initEvent("click",true,true);
this.inner.dispatchEvent(ev);
}
return;
}
var _b=(this.inner.offsetLeft<-(this._width/2))?"off":"on";
this._changeState(_b,true);
if(_b!=this.value){
this.value=this.input.value=_b;
this.onStateChanged(_b);
}
},onStateChanged:function(_c){
},_setValueAttr:function(_d){
this._changeState(_d,false);
if(this.value!=_d){
this.onStateChanged(_d);
}
this.value=this.input.value=_d;
},_setLeftLabelAttr:function(_e){
this.leftLabel=_e;
this.left.firstChild.innerHTML=this._cv(_e);
},_setRightLabelAttr:function(_f){
this.rightLabel=_f;
this.right.firstChild.innerHTML=this._cv(_f);
}});
});
