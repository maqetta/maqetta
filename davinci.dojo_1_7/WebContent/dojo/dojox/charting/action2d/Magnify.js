/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/charting/action2d/Magnify",["dojo/_base/kernel","dojo/_base/connect","dojo/_base/declare","./PlotAction","dojox/gfx/matrix","dojox/gfx/fx","dojo/fx","dojo/fx/easing"],function(_1,_2,_3,_4,m,gf,df,_5){
var _6=2;
return _1.declare("dojox.charting.action2d.Magnify",dojox.charting.action2d.PlotAction,{defaultParams:{duration:400,easing:_5.backOut,scale:_6},optionalParams:{},constructor:function(_7,_8,_9){
this.scale=_9&&typeof _9.scale=="number"?_9.scale:_6;
this.connect();
},process:function(o){
if(!o.shape||!(o.type in this.overOutEvents)||!("cx" in o)||!("cy" in o)){
return;
}
var _a=o.run.name,_b=o.index,_c=[],_d,_e,_f;
if(_a in this.anim){
_d=this.anim[_a][_b];
}else{
this.anim[_a]={};
}
if(_d){
_d.action.stop(true);
}else{
this.anim[_a][_b]=_d={};
}
if(o.type=="onmouseover"){
_e=m.identity;
_f=this.scale;
}else{
_e=m.scaleAt(this.scale,o.cx,o.cy);
_f=1/this.scale;
}
var _10={shape:o.shape,duration:this.duration,easing:this.easing,transform:[{name:"scaleAt",start:[1,o.cx,o.cy],end:[_f,o.cx,o.cy]},_e]};
if(o.shape){
_c.push(gf.animateTransform(_10));
}
if(o.oultine){
_10.shape=o.outline;
_c.push(gf.animateTransform(_10));
}
if(o.shadow){
_10.shape=o.shadow;
_c.push(gf.animateTransform(_10));
}
if(!_c.length){
delete this.anim[_a][_b];
return;
}
_d.action=df.combine(_c);
if(o.type=="onmouseout"){
_1.connect(_d.action,"onEnd",this,function(){
if(this.anim[_a]){
delete this.anim[_a][_b];
}
});
}
_d.action.play();
}});
});
