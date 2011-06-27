/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/charting/themes/ThreeD",["dojo/_base/kernel","dojo/_base/array","../Theme","./gradientGenerator","./PrimaryColors","dojo/colors","./common"],function(_1,_2,_3,_4,_5){
var _6=dojox.charting.themes,_7=["#f00","#0f0","#00f","#ff0","#0ff","#f0f","./common"],_8={type:"linear",space:"shape",x1:0,y1:0,x2:100,y2:0},_9=[{o:0,i:174},{o:0.08,i:231},{o:0.18,i:237},{o:0.3,i:231},{o:0.39,i:221},{o:0.49,i:206},{o:0.58,i:187},{o:0.68,i:165},{o:0.8,i:128},{o:0.9,i:102},{o:1,i:174}],_a=2,_b=100,_c=50,_d=_1.map(_7,function(c){
var _e=_1.delegate(_8),_7=_e.colors=_4.generateGradientByIntensity(c,_9),_f=_7[_a].color;
_f.r+=_b;
_f.g+=_b;
_f.b+=_b;
_f.sanitize();
return _e;
});
_6.ThreeD=_5.clone();
_6.ThreeD.series.shadow={dx:1,dy:1,width:3,color:[0,0,0,0.15]};
_6.ThreeD.next=function(_10,_11,_12){
if(_10=="bar"||_10=="column"){
var _13=this._current%this.seriesThemes.length,s=this.seriesThemes[_13],old=s.fill;
s.fill=_d[_13];
var _14=_3.prototype.next.apply(this,arguments);
s.fill=old;
return _14;
}
return _3.prototype.next.apply(this,arguments);
};
return _6.ThreeD;
});
