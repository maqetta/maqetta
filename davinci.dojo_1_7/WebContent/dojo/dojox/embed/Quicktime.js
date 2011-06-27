/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/embed/Quicktime",["dojo","dijit","dojox"],function(_1,_2,_3){
_1.getObject("dojox.embed.Quicktime",1);
(function(d){
var _4,_5={major:0,minor:0,rev:0},_6,_7={width:320,height:240,redirect:null},_8="dojox-embed-quicktime-",_9=0,_a="This content requires the <a href=\"http://www.apple.com/quicktime/download/\" title=\"Download and install QuickTime.\">QuickTime plugin</a>.";
function _b(_c){
_c=d.mixin(d.clone(_7),_c||{});
if(!("path" in _c)&&!_c.testing){
console.error("dojox.embed.Quicktime(ctor):: no path reference to a QuickTime movie was provided.");
return null;
}
if(_c.testing){
_c.path="";
}
if(!("id" in _c)){
_c.id=_8+_9++;
}
return _c;
};
if(d.isIE){
_6=(function(){
try{
var o=new ActiveXObject("QuickTimeCheckObject.QuickTimeCheck.1");
if(o!==undefined){
var v=o.QuickTimeVersion.toString(16);
function p(i){
return (v.substring(i,i+1)-0)||0;
};
_5={major:p(0),minor:p(1),rev:p(2)};
return o.IsQuickTimeAvailable(0);
}
}
catch(e){
}
return false;
})();
_4=function(_d){
if(!_6){
return {id:null,markup:_a};
}
_d=_b(_d);
if(!_d){
return null;
}
var s="<object classid=\"clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B\" "+"codebase=\"http://www.apple.com/qtactivex/qtplugin.cab#version=6,0,2,0\" "+"id=\""+_d.id+"\" "+"width=\""+_d.width+"\" "+"height=\""+_d.height+"\">"+"<param name=\"src\" value=\""+_d.path+"\"/>";
for(var p in _d.params||{}){
s+="<param name=\""+p+"\" value=\""+_d.params[p]+"\"/>";
}
s+="</object>";
return {id:_d.id,markup:s};
};
}else{
_6=(function(){
for(var i=0,p=navigator.plugins,l=p.length;i<l;i++){
if(p[i].name.indexOf("QuickTime")>-1){
return true;
}
}
return false;
})();
_4=function(_e){
if(!_6){
return {id:null,markup:_a};
}
_e=_b(_e);
if(!_e){
return null;
}
var s="<embed type=\"video/quicktime\" src=\""+_e.path+"\" "+"id=\""+_e.id+"\" "+"name=\""+_e.id+"\" "+"pluginspage=\"www.apple.com/quicktime/download\" "+"enablejavascript=\"true\" "+"width=\""+_e.width+"\" "+"height=\""+_e.height+"\"";
for(var p in _e.params||{}){
s+=" "+p+"=\""+_e.params[p]+"\"";
}
s+="></embed>";
return {id:_e.id,markup:s};
};
}
_3.embed.Quicktime=function(_f,_10){
return _3.embed.Quicktime.place(_f,_10);
};
d.mixin(_3.embed.Quicktime,{minSupported:6,available:_6,supported:_6,version:_5,initialized:false,onInitialize:function(){
_3.embed.Quicktime.initialized=true;
},place:function(_11,_12){
var o=_4(_11);
if(!(_12=d.byId(_12))){
_12=d.create("div",{id:o.id+"-container"},d.body());
}
if(o){
_12.innerHTML=o.markup;
if(o.id){
return d.isIE?d.byId(o.id):document[o.id];
}
}
return null;
}});
if(!d.isIE){
var id="-qt-version-test",o=_4({testing:true,width:4,height:4}),c=10,top="-1000px",_13="1px";
function _14(){
setTimeout(function(){
var qt=document[o.id],n=d.byId(id);
if(qt){
try{
var v=qt.GetQuickTimeVersion().split(".");
_3.embed.Quicktime.version={major:parseInt(v[0]||0),minor:parseInt(v[1]||0),rev:parseInt(v[2]||0)};
if(_3.embed.Quicktime.supported=v[0]){
_3.embed.Quicktime.onInitialize();
}
c=0;
}
catch(e){
if(c--){
_14();
}
}
}
if(!c&&n){
d.destroy(n);
}
},20);
};
if(d._initFired){
d.create("div",{innerHTML:o.markup,id:id,style:{top:top,left:0,width:_13,height:_13,overflow:"hidden",position:"absolute"}},d.body());
}else{
document.write("<div style=\"top:"+top+";left:0;width:"+_13+";height:"+_13+";overflow:hidden;position:absolute\" id=\""+id+"\">"+o.markup+"</div>");
}
_14();
}else{
if(d.isIE&&_6){
setTimeout(function(){
_3.embed.Quicktime.onInitialize();
},10);
}
}
})(_1);
return _1.getObject("dojox.embed.Quicktime");
});
require(["dojox/embed/Quicktime"]);
