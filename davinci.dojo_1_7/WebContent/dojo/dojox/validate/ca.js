/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/validate/ca",["dojo/_base/kernel","./_base","./regexp","./us"],function(_1,_2,_3,us){
var ca=_1.getObject("ca",true,_2);
_1.mixin(ca,{isPhoneNumber:function(_4){
return us.isPhoneNumber(_4);
},isProvince:function(_5){
var re=new RegExp("^"+_3.ca.province()+"$","i");
return re.test(_5);
},isSocialInsuranceNumber:function(_6){
var _7={format:["###-###-###","### ### ###","#########"]};
return _2.isNumberFormat(_6,_7);
},isPostalCode:function(_8){
var re=new RegExp("^"+_3.ca.postalCode()+"$","i");
return re.test(_8);
}});
return ca;
});
