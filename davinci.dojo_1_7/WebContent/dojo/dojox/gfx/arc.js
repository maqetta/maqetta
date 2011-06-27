/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/gfx/arc",["./matrix"],function(_1){
dojo.getObject("dojox.gfx.arc",true);
var m=dojox.gfx.matrix,_2=2*Math.PI,_3=Math.PI/4,_4=Math.PI/8,_5=_3+_4,_6=_7(_4);
function _7(_8){
var _9=Math.cos(_8),_a=Math.sin(_8),p2={x:_9+(4/3)*(1-_9),y:_a-(4/3)*_9*(1-_9)/_a};
return {s:{x:_9,y:-_a},c1:{x:p2.x,y:-p2.y},c2:p2,e:{x:_9,y:_a}};
};
dojox.gfx.arc={unitArcAsBezier:_7,curvePI4:_6,arcAsBezier:function(_b,rx,ry,_c,_d,_e,x,y){
_d=Boolean(_d);
_e=Boolean(_e);
var _f=m._degToRad(_c),rx2=rx*rx,ry2=ry*ry,pa=m.multiplyPoint(m.rotate(-_f),{x:(_b.x-x)/2,y:(_b.y-y)/2}),_10=pa.x*pa.x,_11=pa.y*pa.y,c1=Math.sqrt((rx2*ry2-rx2*_11-ry2*_10)/(rx2*_11+ry2*_10));
if(isNaN(c1)){
c1=0;
}
var ca={x:c1*rx*pa.y/ry,y:-c1*ry*pa.x/rx};
if(_d==_e){
ca={x:-ca.x,y:-ca.y};
}
var c=m.multiplyPoint([m.translate((_b.x+x)/2,(_b.y+y)/2),m.rotate(_f)],ca);
var _12=m.normalize([m.translate(c.x,c.y),m.rotate(_f),m.scale(rx,ry)]);
var _13=m.invert(_12),sp=m.multiplyPoint(_13,_b),ep=m.multiplyPoint(_13,x,y),_14=Math.atan2(sp.y,sp.x),_15=Math.atan2(ep.y,ep.x),_16=_14-_15;
if(_e){
_16=-_16;
}
if(_16<0){
_16+=_2;
}else{
if(_16>_2){
_16-=_2;
}
}
var _17=_4,_18=_6,_19=_e?_17:-_17,_1a=[];
for(var _1b=_16;_1b>0;_1b-=_3){
if(_1b<_5){
_17=_1b/2;
_18=_7(_17);
_19=_e?_17:-_17;
_1b=0;
}
var c2,e,M=m.normalize([_12,m.rotate(_14+_19)]);
if(_e){
c1=m.multiplyPoint(M,_18.c1);
c2=m.multiplyPoint(M,_18.c2);
e=m.multiplyPoint(M,_18.e);
}else{
c1=m.multiplyPoint(M,_18.c2);
c2=m.multiplyPoint(M,_18.c1);
e=m.multiplyPoint(M,_18.s);
}
_1a.push([c1.x,c1.y,c2.x,c2.y,e.x,e.y]);
_14+=2*_19;
}
return _1a;
}};
return dojox.gfx.arc;
});
