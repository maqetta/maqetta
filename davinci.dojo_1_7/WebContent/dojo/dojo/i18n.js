/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define("dojo/i18n",["./_base/kernel","require","./has","./_base/array","./_base/lang","./_base/xhr"],function(_1,_2,_3){
var _4=_1.i18n={},_5=/(^.*(^|\/)nls)(\/|$)([^\/]*)\/?([^\/]*)/,_6=function(_7,_8,_9,_a){
for(var _b=[_9+_a],_c=_8.split("-"),_d="",i=0;i<_c.length;i++){
_d+=(_d?"-":"")+_c[i];
if(!_7||_7[_d]){
_b.push(_9+_d+"/"+_a);
}
}
return _b;
},_e={},_f=_1.getL10nName=function(_10,_11,_12){
_12=_12?_12.toLowerCase():_1.locale;
_10="dojo/i18n!"+_10.replace(/\./g,"/");
_11=_11.replace(/\./g,"/");
return (/root/i.test(_12))?(_10+"/nls/"+_11):(_10+"/nls/"+_12+"/"+_11);
},_13=function(id,_14,_15){
var _16=_5.exec(id),_17=((_14.toAbsMid&&_14.toAbsMid(_16[1]))||_16[1])+"/",_18=_16[5]||_16[4],_19=_17+_18,_1a=(_16[5]&&_16[4])||_1.locale,_1b=_19+"/"+_1a;
if(_e[_1b]){
_15(_e[_1b]);
return;
}
_14([_19],function(_1c){
var _1d=_e[_19+"/"]=_1.clone(_1c.root),_1e=_6(!_1c._v1x&&_1c,_1a,_17,_18);
_14(_1e,function(){
for(var i=1;i<_1e.length;i++){
_e[_1e[i]]=_1d=_1.mixin(_1.clone(_1d),arguments[i]);
}
_e[_1b]=_1d;
_15(_1.delegate(_1d));
});
});
};
true||_3.add("dojo-v1x-i18n-Api",1);
if(1){
var _1f=new Function("bundle","var __preAmdResult, __amdResult; function define(bundle){__amdResult= bundle;} __preAmdResult= eval(bundle); return [__preAmdResult, __amdResult];"),_20=function(url,_21,_22){
return _21?(/nls\/[^\/]+\/[^\/]+$/.test(url)?_21:{root:_21,_v1x:1}):_22;
},_23=function(_24,_25){
var _26=[];
_1.forEach(_24,function(mid){
var url=_2.toUrl(mid+".js");
if(_e[url]){
_26.push(_e[url]);
}else{
try{
var _27=_2(mid);
if(_27){
_26.push(_27);
return;
}
}
catch(e){
}
_1.xhrGet({url:url,sync:true,load:function(_28){
var _29=_1f(_28);
_26.push(_e[url]=_20(url,_29[0],_29[1]));
},error:function(){
_26.push(_e[url]={});
}});
}
});
_25.apply(_25,_26);
};
_23.toAbsMid=function(mid){
return _2.toAbsMid(mid);
};
_4.getLocalization=function(_2a,_2b,_2c){
var _2d,_2e=_f(_2a,_2b,_2c);
_13(_2e.substring(10),_23,function(_2f){
_2d=_2f;
});
return _2d;
};
_4.normalizeLocale=function(_30){
var _31=_30?_30.toLowerCase():_1.locale;
if(_31=="root"){
_31="ROOT";
}
return _31;
};
}
_4.load=_13;
_4.cache=function(mid,_32){
_e[mid]=_32;
};
return _4;
});
