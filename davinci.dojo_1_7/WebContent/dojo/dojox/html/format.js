/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/html/format",["dojo/_base/kernel","./entities","dojo/_base/lang","dojo/_base/array","dojo/_base/window"],function(d,_1){
var _2=d.getObject("html.format",true,dojox);
_2.prettyPrint=function(_3,_4,_5,_6,_7){
var _8=[];
var _9=0;
var _a=[];
var _b="\t";
var _c="";
var _d=[];
var i;
var _e=/[=]([^"']+?)(\s|>)/g;
var _f=/style=("[^"]*"|'[^']*'|\S*)/gi;
var _10=/[\w-]+=("[^"]*"|'[^']*'|\S*)/gi;
if(_4&&_4>0&&_4<10){
_b="";
for(i=0;i<_4;i++){
_b+=" ";
}
}
var _11=d.doc.createElement("div");
_11.innerHTML=_3;
var _12=_1.encode;
var _13=_1.decode;
var _14=function(tag){
switch(tag){
case "a":
case "b":
case "strong":
case "s":
case "strike":
case "i":
case "u":
case "em":
case "sup":
case "sub":
case "span":
case "font":
case "big":
case "cite":
case "q":
case "small":
return true;
default:
return false;
}
};
var div=_11.ownerDocument.createElement("div");
var _15=function(_16){
var _17=_16.cloneNode(false);
div.appendChild(_17);
var _18=div.innerHTML;
div.innerHTML="";
return _18;
};
var _19=function(){
var i,txt="";
for(i=0;i<_9;i++){
txt+=_b;
}
return txt.length;
};
var _1a=function(){
var i;
for(i=0;i<_9;i++){
_8.push(_b);
}
};
var _1b=function(){
_8.push("\n");
};
var _1c=function(n){
_c+=_12(n.nodeValue,_6);
};
var _1d=function(txt){
var i;
var _1e;
var _1f=txt.split("\n");
for(i=0;i<_1f.length;i++){
_1f[i]=d.trim(_1f[i]);
}
txt=_1f.join(" ");
txt=d.trim(txt);
if(txt!==""){
var _20=[];
if(_5&&_5>0){
var _21=_19();
var _22=_5;
if(_5>_21){
_22-=_21;
}
while(txt){
if(txt.length>_5){
for(i=_22;(i>0&&txt.charAt(i)!==" ");i--){
}
if(!i){
for(i=_22;(i<txt.length&&txt.charAt(i)!==" ");i++){
}
}
var _23=txt.substring(0,i);
_23=d.trim(_23);
txt=d.trim(txt.substring((i==txt.length)?txt.length:i+1,txt.length));
if(_23){
_1e="";
for(i=0;i<_9;i++){
_1e+=_b;
}
_23=_1e+_23+"\n";
}
_20.push(_23);
}else{
_1e="";
for(i=0;i<_9;i++){
_1e+=_b;
}
txt=_1e+txt+"\n";
_20.push(txt);
txt=null;
}
}
return _20.join("");
}else{
_1e="";
for(i=0;i<_9;i++){
_1e+=_b;
}
txt=_1e+txt+"\n";
return txt;
}
}else{
return "";
}
};
var _24=function(txt){
if(txt){
txt=txt.replace(/&quot;/gi,"\"");
txt=txt.replace(/&gt;/gi,">");
txt=txt.replace(/&lt;/gi,"<");
txt=txt.replace(/&amp;/gi,"&");
}
return txt;
};
var _25=function(txt){
if(txt){
txt=_24(txt);
var i,t,c,_26;
var _27=0;
var _28=txt.split("\n");
var _29=[];
for(i=0;i<_28.length;i++){
var _2a=_28[i];
var _2b=(_2a.indexOf("\n")>-1);
_2a=d.trim(_2a);
if(_2a){
var _2c=_27;
for(c=0;c<_2a.length;c++){
var ch=_2a.charAt(c);
if(ch==="{"){
_27++;
}else{
if(ch==="}"){
_27--;
_2c=_27;
}
}
}
_26="";
for(t=0;t<_9+_2c;t++){
_26+=_b;
}
_29.push(_26+_2a+"\n");
}else{
if(_2b&&i===0){
_29.push("\n");
}
}
}
txt=_29.join("");
}
return txt;
};
var _2d=function(_2e){
var _2f=_2e.nodeName.toLowerCase();
var _30=d.trim(_15(_2e));
var tag=_30.substring(0,_30.indexOf(">")+1);
tag=tag.replace(_e,"=\"$1\"$2");
tag=tag.replace(_f,function(_31){
var sL=_31.substring(0,6);
var _32=_31.substring(6,_31.length);
var _33=_32.charAt(0);
_32=d.trim(_32.substring(1,_32.length-1));
_32=_32.split(";");
var _34=[];
d.forEach(_32,function(s){
s=d.trim(s);
if(s){
s=s.substring(0,s.indexOf(":")).toLowerCase()+s.substring(s.indexOf(":"),s.length);
_34.push(s);
}
});
_34=_34.sort();
_32=_34.join("; ");
var ts=d.trim(_32);
if(!ts||ts===";"){
return "";
}else{
_32+=";";
return sL+_33+_32+_33;
}
});
var _35=[];
tag=tag.replace(_10,function(_36){
_35.push(d.trim(_36));
return "";
});
_35=_35.sort();
tag="<"+_2f;
if(_35.length){
tag+=" "+_35.join(" ");
}
if(_30.indexOf("</")!=-1){
_a.push(_2f);
tag+=">";
}else{
if(_7){
tag+=" />";
}else{
tag+=">";
}
_a.push(false);
}
var _37=_14(_2f);
_d.push(_37);
if(_c&&!_37){
_8.push(_1d(_c));
_c="";
}
if(!_37){
_1a();
_8.push(tag);
_1b();
_9++;
}else{
_c+=tag;
}
};
var _38=function(){
var _39=_d.pop();
if(_c&&!_39){
_8.push(_1d(_c));
_c="";
}
var ct=_a.pop();
if(ct){
ct="</"+ct+">";
if(!_39){
_9--;
_1a();
_8.push(ct);
_1b();
}else{
_c+=ct;
}
}else{
_9--;
}
};
var _3a=function(n){
var _3b=_13(n.nodeValue,_6);
_1a();
_8.push("<!--");
_1b();
_9++;
_8.push(_1d(_3b));
_9--;
_1a();
_8.push("-->");
_1b();
};
var _3c=function(_3d){
var _3e=_3d.childNodes;
if(_3e){
var i;
for(i=0;i<_3e.length;i++){
var n=_3e[i];
if(n.nodeType===1){
var tg=d.trim(n.tagName.toLowerCase());
if(d.isIE&&n.parentNode!=_3d){
continue;
}
if(tg&&tg.charAt(0)==="/"){
continue;
}else{
_2d(n);
if(tg==="script"){
_8.push(_25(n.innerHTML));
}else{
if(tg==="pre"){
var _3f=n.innerHTML;
if(d.isMoz){
_3f=_3f.replace("<br>","\n");
_3f=_3f.replace("<pre>","");
_3f=_3f.replace("</pre>","");
}
if(_3f.charAt(_3f.length-1)!=="\n"){
_3f+="\n";
}
_8.push(_3f);
}else{
_3c(n);
}
}
_38();
}
}else{
if(n.nodeType===3||n.nodeType===4){
_1c(n);
}else{
if(n.nodeType===8){
_3a(n);
}
}
}
}
}
};
_3c(_11);
if(_c){
_8.push(_1d(_c));
_c="";
}
return _8.join("");
};
return _2;
});
