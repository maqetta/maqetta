/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/html/ext-dojo/style",["dojo/_base/kernel","dojo/_base/html"],function(_1){
_1.experimental("dojox.html.ext-dojo.style");
var st=_1.getObject("html.ext-dojo.style",true,dojox);
_1.mixin(dojox.html["ext-dojo"].style,{supportsTransform:true,_toPx:function(_2){
var ds=_1.style,_3=this._conversion;
if(typeof _2==="number"){
return _2+"px";
}else{
if(_2.toLowerCase().indexOf("px")!=-1){
return _2;
}
}
!_3.parentNode&&_1.place(_3,_1.body());
ds(_3,"margin",_2);
return ds(_3,"margin");
},init:function(){
var ds=_1.style,_4=_1.doc.documentElement.style,_5=dojox.html["ext-dojo"].style;
_1.style=function(_6,_7,_8){
var n=_1.byId(_6),tr=(_7=="transform"),to=(_7=="transformOrigin"),_9=arguments.length;
if(_9==1){
return ds(_6);
}else{
if(_9==2){
if(tr){
return _5.getTransform(_6);
}else{
if(to){
return _5.getTransformOrigin(_6);
}else{
return ds(_6,_7);
}
}
}else{
if(_9==3){
if(tr){
_5.setTransform(n,_8,true);
}else{
if(to){
_5.setTransformOrigin(n,_8);
}else{
ds(_6,_7,_8);
}
}
}
}
}
};
for(var i=0,_a=["WebkitT","MozT","OT","msT","t"];i<_a.length;i++){
if(typeof _4[_a[i]+"ransform"]!=="undefined"){
this.tPropertyName=_a[i]+"ransform";
}
if(typeof _4[_a[i]+"ransformOrigin"]!=="undefined"){
this.toPropertyName=_a[i]+"ransformOrigin";
}
}
if(this.tPropertyName){
this.setTransform=function(_b,_c){
return _1.style(_b,this.tPropertyName,_c);
};
this.getTransform=function(_d){
return _1.style(_d,this.tPropertyName);
};
}else{
if(_1.isIE){
this.setTransform=this._setTransformFilter;
this.getTransform=this._getTransformFilter;
}
}
if(this.toPropertyName){
this.setTransformOrigin=function(_e,_f){
return _1.style(_e,this.toPropertyName,_f);
};
this.getTransformOrigin=function(_10){
return _1.style(_10,this.toPropertyName);
};
}else{
if(_1.isIE){
this.setTransformOrigin=this._setTransformOriginFilter;
this.getTransformOrigin=this._getTransformOriginFilter;
}else{
this.supportsTransform=false;
}
}
this._conversion=_1.create("div",{style:{position:"absolute",top:"-100px",left:"-100px",fontSize:0,width:"0",backgroundPosition:"50% 50%"}});
},_notSupported:function(){
console.warn("Sorry, this browser doesn't support transform and transform-origin");
},_setTransformOriginFilter:function(_11,_12){
var to=_1.trim(_12).replace(" top"," 0").replace("left ","0 ").replace(" center","50%").replace("center ","50% ").replace(" bottom"," 100%").replace("right ","100% ").replace(/\s+/," "),_13=to.split(" "),n=_1.byId(_11),t=this.getTransform(n),_14=true;
for(var i=0;i<_13.length;i++){
_14=_14&&/^0|(\d+(%|px|pt|in|pc|mm|cm))$/.test(_13[i]);
if(_13[i].indexOf("%")==-1){
_13[i]=this._toPx(_13[i]);
}
}
if(!_14){
return;
}
if(!_13.length||_13.length>2){
return;
}
_1.attr(n,"dojo-transform-origin",_13.join(" "));
t&&this.setTransform(_11,t);
},_getTransformOriginFilter:function(_15){
return _1.attr(_15,"dojo-transform-origin")||"50% 50%";
},_setTransformFilter:function(_16,_17){
var t=_17.replace(/\s/g,""),n=_1.byId(_16),_18=t.split(")"),_19=1,_1a=1,_1b="DXImageTransform.Microsoft.Matrix",_1c=_1.hasAttr,_1d=_1.attr,PI=Math.PI,cos=Math.cos,sin=Math.sin,tan=Math.tan,max=Math.max,min=Math.min,abs=Math.abs,_1e=PI/180,_1f=PI/200,ct="",_20="",_21=[],x0=0,y0=0,dx=0,dy=0,xc=0,yc=0,a=0,m11=1,m12=0,m21=0,m22=1,tx=0,ty=0,_22=[m11,m12,m21,m22,tx,ty],_23=false,ds=_1.style,_24=ds(n,"position")=="absolute"?"absolute":"relative",w=ds(n,"width")+ds(n,"paddingLeft")+ds(n,"paddingRight"),h=ds(n,"height")+ds(n,"paddingTop")+ds(n,"paddingBottom"),_25=this._toPx;
!_1c(n,"dojo-transform-origin")&&this.setTransformOrigin(n,"50% 50%");
for(var i=0,l=_18.length;i<l;i++){
_21=_18[i].match(/matrix|rotate|scaleX|scaleY|scale|skewX|skewY|skew|translateX|translateY|translate/);
_20=_21?_21[0]:"";
switch(_20){
case "matrix":
ct=_18[i].replace(/matrix\(|\)/g,"");
var _26=ct.split(",");
m11=_22[0]*_26[0]+_22[1]*_26[2];
m12=_22[0]*_26[1]+_22[1]*_26[3];
m21=_22[2]*_26[0]+_22[3]*_26[2];
m22=_22[2]*_26[1]+_22[3]*_26[3];
tx=_22[4]+_26[4];
ty=_22[5]+_26[5];
break;
case "rotate":
ct=_18[i].replace(/rotate\(|\)/g,"");
_19=ct.indexOf("deg")!=-1?_1e:ct.indexOf("grad")!=-1?_1f:1;
a=parseFloat(ct)*_19;
var s=sin(a),c=cos(a);
m11=_22[0]*c+_22[1]*s;
m12=-_22[0]*s+_22[1]*c;
m21=_22[2]*c+_22[3]*s;
m22=-_22[2]*s+_22[3]*c;
break;
case "skewX":
ct=_18[i].replace(/skewX\(|\)/g,"");
_19=ct.indexOf("deg")!=-1?_1e:ct.indexOf("grad")!=-1?_1f:1;
var ta=tan(parseFloat(ct)*_19);
m11=_22[0];
m12=_22[0]*ta+_22[1];
m21=_22[2];
m22=_22[2]*ta+_22[3];
break;
case "skewY":
ct=_18[i].replace(/skewY\(|\)/g,"");
_19=ct.indexOf("deg")!=-1?_1e:ct.indexOf("grad")!=-1?_1f:1;
ta=tan(parseFloat(ct)*_19);
m11=_22[0]+_22[1]*ta;
m12=_22[1];
m21=_22[2]+_22[3]*ta;
m22=_22[3];
break;
case "skew":
ct=_18[i].replace(/skew\(|\)/g,"");
var _27=ct.split(",");
_27[1]=_27[1]||"0";
_19=_27[0].indexOf("deg")!=-1?_1e:_27[0].indexOf("grad")!=-1?_1f:1;
_1a=_27[1].indexOf("deg")!=-1?_1e:_27[1].indexOf("grad")!=-1?_1f:1;
var a0=tan(parseFloat(_27[0])*_19),a1=tan(parseFloat(_27[1])*_1a);
m11=_22[0]+_22[1]*a1;
m12=_22[0]*a0+_22[1];
m21=_22[2]+_22[3]*a1;
m22=_22[2]*a0+_22[3];
break;
case "scaleX":
ct=parseFloat(_18[i].replace(/scaleX\(|\)/g,""))||1;
m11=_22[0]*ct;
m12=_22[1];
m21=_22[2]*ct;
m22=_22[3];
break;
case "scaleY":
ct=parseFloat(_18[i].replace(/scaleY\(|\)/g,""))||1;
m11=_22[0];
m12=_22[1]*ct;
m21=_22[2];
m22=_22[3]*ct;
break;
case "scale":
ct=_18[i].replace(/scale\(|\)/g,"");
var _28=ct.split(",");
_28[1]=_28[1]||_28[0];
m11=_22[0]*_28[0];
m12=_22[1]*_28[1];
m21=_22[2]*_28[0];
m22=_22[3]*_28[1];
break;
case "translateX":
ct=parseInt(_18[i].replace(/translateX\(|\)/g,""))||1;
m11=_22[0];
m12=_22[1];
m21=_22[2];
m22=_22[3];
tx=_25(ct);
tx&&_1d(n,"dojo-transform-matrix-tx",tx);
break;
case "translateY":
ct=parseInt(_18[i].replace(/translateY\(|\)/g,""))||1;
m11=_22[0];
m12=_22[1];
m21=_22[2];
m22=_22[3];
ty=_25(ct);
ty&&_1d(n,"dojo-transform-matrix-ty",ty);
break;
case "translate":
ct=_18[i].replace(/translate\(|\)/g,"");
m11=_22[0];
m12=_22[1];
m21=_22[2];
m22=_22[3];
var _29=ct.split(",");
_29[0]=parseInt(_25(_29[0]))||0;
_29[1]=parseInt(_25(_29[1]))||0;
tx=_29[0];
ty=_29[1];
tx&&_1d(n,"dojo-transform-matrix-tx",tx);
ty&&_1d(n,"dojo-transform-matrix-ty",ty);
break;
}
_22=[m11,m12,m21,m22,tx,ty];
}
var Bx=min(w*m11+h*m12,min(min(w*m11,h*m12),0)),By=min(w*m21+h*m22,min(min(w*m21,h*m22),0));
dx=-Bx;
dy=-By;
if(_1.isIE<8){
n.style.zoom="1";
if(_24!="absolute"){
var _2a=ds(_16.parentNode,"width"),tw=abs(w*m11),th=abs(h*m12),_2b=max(tw+th,max(max(th,tw),0));
dx-=(_2b-w)/2-(_2a>_2b?0:(_2b-_2a)/2);
}
}else{
if(_1.isIE==8){
ds(n,"zIndex")=="auto"&&(n.style.zIndex="0");
}
}
try{
_23=!!n.filters.item(_1b);
}
catch(e){
_23=false;
}
if(_23){
n.filters.item(_1b).M11=m11;
n.filters.item(_1b).M12=m12;
n.filters.item(_1b).M21=m21;
n.filters.item(_1b).M22=m22;
n.filters.item(_1b).filterType="bilinear";
n.filters.item(_1b).Dx=0;
n.filters.item(_1b).Dy=0;
n.filters.item(_1b).sizingMethod="auto expand";
}else{
n.style.filter+=" progid:"+_1b+"(M11="+m11+",M12="+m12+",M21="+m21+",M22="+m22+",FilterType='bilinear',Dx=0,Dy=0,sizingMethod='auto expand')";
}
tx=parseInt(_1d(n,"dojo-transform-matrix-tx")||"0");
ty=parseInt(_1d(n,"dojo-transform-matrix-ty")||"0");
var _2c=_1d(n,"dojo-transform-origin").split(" ");
for(i=0;i<2;i++){
_2c[i]=_2c[i]||"50%";
}
xc=(_2c[0].toString().indexOf("%")!=-1)?w*parseInt(_2c[0])*0.01:_2c[0];
yc=(_2c[1].toString().indexOf("%")!=-1)?h*parseInt(_2c[1])*0.01:_2c[1];
if(_1c(n,"dojo-startX")){
x0=parseInt(_1d(n,"dojo-startX"));
}else{
x0=parseInt(ds(n,"left"));
_1d(n,"dojo-startX",_24=="absolute"?x0:"0");
}
if(_1c(n,"dojo-startY")){
y0=parseInt(_1d(n,"dojo-startY"));
}else{
y0=parseInt(ds(n,"top"));
_1d(n,"dojo-startY",_24=="absolute"?y0:"0");
}
ds(n,{position:_24,left:x0-parseInt(dx)+parseInt(xc)-((parseInt(xc)-tx)*m11+(parseInt(yc)-ty)*m12)+"px",top:y0-parseInt(dy)+parseInt(yc)-((parseInt(xc)-tx)*m21+(parseInt(yc)-ty)*m22)+"px"});
},_getTransformFilter:function(_2d){
try{
var n=_1.byId(_2d),_2e=n.filters.item(0);
return "matrix("+_2e.M11+", "+_2e.M12+", "+_2e.M21+", "+_2e.M22+", "+(_1.attr(_2d,"dojo-transform-tx")||"0")+", "+(_1.attr(_2d,"dojo-transform-ty")||"0")+")";
}
catch(e){
return "matrix(1, 0, 0, 1, 0, 0)";
}
},setTransform:function(){
this._notSupported();
},setTransformOrigin:function(){
this._notSupported();
}});
dojox.html["ext-dojo"].style.init();
return _1.style;
});
