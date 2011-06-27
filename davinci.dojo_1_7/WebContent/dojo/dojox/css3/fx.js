/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/css3/fx",["dojo/_base/kernel","dojo/fx","dojox/html/ext-dojo/style","dojox/fx/ext-dojo/complex"],function(_1){
var _2=_1.getObject("css3.fx",true,dojox);
return _1.mixin(_2,{puff:function(_3){
return _1.fx.combine([_1.fadeOut(_3),this.expand({node:_3.node,endScale:_3.endScale||2})]);
},expand:function(_4){
return _1.animateProperty({node:_4.node,properties:{transform:{start:"scale(1)",end:"scale("+[_4.endScale||3]+")"}}});
},shrink:function(_5){
return this.expand({node:_5.node,endScale:0.01});
},rotate:function(_6){
return _1.animateProperty({node:_6.node,duration:_6.duration||1000,properties:{transform:{start:"rotate("+(_6.startAngle||"0deg")+")",end:"rotate("+(_6.endAngle||"360deg")+")"}}});
},flip:function(_7){
var _8=[],_9=_7.whichAnims||[0,1,2,3],_a=_7.direction||1,_b=[{start:"scale(1, 1) skew(0deg,0deg)",end:"scale(0, 1) skew(0,"+(_a*30)+"deg)"},{start:"scale(0, 1) skew(0deg,"+(_a*30)+"deg)",end:"scale(-1, 1) skew(0deg,0deg)"},{start:"scale(-1, 1) skew(0deg,0deg)",end:"scale(0, 1) skew(0deg,"+(-_a*30)+"deg)"},{start:"scale(0, 1) skew(0deg,"+(-_a*30)+"deg)",end:"scale(1, 1) skew(0deg,0deg)"}];
for(var i=0;i<_9.length;i++){
_8.push(_1.animateProperty(_1.mixin({node:_7.node,duration:_7.duration||600,properties:{transform:_b[_9[i]]}},_7)));
}
return _1.fx.chain(_8);
},bounce:function(_c){
var _d=[],n=_c.node,_e=_c.duration||1000,_f=_c.scaleX||1.2,_10=_c.scaleY||0.6,ds=_1.style,_11=ds(n,"position"),_12="absolute",_13=ds(n,"top"),_14=[],_15=0,_16=Math.round,_17=_c.jumpHeight||70;
if(_11!=="absolute"){
_12="relative";
}
var a1=_1.animateProperty({node:n,duration:_e/6,properties:{transform:{start:"scale(1, 1)",end:"scale("+_f+", "+_10+")"}}});
_1.connect(a1,"onBegin",function(){
ds(n,{transformOrigin:"50% 100%",position:_12});
});
_d.push(a1);
var a2=_1.animateProperty({node:n,duration:_e/6,properties:{transform:{end:"scale(1, 1)",start:"scale("+_f+", "+_10+")"}}});
_14.push(a2);
_14.push(new _1.Animation(_1.mixin({curve:[],duration:_e/3,delay:_e/12,onBegin:function(){
_15=(new Date).getTime();
},onAnimate:function(){
var _18=(new Date).getTime();
ds(n,{top:parseInt(ds(n,"top"))-_16(_17*((_18-_15)/this.duration))+"px"});
_15=_18;
}},_c)));
_d.push(_1.fx.combine(_14));
_d.push(_1.animateProperty(_1.mixin({duration:_e/3,onEnd:function(){
ds(n,{position:_11});
},properties:{top:_13}},_c)));
_d.push(a1);
_d.push(a2);
return _1.fx.chain(_d);
}});
});
