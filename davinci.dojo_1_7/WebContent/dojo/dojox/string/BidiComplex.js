/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/string/BidiComplex",["dojo/_base/kernel","dojo/_base/array","dojo/_base/connect"],function(_1){
_1.experimental("dojox.string.BidiComplex");
_1.getObject("string.BidiComplex",true,dojox);
var _2=[];
dojox.string.BidiComplex.attachInput=function(_3,_4){
_3.alt=_4;
_1.connect(_3,"onkeydown",this,"_ceKeyDown");
_1.connect(_3,"onkeyup",this,"_ceKeyUp");
_1.connect(_3,"oncut",this,"_ceCutText");
_1.connect(_3,"oncopy",this,"_ceCopyText");
_3.value=dojox.string.BidiComplex.createDisplayString(_3.value,_3.alt);
};
dojox.string.BidiComplex.createDisplayString=function(_5,_6){
_5=dojox.string.BidiComplex.stripSpecialCharacters(_5);
var _7=dojox.string.BidiComplex._parse(_5,_6);
var _8="‪"+_5;
var _9=1;
_1.forEach(_7,function(n){
if(n!=null){
var _a=_8.substring(0,n+_9);
var _b=_8.substring(n+_9,_8.length);
_8=_a+"‎"+_b;
_9++;
}
});
return _8;
};
dojox.string.BidiComplex.stripSpecialCharacters=function(_c){
return _c.replace(/[\u200E\u200F\u202A-\u202E]/g,"");
};
dojox.string.BidiComplex._ceKeyDown=function(_d){
var _e=_1.isIE?_d.srcElement:_d.target;
_2=_e.value;
};
dojox.string.BidiComplex._ceKeyUp=function(_f){
var LRM="‎";
var _10=_1.isIE?_f.srcElement:_f.target;
var _11=_10.value;
var _12=_f.keyCode;
if((_12==_1.keys.HOME)||(_12==_1.keys.END)||(_12==_1.keys.SHIFT)){
return;
}
var _13,_14;
var _15=dojox.string.BidiComplex._getCaretPos(_f,_10);
if(_15){
_13=_15[0];
_14=_15[1];
}
if(_1.isIE){
var _16=_13,_17=_14;
if(_12==_1.keys.LEFT_ARROW){
if((_11.charAt(_14-1)==LRM)&&(_13==_14)){
dojox.string.BidiComplex._setSelectedRange(_10,_13-1,_14-1);
}
return;
}
if(_12==_1.keys.RIGHT_ARROW){
if(_11.charAt(_14-1)==LRM){
_17=_14+1;
if(_13==_14){
_16=_13+1;
}
}
dojox.string.BidiComplex._setSelectedRange(_10,_16,_17);
return;
}
}else{
if(_12==_1.keys.LEFT_ARROW){
if(_11.charAt(_14-1)==LRM){
dojox.string.BidiComplex._setSelectedRange(_10,_13-1,_14-1);
}
return;
}
if(_12==_1.keys.RIGHT_ARROW){
if(_11.charAt(_14-1)==LRM){
dojox.string.BidiComplex._setSelectedRange(_10,_13+1,_14+1);
}
return;
}
}
var _18=dojox.string.BidiComplex.createDisplayString(_11,_10.alt);
if(_11!=_18){
window.status=_11+" c="+_14;
_10.value=_18;
if((_12==_1.keys.DELETE)&&(_18.charAt(_14)==LRM)){
_10.value=_18.substring(0,_14)+_18.substring(_14+2,_18.length);
}
if(_12==_1.keys.DELETE){
dojox.string.BidiComplex._setSelectedRange(_10,_13,_14);
}else{
if(_12==_1.keys.BACKSPACE){
if((_2.length>=_14)&&(_2.charAt(_14-1)==LRM)){
dojox.string.BidiComplex._setSelectedRange(_10,_13-1,_14-1);
}else{
dojox.string.BidiComplex._setSelectedRange(_10,_13,_14);
}
}else{
if(_10.value.charAt(_14)!=LRM){
dojox.string.BidiComplex._setSelectedRange(_10,_13+1,_14+1);
}
}
}
}
};
dojox.string.BidiComplex._processCopy=function(_19,_1a,_1b){
if(_1a==null){
if(_1.isIE){
var _1c=document.selection.createRange();
_1a=_1c.text;
}else{
_1a=_19.value.substring(_19.selectionStart,_19.selectionEnd);
}
}
var _1d=dojox.string.BidiComplex.stripSpecialCharacters(_1a);
if(_1.isIE){
window.clipboardData.setData("Text",_1d);
}
return true;
};
dojox.string.BidiComplex._ceCopyText=function(_1e){
if(_1.isIE){
_1e.returnValue=false;
}
return dojox.string.BidiComplex._processCopy(_1e,null,false);
};
dojox.string.BidiComplex._ceCutText=function(_1f){
var ret=dojox.string.BidiComplex._processCopy(_1f,null,false);
if(!ret){
return false;
}
if(_1.isIE){
document.selection.clear();
}else{
var _20=_1f.selectionStart;
_1f.value=_1f.value.substring(0,_20)+_1f.value.substring(_1f.selectionEnd);
_1f.setSelectionRange(_20,_20);
}
return true;
};
dojox.string.BidiComplex._getCaretPos=function(_21,_22){
if(_1.isIE){
var _23=0,_24=document.selection.createRange().duplicate(),_25=_24.duplicate(),_26=_24.text.length;
if(_22.type=="textarea"){
_25.moveToElementText(_22);
}else{
_25.expand("textedit");
}
while(_24.compareEndPoints("StartToStart",_25)>0){
_24.moveStart("character",-1);
++_23;
}
return [_23,_23+_26];
}
return [_21.target.selectionStart,_21.target.selectionEnd];
};
dojox.string.BidiComplex._setSelectedRange=function(_27,_28,_29){
if(_1.isIE){
var _2a=_27.createTextRange();
if(_2a){
if(_27.type=="textarea"){
_2a.moveToElementText(_27);
}else{
_2a.expand("textedit");
}
_2a.collapse();
_2a.moveEnd("character",_29);
_2a.moveStart("character",_28);
_2a.select();
}
}else{
_27.selectionStart=_28;
_27.selectionEnd=_29;
}
};
var _2b=function(c){
return (c>="0"&&c<="9")||(c>"ÿ");
};
var _2c=function(c){
return (c>="A"&&c<="Z")||(c>="a"&&c<="z");
};
var _2d=function(_2e,i,_2f){
while(i>0){
if(i==_2f){
return false;
}
i--;
if(_2b(_2e.charAt(i))){
return true;
}
if(_2c(_2e.charAt(i))){
return false;
}
}
return false;
};
dojox.string.BidiComplex._parse=function(str,_30){
var _31=-1,_32=[];
var _33={FILE_PATH:"/\\:.",URL:"/:.?=&#",XPATH:"/\\:.<>=[]",EMAIL:"<>@.,;"}[_30];
switch(_30){
case "FILE_PATH":
case "URL":
case "XPATH":
_1.forEach(str,function(ch,i){
if(_33.indexOf(ch)>=0&&_2d(str,i,_31)){
_31=i;
_32.push(i);
}
});
break;
case "EMAIL":
var _34=false;
_1.forEach(str,function(ch,i){
if(ch=="\""){
if(_2d(str,i,_31)){
_31=i;
_32.push(i);
}
i++;
var i1=str.indexOf("\"",i);
if(i1>=i){
i=i1;
}
if(_2d(str,i,_31)){
_31=i;
_32.push(i);
}
}
if(_33.indexOf(ch)>=0&&_2d(str,i,_31)){
_31=i;
_32.push(i);
}
});
}
return _32;
};
return dojox.string.BidiComplex;
});
