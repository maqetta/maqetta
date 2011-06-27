/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/charting/action2d/MoveSlice",["dojo/_base/kernel","dojo/_base/connect","dojo/_base/declare","./PlotAction","dojo/fx/easing","dojox/gfx/matrix","dojox/gfx/fx","dojox/lang/functional","dojox/lang/functional/scan","dojox/lang/functional/fold"],function(_1,_2,_3,_4,_5,m,gf,df){
var _6=1.05,_7=7;
return _1.declare("dojox.charting.action2d.MoveSlice",dojox.charting.action2d.PlotAction,{defaultParams:{duration:400,easing:_5.backOut,scale:_6,shift:_7},optionalParams:{},constructor:function(_8,_9,_a){
if(!_a){
_a={};
}
this.scale=typeof _a.scale=="number"?_a.scale:_6;
this.shift=typeof _a.shift=="number"?_a.shift:_7;
this.connect();
},process:function(o){
if(!o.shape||o.element!="slice"||!(o.type in this.overOutEvents)){
return;
}
if(!this.angles){
var _b=m._degToRad(o.plot.opt.startAngle);
if(typeof o.run.data[0]=="number"){
this.angles=df.map(df.scanl(o.run.data,"+",_b),"* 2 * Math.PI / this",df.foldl(o.run.data,"+",0));
}else{
this.angles=df.map(df.scanl(o.run.data,"a + b.y",_b),"* 2 * Math.PI / this",df.foldl(o.run.data,"a + b.y",0));
}
}
var _c=o.index,_d,_e,_f,_10,_11,_12=(this.angles[_c]+this.angles[_c+1])/2,_13=m.rotateAt(-_12,o.cx,o.cy),_14=m.rotateAt(_12,o.cx,o.cy);
_d=this.anim[_c];
if(_d){
_d.action.stop(true);
}else{
this.anim[_c]=_d={};
}
if(o.type=="onmouseover"){
_10=0;
_11=this.shift;
_e=1;
_f=this.scale;
}else{
_10=this.shift;
_11=0;
_e=this.scale;
_f=1;
}
_d.action=gf.animateTransform({shape:o.shape,duration:this.duration,easing:this.easing,transform:[_14,{name:"translate",start:[_10,0],end:[_11,0]},{name:"scaleAt",start:[_e,o.cx,o.cy],end:[_f,o.cx,o.cy]},_13]});
if(o.type=="onmouseout"){
_1.connect(_d.action,"onEnd",this,function(){
delete this.anim[_c];
});
}
_d.action.play();
},reset:function(){
delete this.angles;
}});
});
