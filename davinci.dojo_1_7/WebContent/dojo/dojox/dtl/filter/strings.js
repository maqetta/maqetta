/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/dtl/filter/strings",["dojo/_base/kernel","dojo/_base/lang","dojox/string/tokenize","dojox/string/sprintf","../filter/htmlstrings","dojo/_base/array"],function(_1,_2,_3){
_1.getObject("dtl.filter.strings",true,dojox);
_1.mixin(dojox.dtl.filter.strings,{_urlquote:function(_4,_5){
if(!_5){
_5="/";
}
return _3(_4,/([^\w-_.])/g,function(_6){
if(_5.indexOf(_6)==-1){
if(_6==" "){
return "+";
}else{
return "%"+_6.charCodeAt(0).toString(16).toUpperCase();
}
}
return _6;
}).join("");
},addslashes:function(_7){
return _7.replace(/\\/g,"\\\\").replace(/"/g,"\\\"").replace(/'/g,"\\'");
},capfirst:function(_8){
_8=""+_8;
return _8.charAt(0).toUpperCase()+_8.substring(1);
},center:function(_9,_a){
_a=_a||_9.length;
_9=_9+"";
var _b=_a-_9.length;
if(_b%2){
_9=_9+" ";
_b-=1;
}
for(var i=0;i<_b;i+=2){
_9=" "+_9+" ";
}
return _9;
},cut:function(_c,_d){
_d=_d+""||"";
_c=_c+"";
return _c.replace(new RegExp(_d,"g"),"");
},_fix_ampersands:/&(?!(\w+|#\d+);)/g,fix_ampersands:function(_e){
return _e.replace(dojox.dtl.filter.strings._fix_ampersands,"&amp;");
},floatformat:function(_f,arg){
arg=parseInt(arg||-1,10);
_f=parseFloat(_f);
var m=_f-_f.toFixed(0);
if(!m&&arg<0){
return _f.toFixed();
}
_f=_f.toFixed(Math.abs(arg));
return (arg<0)?parseFloat(_f)+"":_f;
},iriencode:function(_10){
return dojox.dtl.filter.strings._urlquote(_10,"/#%[]=:;$&()+,!");
},linenumbers:function(_11){
var df=dojox.dtl.filter;
var _12=_11.split("\n");
var _13=[];
var _14=(_12.length+"").length;
for(var i=0,_15;i<_12.length;i++){
_15=_12[i];
_13.push(df.strings.ljust(i+1,_14)+". "+dojox.dtl._base.escape(_15));
}
return _13.join("\n");
},ljust:function(_16,arg){
_16=_16+"";
arg=parseInt(arg,10);
while(_16.length<arg){
_16=_16+" ";
}
return _16;
},lower:function(_17){
return (_17+"").toLowerCase();
},make_list:function(_18){
var _19=[];
if(typeof _18=="number"){
_18=_18+"";
}
if(_18.charAt){
for(var i=0;i<_18.length;i++){
_19.push(_18.charAt(i));
}
return _19;
}
if(typeof _18=="object"){
for(var key in _18){
_19.push(_18[key]);
}
return _19;
}
return [];
},rjust:function(_1a,arg){
_1a=_1a+"";
arg=parseInt(arg,10);
while(_1a.length<arg){
_1a=" "+_1a;
}
return _1a;
},slugify:function(_1b){
_1b=_1b.replace(/[^\w\s-]/g,"").toLowerCase();
return _1b.replace(/[\-\s]+/g,"-");
},_strings:{},stringformat:function(_1c,arg){
arg=""+arg;
var _1d=dojox.dtl.filter.strings._strings;
if(!_1d[arg]){
_1d[arg]=new dojox.string.sprintf.Formatter("%"+arg);
}
return _1d[arg].format(_1c);
},title:function(_1e){
var _1f,_20="";
for(var i=0,_21;i<_1e.length;i++){
_21=_1e.charAt(i);
if(_1f==" "||_1f=="\n"||_1f=="\t"||!_1f){
_20+=_21.toUpperCase();
}else{
_20+=_21.toLowerCase();
}
_1f=_21;
}
return _20;
},_truncatewords:/[ \n\r\t]/,truncatewords:function(_22,arg){
arg=parseInt(arg,10);
if(!arg){
return _22;
}
for(var i=0,j=_22.length,_23=0,_24,_25;i<_22.length;i++){
_24=_22.charAt(i);
if(dojox.dtl.filter.strings._truncatewords.test(_25)){
if(!dojox.dtl.filter.strings._truncatewords.test(_24)){
++_23;
if(_23==arg){
return _22.substring(0,j+1);
}
}
}else{
if(!dojox.dtl.filter.strings._truncatewords.test(_24)){
j=i;
}
}
_25=_24;
}
return _22;
},_truncate_words:/(&.*?;|<.*?>|(\w[\w\-]*))/g,_truncate_tag:/<(\/)?([^ ]+?)(?: (\/)| .*?)?>/,_truncate_singlets:{br:true,col:true,link:true,base:true,img:true,param:true,area:true,hr:true,input:true},truncatewords_html:function(_26,arg){
arg=parseInt(arg,10);
if(arg<=0){
return "";
}
var _27=dojox.dtl.filter.strings;
var _28=0;
var _29=[];
var _2a=_3(_26,_27._truncate_words,function(all,_2b){
if(_2b){
++_28;
if(_28<arg){
return _2b;
}else{
if(_28==arg){
return _2b+" ...";
}
}
}
var tag=all.match(_27._truncate_tag);
if(!tag||_28>=arg){
return;
}
var _2c=tag[1];
var _2d=tag[2].toLowerCase();
var _2e=tag[3];
if(_2c||_27._truncate_singlets[_2d]){
}else{
if(_2c){
var i=_1.indexOf(_29,_2d);
if(i!=-1){
_29=_29.slice(i+1);
}
}else{
_29.unshift(_2d);
}
}
return all;
}).join("");
_2a=_2a.replace(/\s+$/g,"");
for(var i=0,tag;tag=_29[i];i++){
_2a+="</"+tag+">";
}
return _2a;
},upper:function(_2f){
return _2f.toUpperCase();
},urlencode:function(_30){
return dojox.dtl.filter.strings._urlquote(_30);
},_urlize:/^((?:[(>]|&lt;)*)(.*?)((?:[.,)>\n]|&gt;)*)$/,_urlize2:/^\S+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+$/,urlize:function(_31){
return dojox.dtl.filter.strings.urlizetrunc(_31);
},urlizetrunc:function(_32,arg){
arg=parseInt(arg);
return _3(_32,/(\S+)/g,function(_33){
var _34=dojox.dtl.filter.strings._urlize.exec(_33);
if(!_34){
return _33;
}
var _35=_34[1];
var _36=_34[2];
var _37=_34[3];
var _38=_36.indexOf("www.")==0;
var _39=_36.indexOf("@")!=-1;
var _3a=_36.indexOf(":")!=-1;
var _3b=_36.indexOf("http://")==0;
var _3c=_36.indexOf("https://")==0;
var _3d=/[a-zA-Z0-9]/.test(_36.charAt(0));
var _3e=_36.substring(_36.length-4);
var _3f=_36;
if(arg>3){
_3f=_3f.substring(0,arg-3)+"...";
}
if(_38||(!_39&&!_3b&&_36.length&&_3d&&(_3e==".org"||_3e==".net"||_3e==".com"))){
return "<a href=\"http://"+_36+"\" rel=\"nofollow\">"+_3f+"</a>";
}else{
if(_3b||_3c){
return "<a href=\""+_36+"\" rel=\"nofollow\">"+_3f+"</a>";
}else{
if(_39&&!_38&&!_3a&&dojox.dtl.filter.strings._urlize2.test(_36)){
return "<a href=\"mailto:"+_36+"\">"+_36+"</a>";
}
}
}
return _33;
}).join("");
},wordcount:function(_40){
_40=_1.trim(_40);
if(!_40){
return 0;
}
return _40.split(/\s+/g).length;
},wordwrap:function(_41,arg){
arg=parseInt(arg);
var _42=[];
var _43=_41.split(/\s+/g);
if(_43.length){
var _44=_43.shift();
_42.push(_44);
var pos=_44.length-_44.lastIndexOf("\n")-1;
for(var i=0;i<_43.length;i++){
_44=_43[i];
if(_44.indexOf("\n")!=-1){
var _45=_44.split(/\n/g);
}else{
var _45=[_44];
}
pos+=_45[0].length+1;
if(arg&&pos>arg){
_42.push("\n");
pos=_45[_45.length-1].length;
}else{
_42.push(" ");
if(_45.length>1){
pos=_45[_45.length-1].length;
}
}
_42.push(_44);
}
}
return _42.join("");
}});
return dojox.dtl.filter.strings;
});
