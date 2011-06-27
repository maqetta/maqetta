/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/date/relative",["dojo/_base/kernel","dojo/_base/lang","dojo/date/locale","dojo/i18n"],function(d,_1,_2,_3){
dojo.getObject("date.relative",true,dojox);
var _4=1000*60*60*24,_5=6*_4,_6=d.delegate,_7=_2._getGregorianBundle,_8=_2.format;
function _9(_a){
_a=new Date(_a);
_a.setHours(0,0,0,0);
return _a;
};
dojox.date.relative.format=function(_b,_c){
_c=_c||{};
var _d=_9(_c.relativeDate||new Date()),_e=_d.getTime()-_9(_b).getTime(),_f={locale:_c.locale};
if(_e===0){
return _8(_b,_6(_f,{selector:"time"}));
}else{
if(_e<=_5&&_e>0&&_c.weekCheck!==false){
return _8(_b,_6(_f,{selector:"date",datePattern:"EEE"}))+" "+_8(_b,_6(_f,{selector:"time",formatLength:"short"}));
}else{
if(_b.getFullYear()==_d.getFullYear()){
var _10=_7(_3.normalizeLocale(_c.locale));
return _8(_b,_6(_f,{selector:"date",datePattern:_10["dateFormatItem-MMMd"]}));
}else{
return _8(_b,_6(_f,{selector:"date",formatLength:"medium",locale:_c.locale}));
}
}
}
};
});
