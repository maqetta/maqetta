/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/charting/action2d/Highlight",["dojo/_base/kernel","dojo/_base/lang","dojo/_base/declare","dojo/_base/connect","dojox/color/_base","./PlotAction","dojo/fx/easing","dojox/gfx/fx"],function(_1,_2,_3,_4,c,_5,_6,_7){
var _8=100,_9=75,_a=50,cc=function(_b){
return function(){
return _b;
};
},hl=function(_c){
var a=new c.Color(_c),x=a.toHsl();
if(x.s==0){
x.l=x.l<50?100:0;
}else{
x.s=_8;
if(x.l<_a){
x.l=_9;
}else{
if(x.l>_9){
x.l=_a;
}else{
x.l=x.l-_a>_9-x.l?_a:_9;
}
}
}
return c.fromHsl(x);
};
return _1.declare("dojox.charting.action2d.Highlight",dojox.charting.action2d.PlotAction,{defaultParams:{duration:400,easing:_6.backOut},optionalParams:{highlight:"red"},constructor:function(_d,_e,_f){
var a=_f&&_f.highlight;
this.colorFun=a?(_1.isFunction(a)?a:cc(a)):hl;
this.connect();
},process:function(o){
if(!o.shape||!(o.type in this.overOutEvents)){
return;
}
var _10=o.run.name,_11=o.index,_12,_13,_14;
if(_10 in this.anim){
_12=this.anim[_10][_11];
}else{
this.anim[_10]={};
}
if(_12){
_12.action.stop(true);
}else{
var _15=o.shape.getFill();
if(!_15||!(_15 instanceof _1.Color)){
return;
}
this.anim[_10][_11]=_12={start:_15,end:this.colorFun(_15)};
}
var _16=_12.start,end=_12.end;
if(o.type=="onmouseout"){
var t=_16;
_16=end;
end=t;
}
_12.action=_7.animateFill({shape:o.shape,duration:this.duration,easing:this.easing,color:{start:_16,end:end}});
if(o.type=="onmouseout"){
_1.connect(_12.action,"onEnd",this,function(){
if(this.anim[_10]){
delete this.anim[_10][_11];
}
});
}
_12.action.play();
}});
});
