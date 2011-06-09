/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define("dojo/store/Observable",["../main"],function(_1){
_1.getObject("store",true,_1);
return _1.store.Observable=function(_2){
var _3=[],_4=0;
_2.notify=function(_5,_6){
_4++;
var _7=_3.slice();
for(var i=0,l=_7.length;i<l;i++){
_7[i](_5,_6);
}
};
var _8=_2.query;
_2.query=function(_9,_a){
_a=_a||{};
var _b=_8.apply(this,arguments);
if(_b&&_b.forEach){
var _c=_1.mixin({},_a);
delete _c.start;
delete _c.count;
var _d=_2.queryEngine&&_2.queryEngine(_9,_c);
var _e=_4;
var _f=[],_10;
_b.observe=function(_11,_12){
if(_f.push(_11)==1){
_3.push(_10=function(_13,_14){
_1.when(_b,function(_15){
var _16=_15.length!=_a.count;
var i,l;
if(++_e!=_4){
throw new Error("Query is out of date, you must observe() the query prior to any data modifications");
}
var _17,_18=-1,_19=-1;
if(_14){
for(i=0,l=_15.length;i<l;i++){
var _1a=_15[i];
if(_2.getIdentity(_1a)==_14){
_17=_1a;
_18=i;
if(_d||!_13){
_15.splice(i,1);
}
break;
}
}
}
if(_d){
if(_13&&(_d.matches?_d.matches(_13):_d([_13]).length)){
if(_18>-1){
_15.splice(_18,0,_13);
}else{
_15.push(_13);
}
_19=_1.indexOf(_d(_15),_13);
if((_a.start&&_19==0)||(!_16&&_19==_15.length-1)){
_19=-1;
}
}
}else{
if(_13){
_19=_18>=0?_18:(_2.defaultIndex||0);
}
}
if((_18>-1||_19>-1)&&(_12||!_d||(_18!=_19))){
var _1b=_f.slice();
for(i=0;_11=_1b[i];i++){
_11(_13||_17,_18,_19);
}
}
});
});
}
return {cancel:function(){
_f.splice(_1.indexOf(_f,_11),1);
if(!_f.length){
_3.splice(_1.indexOf(_3,_10),1);
}
}};
};
}
return _b;
};
var _1c;
function _1d(_1e,_1f){
var _20=_2[_1e];
if(_20){
_2[_1e]=function(_21){
if(_1c){
return _20.apply(this,arguments);
}
_1c=true;
try{
return _1.when(_20.apply(this,arguments),function(_22){
_1f((typeof _22=="object"&&_22)||_21);
return _22;
});
}
finally{
_1c=false;
}
};
}
};
_1d("put",function(_23){
_2.notify(_23,_2.getIdentity(_23));
});
_1d("add",function(_24){
_2.notify(_24);
});
_1d("remove",function(id){
_2.notify(undefined,id);
});
return _2;
};
});
