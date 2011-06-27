/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/dtl/filter/htmlstrings",["dojo/_base/kernel","../_base"],function(_1,dd){
_1.getObject("dtl.filter.htmlstrings",true,dojox);
_1.mixin(dojox.dtl.filter.htmlstrings,{_linebreaksrn:/(\r\n|\n\r)/g,_linebreaksn:/\n{2,}/g,_linebreakss:/(^\s+|\s+$)/g,_linebreaksbr:/\n/g,_removetagsfind:/[a-z0-9]+/g,_striptags:/<[^>]*?>/g,linebreaks:function(_2){
var _3=[];
var dh=dojox.dtl.filter.htmlstrings;
_2=_2.replace(dh._linebreaksrn,"\n");
var _4=_2.split(dh._linebreaksn);
for(var i=0;i<_4.length;i++){
var _5=_4[i].replace(dh._linebreakss,"").replace(dh._linebreaksbr,"<br />");
_3.push("<p>"+_5+"</p>");
}
return _3.join("\n\n");
},linebreaksbr:function(_6){
var dh=dojox.dtl.filter.htmlstrings;
return _6.replace(dh._linebreaksrn,"\n").replace(dh._linebreaksbr,"<br />");
},removetags:function(_7,_8){
var dh=dojox.dtl.filter.htmlstrings;
var _9=[];
var _a;
while(_a=dh._removetagsfind.exec(_8)){
_9.push(_a[0]);
}
_9="("+_9.join("|")+")";
return _7.replace(new RegExp("</?s*"+_9+"s*[^>]*>","gi"),"");
},striptags:function(_b){
return _b.replace(dojox.dtl.filter.htmlstrings._striptags,"");
}});
return dojox.dtl.filter.htmlstrings;
});
