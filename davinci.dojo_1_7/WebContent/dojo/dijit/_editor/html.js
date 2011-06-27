/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/_editor/html",["dojo/_base/kernel","..","dojo/_base/lang","dojo/_base/sniff"],function(_1,_2){
_1.getObject("_editor",true,_2);
_2._editor.escapeXml=function(_3,_4){
_3=_3.replace(/&/gm,"&amp;").replace(/</gm,"&lt;").replace(/>/gm,"&gt;").replace(/"/gm,"&quot;");
if(!_4){
_3=_3.replace(/'/gm,"&#39;");
}
return _3;
};
_2._editor.getNodeHtml=function(_5){
var _6;
switch(_5.nodeType){
case 1:
var _7=_5.nodeName.toLowerCase();
if(!_7||_7.charAt(0)=="/"){
return "";
}
_6="<"+_7;
var _8=[];
var _9;
if(_1.isIE&&_5.outerHTML){
var s=_5.outerHTML;
s=s.substr(0,s.indexOf(">")).replace(/(['"])[^"']*\1/g,"");
var _a=/(\b\w+)\s?=/g;
var m,_b;
while((m=_a.exec(s))){
_b=m[1];
if(_b.substr(0,3)!="_dj"){
if(_b=="src"||_b=="href"){
if(_5.getAttribute("_djrealurl")){
_8.push([_b,_5.getAttribute("_djrealurl")]);
continue;
}
}
var _c,_d;
switch(_b){
case "style":
_c=_5.style.cssText.toLowerCase();
break;
case "class":
_c=_5.className;
break;
case "width":
if(_7==="img"){
_d=/width=(\S+)/i.exec(s);
if(_d){
_c=_d[1];
}
break;
}
case "height":
if(_7==="img"){
_d=/height=(\S+)/i.exec(s);
if(_d){
_c=_d[1];
}
break;
}
default:
_c=_5.getAttribute(_b);
}
if(_c!=null){
_8.push([_b,_c.toString()]);
}
}
}
}else{
var i=0;
while((_9=_5.attributes[i++])){
var n=_9.name;
if(n.substr(0,3)!="_dj"){
var v=_9.value;
if(n=="src"||n=="href"){
if(_5.getAttribute("_djrealurl")){
v=_5.getAttribute("_djrealurl");
}
}
_8.push([n,v]);
}
}
}
_8.sort(function(a,b){
return a[0]<b[0]?-1:(a[0]==b[0]?0:1);
});
var j=0;
while((_9=_8[j++])){
_6+=" "+_9[0]+"=\""+(_1.isString(_9[1])?_2._editor.escapeXml(_9[1],true):_9[1])+"\"";
}
if(_7==="script"){
_6+=">"+_5.innerHTML+"</"+_7+">";
}else{
if(_5.childNodes.length){
_6+=">"+_2._editor.getChildrenHtml(_5)+"</"+_7+">";
}else{
switch(_7){
case "br":
case "hr":
case "img":
case "input":
case "base":
case "meta":
case "area":
case "basefont":
_6+=" />";
break;
default:
_6+="></"+_7+">";
}
}
}
break;
case 4:
case 3:
_6=_2._editor.escapeXml(_5.nodeValue,true);
break;
case 8:
_6="<!--"+_2._editor.escapeXml(_5.nodeValue,true)+"-->";
break;
default:
_6="<!-- Element not recognized - Type: "+_5.nodeType+" Name: "+_5.nodeName+"-->";
}
return _6;
};
_2._editor.getChildrenHtml=function(_e){
var _f="";
if(!_e){
return _f;
}
var _10=_e["childNodes"]||_e;
var _11=!_1.isIE||_10!==_e;
var _12,i=0;
while((_12=_10[i++])){
if(!_11||_12.parentNode==_e){
_f+=_2._editor.getNodeHtml(_12);
}
}
return _f;
};
return _2._editor;
});
