/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/_base/loader",["./kernel","../has","require","module","./json","./lang","./array"],function(_1,_2,_3,_4,_5,_6,_7){
if(!1){
console.error("cannot load the Dojo v1.x loader with a foreign loader");
return 0;
}
var _8=function(){
return 0;
};
if(1){
var _9=location.protocol,_a=location.host,_b=!_a;
_8=function(_c){
if(_b||/^\./.test(_c)){
return false;
}
if(/^\/\//.test(_c)){
return true;
}
var _d=_c.match(/^([^\/\:]+\:)\/\/([^\/]+)/);
return _d&&(_d[1]!=_9||_d[2]!=_a);
};
}
var _e=function(id){
return {src:_4.id,id:id};
},_f=function(_10){
return _10.replace(/\./g,"/");
},_11=/\/\/>>built/,_12={},_13=function(mid,_14,_15){
var _16=1,_17=function(){
if(--_16==0){
_15(1);
}
};
var _18="dojo/require!"+_14.module.mid+"!"+mid,_19;
_7.some(_14.module.deps,function(_1a){
if(_18==_1a.mid){
_19=_1a.dojoRequireMids=[];
return 1;
}
return 0;
});
_7.forEach(mid.split(","),function(mid){
_16++;
var _1b=_1c(mid,_14.module);
mid=_1b.mid;
_19&&_19.push(mid);
(_12[mid]||(_12[mid]=[])).push(_17);
_1d(_1b);
});
_1e();
_17();
},_1e=function(){
var _1f=[],_20=[],_21=function(mid){
if(_1f[mid]!==undefined){
return _1f[mid];
}
var _22=_5a[mid];
if(_22.executed){
return (_1f[mid]=1);
}
if(_22.injected!==_55){
return (_1f[mid]=0);
}
if(_20[mid]){
return 1;
}
_20[mid]=1;
for(var dep,i=0,_23=_22.deps||[],end=_23.length;i<end;){
dep=_23[i++];
if((dep.dojoRequireMids&&!_7.every(dep.dojoRequireMids,_21))||!_21(dep.mid)){
return _1f[_22.mid]=0;
}
}
return _1f[mid]=1;
},p,_24=0;
for(p in _12){
_21(p);
}
for(p in _1f){
if(_1f[p]&&_12[p]){
_7.forEach(_12[p],function(_25){
_25();
});
delete _12[p];
_24=1;
}
}
return _24?(_1e()||1):0;
},_26=function(mid,_27,_28){
_27([mid],function(_29){
_27(_29.names,function(){
for(var _2a="",_2b=[],i=0;i<arguments.length;i++){
_2a+="var "+_29.names[i]+"= arguments["+i+"]; ";
_2b.push(arguments[i]);
}
eval(_2a);
var _2c=_27.module,_2d=[],_2e={},_2f=[],p,_30={provide:function(_31){
_31=_f(_31);
var _32=_1c(_31,_2c);
if(_32!==_2c){
_5c(_32);
}
},require:function(_33,_34){
_33=_f(_33);
_34&&(_1c(_33,_2c).result=_56);
_2f.push(_33);
},requireLocalization:function(_35,_36,_37){
_2d.length||(_2d=["dojo/i18n"]);
_37=(_37||_1.locale).toLowerCase();
_35=_f(_35)+"/nls/"+(/root/i.test(_37)?"":_37+"/")+_f(_36);
if(_1c(_35,_2c).isXd){
_2d.push("dojo/i18n!"+_35);
}
},loadInit:function(f){
f();
}};
try{
for(p in _30){
_2e[p]=_1[p];
_1[p]=_30[p];
}
_29.def.apply(null,_2b);
}
catch(e){
_5d("error",[_e("failedDojoLoadInit"),e]);
}
finally{
for(p in _30){
_1[p]=_2e[p];
}
}
_2f.length&&_2d.push("dojo/require!"+_2f.join(","));
_27(_2d,function(){
_28(1);
});
});
});
},_38=function(_39,_3a,_3b){
var _3c=/\(|\)/g,_3d=1,_3e;
_3c.lastIndex=_3a;
while((_3e=_3c.exec(_39))){
if(_3e[0]==")"){
_3d-=1;
}else{
_3d+=1;
}
if(_3d==0){
break;
}
}
if(_3d!=0){
throw "unmatched paren around character "+_3c.lastIndex+" in: "+_39;
}
return [_1.trim(_39.substring(_3b,_3c.lastIndex))+";\n",_3c.lastIndex];
},_3f=/(\/\*([\s\S]*?)\*\/|\/\/(.*)$)/mg,_40=/(^|\s)dojo\.(loadInit|require|provide|requireLocalization|requireIf|requireAfterIf|platformRequire)\s*\(/mg,_41=/(^|\s)(require|define)\s*\(/m,_42=function(_43,_44){
var _45,_46,_47,_48,_49=[],_4a=[],_4b=[];
_44=_44||_43.replace(_3f,function(_4c){
_40.lastIndex=_41.lastIndex=0;
return (_40.test(_4c)||_41.test(_4c))?"":_4c;
});
while((_45=_40.exec(_44))){
_46=_40.lastIndex;
_47=_46-_45[0].length;
_48=_38(_44,_46,_47);
if(_45[2]=="loadInit"){
_49.push(_48[0]);
}else{
_4a.push(_48[0]);
}
_40.lastIndex=_48[1];
}
_4b=_49.concat(_4a);
if(_4b.length||!_41.test(_44)){
return [_43.replace(/(^|\s)dojo\.loadInit\s*\(/g,"\n0 && dojo.loadInit("),_4b.join(""),_4b];
}else{
return 0;
}
},_4d=function(_4e,_4f){
var _50,id,_51=[],_52=[];
if(_11.test(_4f)||!(_50=_42(_4f))){
return 0;
}
id=_4e.mid+"-*loadInit";
for(var p in _1c("dojo",_4e).result.scopeMap){
_51.push(p);
_52.push("\""+p+"\"");
}
return "// xdomain rewrite of "+_4e.path+"\n"+"define('"+id+"',{\n"+"\tnames:"+_1.toJson(_51)+",\n"+"\tdef:function("+_51.join(",")+"){"+_50[1]+"}"+"});\n\n"+"define("+_1.toJson(_51.concat(["dojo/loadInit!"+id]))+", function("+_51.join(",")+"){\n"+_50[0]+"});";
},_53=_3.initSyncLoader(_13,_1e,_4d,_8),_54=_53.sync,xd=_53.xd,_55=_53.arrived,_56=_53.nonmodule,_57=_53.executing,_58=_53.executed,_59=_53.syncExecStack,_5a=_53.modules,_5b=_53.execQ,_1c=_53.getModule,_1d=_53.injectModule,_5c=_53.setArrived,_5d=_53.signal,_5e=_53.finishExec,_5f=_53.execModule,_60=_53.getLegacyMode;
_1.provide=function(mid){
var _61=_59[0],_62=_6.mixin(_1c(_f(mid),_3.module),{executed:_57,result:_6.getObject(mid,true)});
_5c(_62);
if(_61){
(_61.provides||(_61.provides=[])).push(function(){
_62.result=_6.getObject(mid);
delete _62.provides;
_62.executed!==_58&&_5e(_62);
});
}
return _62.result;
};
_2.add("config-publishRequireResult",1,0,0);
_1.require=function(_63,_64){
function _65(mid,_66){
var _67=_1c(_f(mid),_3.module);
if(_59.length&&_59[0].finish){
_59[0].finish.push(mid);
return undefined;
}
if(_67.executed){
return _67.result;
}
_66&&(_67.result=_56);
var _68=_60();
_1d(_67);
if(_67.executed!==_58&&_67.injected===_55){
_53.holdIdle();
_5f(_67);
_53.releaseIdle();
}
if(_67.executed){
return _67.result;
}
if(_68==_54){
if(_67.cjs){
_5b.unshift(_67);
}else{
_59.length&&(_59[0].finish=[mid]);
}
}else{
_5b.push(_67);
}
return undefined;
};
var _69=_65(_63,_64);
if(_2("config-publishRequireResult")&&!_6.exists(_63)&&_69!==undefined){
_6.setObject(_63,_69);
}
return _69;
};
_1.loadInit=function(f){
f();
};
_1.registerModulePath=function(_6a,_6b){
var _6c={};
_6c[_6a.replace(/\./g,"/")]=_6b;
_3({paths:_6c});
};
_1.platformRequire=function(_6d){
var _6e=(_6d.common||[]).concat(_6d[_1._name]||_6d["default"]||[]),_6f;
while(_6e.length){
if(_6.isArray(_6f=_6e.shift())){
_1.require.apply(_1,_6f);
}else{
_1.require(_6f);
}
}
};
_1.requireIf=_1.requireAfterIf=function(_70,_71,_72){
if(_70){
_1.require(_71,_72);
}
};
_1.requireLocalization=function(_73,_74,_75){
_3(["../i18n"],function(_76){
_76.getLocalization(_73,_74,_75);
});
};
return {extractLegacyApiApplications:_42,require:_53.dojoRequirePlugin,loadInit:_26};
});
