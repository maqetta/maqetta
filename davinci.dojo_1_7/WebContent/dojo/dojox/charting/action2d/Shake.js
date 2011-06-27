/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/charting/action2d/Shake",["dojo/_base/kernel","dojo/_base/connect","dojo/_base/declare","./PlotAction","dojo/fx","dojo/fx/easing","dojox/gfx/matrix","dojox/gfx/fx"],function(_1,_2,_3,_4,df,_5,m,gf){
var _6=3;
return _1.declare("dojox.charting.action2d.Shake",dojox.charting.action2d.PlotAction,{defaultParams:{duration:400,easing:_5.backOut,shiftX:_6,shiftY:_6},optionalParams:{},constructor:function(_7,_8,_9){
if(!_9){
_9={};
}
this.shiftX=typeof _9.shiftX=="number"?_9.shiftX:_6;
this.shiftY=typeof _9.shiftY=="number"?_9.shiftY:_6;
this.connect();
},process:function(o){
if(!o.shape||!(o.type in this.overOutEvents)){
return;
}
var _a=o.run.name,_b=o.index,_c=[],_d,_e=o.type=="onmouseover"?this.shiftX:-this.shiftX,_f=o.type=="onmouseover"?this.shiftY:-this.shiftY;
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
var _10={shape:o.shape,duration:this.duration,easing:this.easing,transform:[{name:"translate",start:[this.shiftX,this.shiftY],end:[0,0]},m.identity]};
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
