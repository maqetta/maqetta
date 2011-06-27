/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/charting/axis2d/common",["dojo/_base/kernel","../../main","dojo/_base/lang","dojo/_base/html","dojo/_base/window","dojox/gfx"],function(_1,_2,_3,_4,_5,g){
var _6=_1.getObject("charting.axis2d.common",true,_2);
var _7=function(s){
s.marginLeft="0px";
s.marginTop="0px";
s.marginRight="0px";
s.marginBottom="0px";
s.paddingLeft="0px";
s.paddingTop="0px";
s.paddingRight="0px";
s.paddingBottom="0px";
s.borderLeftWidth="0px";
s.borderTopWidth="0px";
s.borderRightWidth="0px";
s.borderBottomWidth="0px";
};
var _8=function(n){
if(n["getBoundingClientRect"]){
var _9=n.getBoundingClientRect();
return _9.width||(_9.right-_9.left);
}else{
return _1.marginBox(n).w;
}
};
return _1.mixin(_6,{createText:{gfx:function(_a,_b,x,y,_c,_d,_e,_f){
return _b.createText({x:x,y:y,text:_d,align:_c}).setFont(_e).setFill(_f);
},html:function(_10,_11,x,y,_12,_13,_14,_15,_16){
var p=_1.doc.createElement("div"),s=p.style,_17;
if(_10.getTextDir){
p.dir=_10.getTextDir(_13);
}
_7(s);
s.font=_14;
p.innerHTML=String(_13).replace(/\s/g,"&nbsp;");
s.color=_15;
s.position="absolute";
s.left="-10000px";
_1.body().appendChild(p);
var _18=g.normalizedLength(g.splitFontString(_14).size);
if(!_16){
_17=_8(p);
}
if(p.dir=="rtl"){
x+=_16?_16:_17;
}
_1.body().removeChild(p);
s.position="relative";
if(_16){
s.width=_16+"px";
switch(_12){
case "middle":
s.textAlign="center";
s.left=(x-_16/2)+"px";
break;
case "end":
s.textAlign="right";
s.left=(x-_16)+"px";
break;
default:
s.left=x+"px";
s.textAlign="left";
break;
}
}else{
switch(_12){
case "middle":
s.left=Math.floor(x-_17/2)+"px";
break;
case "end":
s.left=Math.floor(x-_17)+"px";
break;
default:
s.left=Math.floor(x)+"px";
break;
}
}
s.top=Math.floor(y-_18)+"px";
s.whiteSpace="nowrap";
var _19=_1.doc.createElement("div"),w=_19.style;
_7(w);
w.width="0px";
w.height="0px";
_19.appendChild(p);
_10.node.insertBefore(_19,_10.node.firstChild);
return _19;
}}});
});
