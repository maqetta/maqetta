/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/robotx",["dojo","dojo/robot"],function(_1){
_1.experimental("dojo.robotx");
var _2=null;
var _3=_1.connect(doh,"_groupStarted",function(){
_1.disconnect(_3);
_2.style.visibility="visible";
});
var _4=function(){
_1.addOnLoad(function(){
var _5={overflow:_1.isWebKit?"hidden":"visible",margin:"0px",borderWidth:"0px",height:"100%",width:"100%"};
_1.style(document.documentElement,_5);
_1.style(document.body,_5);
document.body.appendChild(_2);
var _6=document.createElement("base");
_6.href=_2.src;
document.getElementsByTagName("head")[0].appendChild(_6);
});
};
var _7=false;
var _8=null;
var _9=doh.robot._run;
doh.robot._run=function(_a){
_7=true;
_8=_a;
doh.robot._run=_9;
if(_2.src){
_4();
}
};
var _b=function(){
doh.robot._updateDocument();
_b=null;
var _c=(document.compatMode=="BackCompat")?document.body:document.documentElement;
var _d=document.getElementById("robotconsole").offsetHeight;
if(_d){
_2.style.height=(_c.clientHeight-_d)+"px";
}
if(_2.contentWindow.dojo){
_2.contentWindow.dojo.addOnLoad(function(){
doh.robot._run(_8);
});
}else{
doh.robot._run(_8);
}
};
var _e=function(){
if(_b){
_b();
}
var _f=_1.connect(_1.body(),"onunload",function(){
_1.global=window;
_1.doc=document;
_1.disconnect(_f);
});
};
_1.config.debugContainerId="robotconsole";
_1.config.debugHeight=_1.config.debugHeight||200;
document.write("<div id=\"robotconsole\" style=\"position:absolute;left:0px;bottom:0px;width:100%;\"></div>");
_2=document.createElement("iframe");
_2.setAttribute("ALLOWTRANSPARENCY","true");
_2.scrolling=_1.isIE?"yes":"auto";
_1.style(_2,{visibility:"hidden",border:"0px none",padding:"0px",margin:"0px",position:"absolute",left:"0px",top:"0px",width:"100%",height:"100%"});
if(_2["attachEvent"]!==undefined){
_2.attachEvent("onload",_e);
}else{
_1.connect(_2,"onload",_e);
}
_1.mixin(doh.robot,{_updateDocument:function(){
_1.setContext(_2.contentWindow,_2.contentWindow.document);
var win=_1.global;
if(win.dojo){
_1.publish=win.dojo.publish;
_1.subscribe=win.dojo.subscribe;
_1.connectPublisher=win.dojo.connectPublisher;
}
},initRobot:function(url){
_2.src=url;
if(_7){
_4();
}
},waitForPageToLoad:function(_10){
var d=new doh.Deferred();
_b=function(){
_b=null;
doh.robot._updateDocument();
d.callback(true);
};
_10();
return d;
}});
return doh.robot;
});
