/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/i18n",["./_base/kernel","require","./has","./_base/array","./_base/lang","./_base/xhr"],function(_1,_2,_3,_4,_5){
var _6=_1.i18n={},_7=/(^.*(^|\/)nls)(\/|$)([^\/]*)\/?([^\/]*)/,_8=function(_9,_a,_b,_c){
for(var _d=[_b+_c],_e=_a.split("-"),_f="",i=0;i<_e.length;i++){
_f+=(_f?"-":"")+_e[i];
if(!_9||_9[_f]){
_d.push(_b+_f+"/"+_c);
}
}
return _d;
},_10={},_11=_1.getL10nName=function(_12,_13,_14){
_14=_14?_14.toLowerCase():_1.locale;
_12="dojo/i18n!"+_12.replace(/\./g,"/");
_13=_13.replace(/\./g,"/");
return (/root/i.test(_14))?(_12+"/nls/"+_13):(_12+"/nls/"+_14+"/"+_13);
},_15=function(_16,_17,_18,_19,_1a){
_2([_16],function(_1b){
var _1c=_10[_16+"/"]=_1.clone(_1b.root),_1d=_8(!_1b._v1x&&_1b,_19,_17,_18);
_2(_1d,function(){
for(var i=1;i<_1d.length;i++){
_10[_1d[i]]=_1c=_1.mixin(_1.clone(_1c),arguments[i]);
}
var _1e=_16+"/"+_19;
_10[_1e]=_1c;
_1a&&_1a(_1.delegate(_1c));
});
});
},_1f=function(id,_20,_21){
var _22=_7.exec(id),_23=((_20.toAbsMid&&_20.toAbsMid(_22[1]))||_22[1])+"/",_24=_22[5]||_22[4],_25=_23+_24,_26=(_22[5]&&_22[4]),_27=_26||_1.locale,_28=_25+"/"+_27;
if(_26){
if(_10[_28]){
_21(_10[_28]);
}else{
_15(_25,_23,_24,_27,_21);
}
return;
}
var _29=_1.config.extraLocale||[];
_29=_5.isArray(_29)?_29:[_29];
_29.push(_27);
_4.forEach(_29,function(_2a){
_15(_25,_23,_24,_2a,_2a==_27&&_21);
});
};
true||_3.add("dojo-v1x-i18n-Api",1);
if(1){
var _2b=new Function("bundle","var __preAmdResult, __amdResult; function define(bundle){__amdResult= bundle;} __preAmdResult= eval(bundle); return [__preAmdResult, __amdResult];"),_2c=function(url,_2d,_2e){
return _2d?(/nls\/[^\/]+\/[^\/]+$/.test(url)?_2d:{root:_2d,_v1x:1}):_2e;
},_2f=function(_30,_31){
var _32=[];
_1.forEach(_30,function(mid){
var url=_2.toUrl(mid+".js");
if(_10[url]){
_32.push(_10[url]);
}else{
try{
var _33=_2(mid);
if(_33){
_32.push(_33);
return;
}
}
catch(e){
}
_1.xhrGet({url:url,sync:true,load:function(_34){
var _35=_2b(_34);
_32.push(_10[url]=_2c(url,_35[0],_35[1]));
},error:function(){
_32.push(_10[url]={});
}});
}
});
_31.apply(_31,_32);
};
_2f.toAbsMid=function(mid){
return _2.toAbsMid(mid);
};
_6.getLocalization=function(_36,_37,_38){
var _39,_3a=_11(_36,_37,_38).substring(10),_3b=_2.isXdUrl(_2.toUrl(_3a+".js"));
_1f(_3a,_3b?_2:_2f,function(_3c){
_39=_3c;
});
return _39;
};
_6.normalizeLocale=function(_3d){
var _3e=_3d?_3d.toLowerCase():_1.locale;
if(_3e=="root"){
_3e="ROOT";
}
return _3e;
};
}
_6.load=_1f;
_6.cache=function(mid,_3f){
_10[mid]=_3f;
};
return _6;
});
