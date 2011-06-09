/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define("dojo/cookie",["./_base/kernel","./regexp"],function(_1,_2){
_1.cookie=function(_3,_4,_5){
var c=document.cookie;
if(arguments.length==1){
var _6=c.match(new RegExp("(?:^|; )"+_2.escapeString(_3)+"=([^;]*)"));
return _6?decodeURIComponent(_6[1]):undefined;
}else{
_5=_5||{};
var _7=_5.expires;
if(typeof _7=="number"){
var d=new Date();
d.setTime(d.getTime()+_7*24*60*60*1000);
_7=_5.expires=d;
}
if(_7&&_7.toUTCString){
_5.expires=_7.toUTCString();
}
_4=encodeURIComponent(_4);
var _8=_3+"="+_4,_9;
for(_9 in _5){
_8+="; "+_9;
var _a=_5[_9];
if(_a!==true){
_8+="="+_a;
}
}
document.cookie=_8;
}
};
_1.cookie.isSupported=function(){
if(!("cookieEnabled" in navigator)){
this("__djCookieTest__","CookiesAllowed");
navigator.cookieEnabled=this("__djCookieTest__")=="CookiesAllowed";
if(navigator.cookieEnabled){
this("__djCookieTest__","",{expires:-1});
}
}
return navigator.cookieEnabled;
};
return _1.cookie;
});
