/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/place",["dojo/_base/kernel",".","dojo/window","dojo/_base/array","dojo/_base/html","dojo/_base/window"],function(_1,_2){
function _3(_4,_5,_6,_7){
var _8=_1.window.getBox();
if(!_4.parentNode||String(_4.parentNode.tagName).toLowerCase()!="body"){
_1.body().appendChild(_4);
}
var _9=null;
_1.some(_5,function(_a){
var _b=_a.corner;
var _c=_a.pos;
var _d=0;
var _e={w:{"L":_8.l+_8.w-_c.x,"R":_c.x-_8.l,"M":_8.w}[_b.charAt(1)],h:{"T":_8.t+_8.h-_c.y,"B":_c.y-_8.t,"M":_8.h}[_b.charAt(0)]};
if(_6){
var _f=_6(_4,_a.aroundCorner,_b,_e,_7);
_d=typeof _f=="undefined"?0:_f;
}
var _10=_4.style;
var _11=_10.display;
var _12=_10.visibility;
if(_10.display=="none"){
_10.visibility="hidden";
_10.display="";
}
var mb=_1.marginBox(_4);
_10.display=_11;
_10.visibility=_12;
var _13={"L":_c.x,"R":_c.x-mb.w,"M":Math.max(_8.l,Math.min(_8.l+_8.w,_c.x+(mb.w>>1))-mb.w)}[_b.charAt(1)],_14={"T":_c.y,"B":_c.y-mb.h,"M":Math.max(_8.t,Math.min(_8.t+_8.h,_c.y+(mb.h>>1))-mb.h)}[_b.charAt(0)],_15=Math.max(_8.l,_13),_16=Math.max(_8.t,_14),_17=Math.min(_8.l+_8.w,_13+mb.w),_18=Math.min(_8.t+_8.h,_14+mb.h),_19=_17-_15,_1a=_18-_16;
_d+=(mb.w-_19)+(mb.h-_1a);
if(_9==null||_d<_9.overflow){
_9={corner:_b,aroundCorner:_a.aroundCorner,x:_15,y:_16,w:_19,h:_1a,overflow:_d,spaceAvailable:_e};
}
return !_d;
});
if(_9.overflow&&_6){
_6(_4,_9.aroundCorner,_9.corner,_9.spaceAvailable,_7);
}
var l=_1._isBodyLtr(),s=_4.style;
s.top=_9.y+"px";
s[l?"left":"right"]=(l?_9.x:_8.w-_9.x-_9.w)+"px";
return _9;
};
_2.place={at:function(_1b,pos,_1c,_1d){
var _1e=_1.map(_1c,function(_1f){
var c={corner:_1f,pos:{x:pos.x,y:pos.y}};
if(_1d){
c.pos.x+=_1f.charAt(1)=="L"?_1d.x:-_1d.x;
c.pos.y+=_1f.charAt(0)=="T"?_1d.y:-_1d.y;
}
return c;
});
return _3(_1b,_1e);
},around:function(_20,_21,_22,_23,_24){
if(typeof _21=="string"||"offsetWidth" in _21){
_21=_1.position(_21,true);
}
var x=_21.x,y=_21.y,_25="w" in _21?_21.w:(_21.w=_21.width),_26="h" in _21?_21.h:(_1.deprecated("place.around: dijit.place.__Rectangle: { x:"+x+", y:"+y+", height:"+_21.height+", width:"+_25+" } has been deprecated.  Please use { x:"+x+", y:"+y+", h:"+_21.height+", w:"+_25+" }","","2.0"),_21.h=_21.height);
var _27=[];
function _28(_29,_2a){
_27.push({aroundCorner:_29,corner:_2a,pos:{x:{"L":x,"R":x+_25,"M":x+(_25>>1)}[_29.charAt(1)],y:{"T":y,"B":y+_26,"M":y+(_26>>1)}[_29.charAt(0)]}});
};
_1.forEach(_22,function(pos){
var ltr=_23;
switch(pos){
case "above-centered":
_28("TM","BM");
break;
case "below-centered":
_28("BM","TM");
break;
case "after":
ltr=!ltr;
case "before":
_28(ltr?"ML":"MR",ltr?"MR":"ML");
break;
case "below-alt":
ltr=!ltr;
case "below":
_28(ltr?"BL":"BR",ltr?"TL":"TR");
_28(ltr?"BR":"BL",ltr?"TR":"TL");
break;
case "above-alt":
ltr=!ltr;
case "above":
_28(ltr?"TL":"TR",ltr?"BL":"BR");
_28(ltr?"TR":"TL",ltr?"BR":"BL");
break;
default:
_28(pos.aroundCorner,pos.corner);
}
});
return _3(_20,_27,_24,{w:_25,h:_26});
}};
return _2.place;
});
