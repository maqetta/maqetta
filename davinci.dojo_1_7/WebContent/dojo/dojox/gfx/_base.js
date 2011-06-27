/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/gfx/_base",["dojo/_base/kernel","dojox/main","dojo/_base/html","dojo/_base/Color"],function(_1,_2){
_1.getObject("gfx._base",true,_2);
var g=_2.gfx,b=g._base;
g._hasClass=function(_3,_4){
var _5=_3.getAttribute("className");
return _5&&(" "+_5+" ").indexOf(" "+_4+" ")>=0;
};
g._addClass=function(_6,_7){
var _8=_6.getAttribute("className")||"";
if(!_8||(" "+_8+" ").indexOf(" "+_7+" ")<0){
_6.setAttribute("className",_8+(_8?" ":"")+_7);
}
};
g._removeClass=function(_9,_a){
var _b=_9.getAttribute("className");
if(_b){
_9.setAttribute("className",_b.replace(new RegExp("(^|\\s+)"+_a+"(\\s+|$)"),"$1$2"));
}
};
b._getFontMeasurements=function(){
var _c={"1em":0,"1ex":0,"100%":0,"12pt":0,"16px":0,"xx-small":0,"x-small":0,"small":0,"medium":0,"large":0,"x-large":0,"xx-large":0};
var p;
if(_1.isIE){
_1.doc.documentElement.style.fontSize="100%";
}
var _d=_1.create("div",{style:{position:"absolute",left:"0",top:"-100px",width:"30px",height:"1000em",borderWidth:"0",margin:"0",padding:"0",outline:"none",lineHeight:"1",overflow:"hidden"}},_1.body());
for(p in _c){
_d.style.fontSize=p;
_c[p]=Math.round(_d.offsetHeight*12/16)*16/12/1000;
}
_1.body().removeChild(_d);
return _c;
};
var _e=null;
b._getCachedFontMeasurements=function(_f){
if(_f||!_e){
_e=b._getFontMeasurements();
}
return _e;
};
var _10=null,_11={};
b._getTextBox=function(_12,_13,_14){
var m,s,al=arguments.length;
var i;
if(!_10){
_10=_1.create("div",{style:{position:"absolute",top:"-10000px",left:"0"}},_1.body());
}
m=_10;
m.className="";
s=m.style;
s.borderWidth="0";
s.margin="0";
s.padding="0";
s.outline="0";
if(al>1&&_13){
for(i in _13){
if(i in _11){
continue;
}
s[i]=_13[i];
}
}
if(al>2&&_14){
m.className=_14;
}
m.innerHTML=_12;
if(m["getBoundingClientRect"]){
var bcr=m.getBoundingClientRect();
return {l:bcr.left,t:bcr.top,w:bcr.width||(bcr.right-bcr.left),h:bcr.height||(bcr.bottom-bcr.top)};
}else{
return _1.marginBox(m);
}
};
var _15=0;
b._getUniqueId=function(){
var id;
do{
id=_1._scopeName+"Unique"+(++_15);
}while(_1.byId(id));
return id;
};
_1.mixin(_2.gfx,{defaultPath:{type:"path",path:""},defaultPolyline:{type:"polyline",points:[]},defaultRect:{type:"rect",x:0,y:0,width:100,height:100,r:0},defaultEllipse:{type:"ellipse",cx:0,cy:0,rx:200,ry:100},defaultCircle:{type:"circle",cx:0,cy:0,r:100},defaultLine:{type:"line",x1:0,y1:0,x2:100,y2:100},defaultImage:{type:"image",x:0,y:0,width:0,height:0,src:""},defaultText:{type:"text",x:0,y:0,text:"",align:"start",decoration:"none",rotated:false,kerning:true},defaultTextPath:{type:"textpath",text:"",align:"start",decoration:"none",rotated:false,kerning:true},defaultStroke:{type:"stroke",color:"black",style:"solid",width:1,cap:"butt",join:4},defaultLinearGradient:{type:"linear",x1:0,y1:0,x2:100,y2:100,colors:[{offset:0,color:"black"},{offset:1,color:"white"}]},defaultRadialGradient:{type:"radial",cx:0,cy:0,r:100,colors:[{offset:0,color:"black"},{offset:1,color:"white"}]},defaultPattern:{type:"pattern",x:0,y:0,width:0,height:0,src:""},defaultFont:{type:"font",style:"normal",variant:"normal",weight:"normal",size:"10pt",family:"serif"},getDefault:(function(){
var _16={};
return function(_17){
var t=_16[_17];
if(t){
return new t();
}
t=_16[_17]=new Function();
t.prototype=_2.gfx["default"+_17];
return new t();
};
})(),normalizeColor:function(_18){
return (_18 instanceof _1.Color)?_18:new _1.Color(_18);
},normalizeParameters:function(_19,_1a){
var x;
if(_1a){
var _1b={};
for(x in _19){
if(x in _1a&&!(x in _1b)){
_19[x]=_1a[x];
}
}
}
return _19;
},makeParameters:function(_1c,_1d){
var i=null;
if(!_1d){
return _1.delegate(_1c);
}
var _1e={};
for(i in _1c){
if(!(i in _1e)){
_1e[i]=_1.clone((i in _1d)?_1d[i]:_1c[i]);
}
}
return _1e;
},formatNumber:function(x,_1f){
var val=x.toString();
if(val.indexOf("e")>=0){
val=x.toFixed(4);
}else{
var _20=val.indexOf(".");
if(_20>=0&&val.length-_20>5){
val=x.toFixed(4);
}
}
if(x<0){
return val;
}
return _1f?" "+val:val;
},makeFontString:function(_21){
return _21.style+" "+_21.variant+" "+_21.weight+" "+_21.size+" "+_21.family;
},splitFontString:function(str){
var _22=_2.gfx.getDefault("Font");
var t=str.split(/\s+/);
do{
if(t.length<5){
break;
}
_22.style=t[0];
_22.variant=t[1];
_22.weight=t[2];
var i=t[3].indexOf("/");
_22.size=i<0?t[3]:t[3].substring(0,i);
var j=4;
if(i<0){
if(t[4]=="/"){
j=6;
}else{
if(t[4].charAt(0)=="/"){
j=5;
}
}
}
if(j<t.length){
_22.family=t.slice(j).join(" ");
}
}while(false);
return _22;
},cm_in_pt:72/2.54,mm_in_pt:7.2/2.54,px_in_pt:function(){
return _2.gfx._base._getCachedFontMeasurements()["12pt"]/12;
},pt2px:function(len){
return len*_2.gfx.px_in_pt();
},px2pt:function(len){
return len/_2.gfx.px_in_pt();
},normalizedLength:function(len){
if(len.length===0){
return 0;
}
if(len.length>2){
var _23=_2.gfx.px_in_pt();
var val=parseFloat(len);
switch(len.slice(-2)){
case "px":
return val;
case "pt":
return val*_23;
case "in":
return val*72*_23;
case "pc":
return val*12*_23;
case "mm":
return val*_2.gfx.mm_in_pt*_23;
case "cm":
return val*_2.gfx.cm_in_pt*_23;
}
}
return parseFloat(len);
},pathVmlRegExp:/([A-Za-z]+)|(\d+(\.\d+)?)|(\.\d+)|(-\d+(\.\d+)?)|(-\.\d+)/g,pathSvgRegExp:/([A-Za-z])|(\d+(\.\d+)?)|(\.\d+)|(-\d+(\.\d+)?)|(-\.\d+)/g,equalSources:function(a,b){
return a&&b&&a===b;
},switchTo:function(_24){
var ns=typeof _24=="string"?_2.gfx[_24]:_24;
if(ns){
_1.forEach(["Group","Rect","Ellipse","Circle","Line","Polyline","Image","Text","Path","TextPath","Surface","createSurface","fixTarget"],function(_25){
_2.gfx[_25]=ns[_25];
});
}
}});
});
