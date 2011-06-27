/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/mobile/Slider",["dojo/_base/kernel","dojo/_base/declare","dojo/_base/html","dojo/_base/array","dijit/_WidgetBase","dijit/form/_FormValueMixin"],function(_1,_2,_3,_4,_5,_6){
return _1.declare("dojox.mobile.Slider",[dijit._WidgetBase,dijit.form._FormValueMixin],{value:0,min:0,max:100,step:1,baseClass:"mblSlider",flip:false,orientation:"auto",halo:"8pt",buildRendering:function(){
this.focusNode=this.domNode=_1.create("div",{});
this.valueNode=_1.create("input",(this.srcNodeRef&&this.srcNodeRef.name)?{type:"hidden",name:this.srcNodeRef.name}:{type:"hidden"},this.domNode,"last");
var _7=_1.create("div",{style:{position:"relative",height:"100%",width:"100%"}},this.domNode,"last");
this.progressBar=_1.create("div",{style:{position:"absolute"},"class":"mblSliderProgressBar"},_7,"last");
this.touchBox=_1.create("div",{style:{position:"absolute"},"class":"mblSliderTouchBox"},_7,"last");
this.handle=_1.create("div",{style:{position:"absolute"},"class":"mblSliderHandle"},_7,"last");
this.inherited(arguments);
},_setValueAttr:function(_8,_9){
var _a=(this.value-this.min)*100/(this.max-this.min);
this.valueNode.value=_8;
this.inherited(arguments);
if(!this._started){
return;
}
this.focusNode.setAttribute("aria-valuenow",_8);
var _b=(_8-this.min)*100/(this.max-this.min);
var _c=this.orientation!="V";
if(_9===true){
_1.addClass(this.handle,"mblSliderTransition");
_1.addClass(this.progressBar,"mblSliderTransition");
}else{
_1.removeClass(this.handle,"mblSliderTransition");
_1.removeClass(this.progressBar,"mblSliderTransition");
}
_1.style(this.handle,this._attrs.handleLeft,(this._reversed?(100-_b):_b)+"%");
_1.style(this.progressBar,this._attrs.width,_b+"%");
},postCreate:function(){
this.inherited(arguments);
function _d(e){
function _e(e){
_1c=_f?e[this._attrs.pageX]:(e.touches?e.touches[0][this._attrs.pageX]:e[this._attrs.clientX]);
_1d=_1c-_10;
_1d=Math.min(Math.max(_1d,0),_11);
var _12=this.step?((this.max-this.min)/this.step):_11;
if(_12<=1||_12==Infinity){
_12=_11;
}
var _13=Math.round(_1d*_12/_11);
_1a=(this.max-this.min)*_13/_12;
_1a=this._reversed?(this.max-_1a):(this.min+_1a);
};
function _14(e){
e.preventDefault();
_1.hitch(this,_e)(e);
this.set("value",_1a,false);
};
function _15(e){
e.preventDefault();
_1.forEach(_16,_1.hitch(this,"disconnect"));
_16=[];
this.set("value",this.value,true);
};
e.preventDefault();
var _f=e.type=="mousedown";
var box=_1.position(_17,false);
var _18=_1.style(_1.body(),"zoom")||1;
if(isNaN(_18)){
_18=1;
}
var _19=_1.style(_17,"zoom")||1;
if(isNaN(_19)){
_19=1;
}
var _10=box[this._attrs.x]*_19*_18+_1._docScroll()[this._attrs.x];
var _11=box[this._attrs.w]*_19*_18;
_1.hitch(this,_e)(e);
if(e.target==this.touchBox){
this.set("value",_1a,true);
}
_1.forEach(_16,_1.disconnect);
var _1b=_1.doc.documentElement;
var _16=[this.connect(_1b,_f?"onmousemove":"ontouchmove",_14),this.connect(_1b,_f?"onmouseup":"ontouchend",_15)];
};
var _1c,_1d,_1a;
var _17=this.domNode;
if(this.orientation=="auto"){
this.orientation=_17.offsetHeight<=_17.offsetWidth?"H":"V";
}
_1.addClass(this.domNode,_1.map(this.baseClass.split(" "),_1.hitch(this,function(c){
return c+this.orientation;
})));
var _1e=this.orientation!="V";
var ltr=_1e?this.isLeftToRight():false;
var _1f=this.flip;
this._reversed=!(_1e&&((ltr&&!_1f)||(!ltr&&_1f)))||(!_1e&&!_1f);
this._attrs=_1e?{x:"x",w:"w",l:"l",r:"r",pageX:"pageX",clientX:"clientX",handleLeft:"left",left:this._reversed?"right":"left",width:"width"}:{x:"y",w:"h",l:"t",r:"b",pageX:"pageY",clientX:"clientY",handleLeft:"top",left:this._reversed?"bottom":"top",width:"height"};
this.progressBar.style[this._attrs.left]="0px";
this.connect(this.touchBox,"touchstart",_d);
this.connect(this.touchBox,"onmousedown",_d);
this.connect(this.handle,"touchstart",_d);
this.connect(this.handle,"onmousedown",_d);
this.startup();
this.set("value",this.value);
}});
});
