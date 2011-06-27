/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/mobile/deviceTheme",["dojo/_base/kernel","dojo/_base/array","dojo/dom-construct","dojo/_base/window","./_base"],function(_1,_2,_3,_4,_5){
dojox.mobile.loadCssFile=function(_6){
_1.create("LINK",{href:_6,type:"text/css",rel:"stylesheet"},_1.doc.getElementsByTagName("head")[0]);
};
dojox.mobile.themeMap=dojox.mobile.themeMap||[["Android","android",[]],["BlackBerry","blackberry",[]],["iPad","iphone",[_1.moduleUrl("dojox.mobile","themes/iphone/ipad.css")]],["Custom","custom",[]],[".*","iphone",[]]];
dojox.mobile.loadDeviceTheme=function(){
var t=_1.config["mblThemeFiles"]||dojox.mobile.themeFiles||["@theme"];
if(!_1.isArray(t)){
}
var i,j;
var m=dojox.mobile.themeMap;
var ua=(location.search.match(/theme=(\w+)/))?RegExp.$1:navigator.userAgent;
for(i=0;i<m.length;i++){
if(ua.match(new RegExp(m[i][0]))){
var _7=m[i][1];
var _8=m[i][2];
for(j=t.length-1;j>=0;j--){
var _9=_1.isArray(t[j])?t[j][0]:"dojox.mobile";
var _a=_1.isArray(t[j])?t[j][1]:t[j];
var f="themes/"+_7+"/"+(_a==="@theme"?_7:_a)+".css";
_8.unshift(_1.moduleUrl(_9,f));
}
for(j=0;j<_8.length;j++){
dojox.mobile.loadCssFile(_8[j].toString());
}
break;
}
}
};
if(dojox.mobile.configDeviceTheme){
dojox.mobile.configDeviceTheme();
}
dojox.mobile.loadDeviceTheme();
return dojox.mobile.deviceTheme;
});
