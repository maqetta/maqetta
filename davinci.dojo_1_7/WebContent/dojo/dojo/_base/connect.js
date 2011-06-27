/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/_base/connect",["./kernel","../on","../aspect","./event","../mouse","../has","./lang"],function(_1,on,_2,_3,_4,_5){
_5.add("events-keypress-typed",function(){
var _6={charCode:0};
try{
_6=document.createEvent("KeyboardEvent");
(_6.initKeyboardEvent||_6.initKeyEvent).call(_6,"keypress",true,true,null,false,false,false,false,9,3);
}
catch(e){
}
return _6.charCode==0&&!_1.isOpera;
});
_1.connect=function(_7,_8,_9,_a,_b){
var a=arguments,_c=[],i=0;
_c.push(typeof a[0]=="string"?null:a[i++],a[i++]);
var a1=a[i+1];
_c.push(typeof a1=="string"||typeof a1=="function"?a[i++]:null,a[i++]);
for(var l=a.length;i<l;i++){
_c.push(a[i]);
}
return _1._connect.apply(this,_c);
};
_1._connect=function(_d,_e,_f,_10,_11){
if(typeof _e=="string"&&_e.substring(0,2)=="on"){
_e=_e.substring(2);
}else{
if(!_d||!(_d.addEventListener||_d.attachEvent)){
return _2.after(_d||_1.global,_e,_1.hitch(_f,_10),true);
}
}
if(!_d){
_d=_1.global;
}
if(!_11){
switch(_e){
case "keypress":
_e=_12;
break;
case "mouseenter":
_e=_4.enter;
break;
case "mouseleave":
_e=_4.leave;
break;
}
}
return on(_d,_e,_1.hitch(_f,_10),_11);
};
_1.disconnect=_1.unsubscribe=function(_13){
if(_13){
_13.remove();
}
};
_1.subscribe=function(_14,_15,_16){
return on(_14,_1.hitch(_15,_16));
};
_1.publish=function(_17,_18){
_17="on"+_17;
on[_17]&&on[_17].apply(this,_18||[]);
};
_1.connectPublisher=function(_19,obj,_1a){
var pf=function(){
_1.publish(_19,arguments);
};
return _1a?_1.connect(obj,_1a,pf):_1.connect(obj,pf);
};
_1.keys={BACKSPACE:8,TAB:9,CLEAR:12,ENTER:13,SHIFT:16,CTRL:17,ALT:18,META:_1.isSafari?91:224,PAUSE:19,CAPS_LOCK:20,ESCAPE:27,SPACE:32,PAGE_UP:33,PAGE_DOWN:34,END:35,HOME:36,LEFT_ARROW:37,UP_ARROW:38,RIGHT_ARROW:39,DOWN_ARROW:40,INSERT:45,DELETE:46,HELP:47,LEFT_WINDOW:91,RIGHT_WINDOW:92,SELECT:93,NUMPAD_0:96,NUMPAD_1:97,NUMPAD_2:98,NUMPAD_3:99,NUMPAD_4:100,NUMPAD_5:101,NUMPAD_6:102,NUMPAD_7:103,NUMPAD_8:104,NUMPAD_9:105,NUMPAD_MULTIPLY:106,NUMPAD_PLUS:107,NUMPAD_ENTER:108,NUMPAD_MINUS:109,NUMPAD_PERIOD:110,NUMPAD_DIVIDE:111,F1:112,F2:113,F3:114,F4:115,F5:116,F6:117,F7:118,F8:119,F9:120,F10:121,F11:122,F12:123,F13:124,F14:125,F15:126,NUM_LOCK:144,SCROLL_LOCK:145,UP_DPAD:175,DOWN_DPAD:176,LEFT_DPAD:177,RIGHT_DPAD:178,copyKey:_1.isMac&&!_1.isAIR?(_1.isSafari?91:224):17};
var _1b={106:42,111:47,186:59,187:43,188:44,189:45,190:46,191:47,192:96,219:91,220:92,221:93,222:39,229:113};
var _1c=_1.isMac?"metaKey":"ctrlKey";
_1.isCopyKey=function(e){
return e[_1c];
};
var _1d=function(evt,_1e){
var _1f=_1.mixin({},evt,_1e);
_20(_1f);
_1f.preventDefault=function(){
evt.preventDefault();
};
_1f.stopPropagation=function(){
evt.stopPropagation();
};
return _1f;
};
function _20(evt){
evt.keyChar=evt.charCode?String.fromCharCode(evt.charCode):"";
evt.charOrCode=evt.keyChar||evt.keyCode;
};
var _12;
if(_5("events-keypress-typed")){
var _21=function(e,_22){
try{
return (e.keyCode=_22);
}
catch(e){
return 0;
}
};
_12=function(_23,_24){
var _25=on(_23,"keydown",function(evt){
var k=evt.keyCode;
var _26=(k!=13||(_1.isIE>=9&&!_1.isQuirks))&&k!=32&&(k!=27||!_1.isIE)&&(k<48||k>90)&&(k<96||k>111)&&(k<186||k>192)&&(k<219||k>222)&&k!=229;
if(_26||evt.ctrlKey){
var c=_26?0:k;
if(evt.ctrlKey){
if(k==3||k==13){
return _24.call(evt.currentTarget,evt);
}else{
if(c>95&&c<106){
c-=48;
}else{
if((!evt.shiftKey)&&(c>=65&&c<=90)){
c+=32;
}else{
c=_1b[c]||c;
}
}
}
}
var _27=_1d(evt,{type:"keypress",faux:true,charCode:c});
_24.call(evt.currentTarget,_27);
if(_1.isIE){
_21(evt,_27.keyCode);
}
}
});
var _28=on(_23,"keypress",function(evt){
var c=evt.charCode;
c=c>=32?c:0;
evt=_1d(evt,{charCode:c,faux:true});
return _24.call(this,evt);
});
return {remove:function(){
_25.remove();
_28.remove();
}};
};
}else{
if(_1.isOpera){
_12=function(_29,_2a){
return on(_29,"keypress",function(evt){
var c=evt.which;
if(c==3){
c=99;
}
c=c<32&&!evt.shiftKey?0:c;
if(evt.ctrlKey&&!evt.shiftKey&&c>=65&&c<=90){
c+=32;
}
return _2a.call(this,_1d(evt,{charCode:c}));
});
};
}else{
_12=function(_2b,_2c){
return on(_2b,"keypress",function(evt){
_20(evt);
return _2c.call(this,evt);
});
};
}
}
_1._keypress=_12;
return _1.connect;
});
