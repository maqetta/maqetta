/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/validate/web",["dojo/_base/kernel","./_base","./regexp"],function(_1,_2,_3){
dojox.validate.isIpAddress=function(_4,_5){
var re=new RegExp("^"+_3.ipAddress(_5)+"$","i");
return re.test(_4);
};
dojox.validate.isUrl=function(_6,_7){
var re=new RegExp("^"+_3.url(_7)+"$","i");
return re.test(_6);
};
dojox.validate.isEmailAddress=function(_8,_9){
var re=new RegExp("^"+_3.emailAddress(_9)+"$","i");
return re.test(_8);
};
dojox.validate.isEmailAddressList=function(_a,_b){
var re=new RegExp("^"+_3.emailAddressList(_b)+"$","i");
return re.test(_a);
};
dojox.validate.getEmailAddressList=function(_c,_d){
if(!_d){
_d={};
}
if(!_d.listSeparator){
_d.listSeparator="\\s;,";
}
if(_2.isEmailAddressList(_c,_d)){
return _c.split(new RegExp("\\s*["+_d.listSeparator+"]\\s*"));
}
return [];
};
return dojox.validate;
});
