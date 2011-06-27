/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/store/Observable",["dojo/_base/kernel","dojo/_base/lang","dojo/_base/Deferred","dojo/_base/array"],function(_1){
_1.getObject("store",true,_1);
return _1.store.Observable=function(_2){
var _3,_4=[],_5=0;
_2.notify=function(_6,_7){
_5++;
var _8=_4.slice();
for(var i=0,l=_8.length;i<l;i++){
_8[i](_6,_7);
}
};
var _9=_2.query;
_2.query=function(_a,_b){
_b=_b||{};
var _c=_9.apply(this,arguments);
if(_c&&_c.forEach){
var _d=_1.mixin({},_b);
delete _d.start;
delete _d.count;
var _e=_2.queryEngine&&_2.queryEngine(_a,_d);
var _f=_5;
var _10=[],_11;
_c.observe=function(_12,_13){
if(_10.push(_12)==1){
_4.push(_11=function(_14,_15){
_1.when(_c,function(_16){
var _17=_16.length!=_b.count;
var i,l;
if(++_f!=_5){
throw new Error("Query is out of date, you must observe() the query prior to any data modifications");
}
var _18,_19=-1,_1a=-1;
if(_15!==_3){
for(i=0,l=_16.length;i<l;i++){
var _1b=_16[i];
if(_2.getIdentity(_1b)==_15){
_18=_1b;
_19=i;
if(_e||!_14){
_16.splice(i,1);
}
break;
}
}
}
if(_e){
if(_14&&(_e.matches?_e.matches(_14):_e([_14]).length)){
if(_19>-1){
_16.splice(_19,0,_14);
}else{
_16.push(_14);
}
_1a=_1.indexOf(_e(_16),_14);
if((_b.start&&_1a==0)||(!_17&&_1a==_16.length-1)){
_1a=-1;
}
}
}else{
if(_14){
_1a=_19>=0?_19:(_2.defaultIndex||0);
}
}
if((_19>-1||_1a>-1)&&(_13||!_e||(_19!=_1a))){
var _1c=_10.slice();
for(i=0;_12=_1c[i];i++){
_12(_14||_18,_19,_1a);
}
}
});
});
}
return {cancel:function(){
_10.splice(_1.indexOf(_10,_12),1);
if(!_10.length){
_4.splice(_1.indexOf(_4,_11),1);
}
}};
};
}
return _c;
};
var _1d;
function _1e(_1f,_20){
var _21=_2[_1f];
if(_21){
_2[_1f]=function(_22){
if(_1d){
return _21.apply(this,arguments);
}
_1d=true;
try{
return _1.when(_21.apply(this,arguments),function(_23){
_20((typeof _23=="object"&&_23)||_22);
return _23;
});
}
finally{
_1d=false;
}
};
}
};
_1e("put",function(_24){
_2.notify(_24,_2.getIdentity(_24));
});
_1e("add",function(_25){
_2.notify(_25);
});
_1e("remove",function(id){
_2.notify(undefined,id);
});
return _2;
};
});
